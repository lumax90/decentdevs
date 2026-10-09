import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, constants } from 'node:fs';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { bundle } from '@remotion/bundler';
import { getCompositions, openBrowser, renderMedia, renderStill } from '@remotion/renderer';
import sharp from 'sharp';
import { binary, ROOT, runFfmpeg } from '../intro/common.mjs';

const output = join(ROOT, 'public');
const work = join(ROOT, 'artifacts', 'brand', '04');
const backup = join(work, 'before');
const film = join(output, 'film/intro/music-previews/decent-devs-digital-gravity-voice-music.mp4');
const baseFilm = join(output, 'film/intro/decent-devs-intro-markus-v4.mp4');
const includeFilm = process.argv.includes('--film');
await mkdir(backup, { recursive: true });

for (const file of ['og.png', 'apple-icon.png', 'film/intro/poster.jpg', 'film/intro/poster-mobile.webp', ...(includeFilm ? ['film/intro/music-previews/decent-devs-digital-gravity-voice-music.mp4', 'film/intro/decent-devs-intro-markus-v4.mp4'] : [])]) {
  const source = join(output, file), destination = join(backup, file.replaceAll('/', '--'));
  if (existsSync(source)) {
    try { await copyFile(source, destination, constants.COPYFILE_EXCL); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
}

function audioHash(file) {
  // Remotion's bundled FFmpeg has a WAV muxer; hash its decoded PCM payload.
  const wav = execFileSync(binary('ffmpeg'), ['-v', 'error', '-i', file, '-map', '0:a:0', '-map_metadata', '-1', '-c:a', 'pcm_s16le', '-f', 'wav', 'pipe:1'], { maxBuffer: 64 * 1024 * 1024 });
  for (let offset = 12; offset + 8 <= wav.length;) {
    const size = wav.readUInt32LE(offset + 4);
    if (wav.toString('ascii', offset, offset + 4) === 'data') {
      return createHash('sha256').update(wav.subarray(offset + 8, Math.min(wav.length, offset + 8 + size))).digest('hex');
    }
    offset += 8 + size + size % 2;
  }
  throw new Error('Decoded audio payload was not found.');
}
const approvedAudioHash = includeFilm ? audioHash(film) : null;
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || (existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe') ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined);
const browser = await openBrowser('chrome', { browserExecutable, logLevel: 'error' });
try {
  const shared = { puppeteerInstance: browser, logLevel: 'error', port: 3904 };
  const cardsUrl = await bundle({ entryPoint: join(ROOT, 'remotion/index.ts'), publicDir: output, outDir: join(work, 'cards-bundle') });
  const cards = await getCompositions(cardsUrl, shared);
  for (const [id, file] of [['SocialCard', 'og.png'], ['AppIcon', 'apple-icon.png']]) {
    const composition = cards.find(item => item.id === id);
    assert.ok(composition, `Missing composition: ${id}`);
    await renderStill({ ...shared, serveUrl: cardsUrl, composition, output: join(output, file), imageFormat: 'png' });
    console.log(`04 asset ready: ${file}`);
  }

  const introUrl = await bundle({ entryPoint: join(ROOT, 'remotion/intro/index.ts'), publicDir: output, outDir: join(work, 'intro-bundle') });
  const compositions = await getCompositions(introUrl, shared);
  const clean = compositions.find(item => item.id === 'DecentIntroClean');
  const narrated = compositions.find(item => item.id === 'DecentIntro');
  assert.ok(clean && narrated);
  const timing = JSON.parse(await readFile(join(ROOT, 'remotion/intro/timing.json'), 'utf8'));
  const signature = timing.chapters.at(-1);
  const posterFrame = signature.from + Math.floor(signature.durationInFrames * .65);
  const poster = join(output, 'film/intro/poster-04.jpg');
  const mobilePoster = join(output, 'film/intro/poster-04-mobile.webp');
  await renderStill({ ...shared, serveUrl: introUrl, composition: clean, output: poster, frame: posterFrame, imageFormat: 'jpeg', jpegQuality: 92 });
  await sharp(poster).extract({ left: 40, top: 40, width: 1100, height: 880 }).resize(880, 704).webp({ quality: 86 }).toFile(mobilePoster);
  await copyFile(poster, join(output, 'film/intro/poster.jpg'));
  await copyFile(mobilePoster, join(output, 'film/intro/poster-mobile.webp'));
  console.log('04 desktop and mobile film posters ready.');

  if (includeFilm) {
    const silent = join(work, 'intro-04-silent.mp4');
    const refreshed = join(work, 'intro-04-approved.mp4');
    let lastProgress = -1;
    await renderMedia({ ...shared, serveUrl: introUrl, composition: narrated, codec: 'h264', crf: 18, pixelFormat: 'yuv420p', muted: true, concurrency: 3, outputLocation: silent,
      onProgress: ({ progress }) => { const step = Math.floor(progress * 10); if (step !== lastProgress) { lastProgress = step; console.log(`04 film render: ${step * 10}%`); } },
    });
    // Copy the approved AAC stream directly into the refreshed visual render.
    runFfmpeg(['-i', silent, '-i', film, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'copy', '-movflags', '+faststart', refreshed]);
    assert.equal(audioHash(refreshed), approvedAudioHash, 'The approved soundtrack must remain sample-identical.');
    const media = JSON.parse(execFileSync(binary('ffprobe'), ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate,nb_frames', '-of', 'json', refreshed], { encoding: 'utf8' }));
    const video = media.streams.find(stream => stream.codec_type === 'video');
    assert.equal(video.nb_frames, '3600');
    assert.equal(video.r_frame_rate, '60/1');
    assert.equal(video.width, 1920); assert.equal(video.height, 1080);
    assert.ok(Math.abs(Number(media.format.duration) - 60) < .06);
    await copyFile(refreshed, film);
    await copyFile(refreshed, baseFilm);
    await writeFile(join(work, 'film-refresh.json'), JSON.stringify({ brand: '04', film: relative(ROOT, film), baseFilm: relative(ROOT, baseFilm), audioSha256: approvedAudioHash, audioPreserved: true, media }, null, 2));
    console.log('04 film ready; the approved soundtrack matches sample-for-sample.');
  }
} finally { await browser.close({ silent: true }); }
