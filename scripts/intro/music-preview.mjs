import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { binary, PUBLIC, python, ROOT, runFfmpeg, WORK } from './common.mjs';

const candidateRoot = join(WORK, 'music-candidates', 'digital-gravity');
const noEffects = process.argv.includes('--no-fx');
const candidate = noEffects ? join(candidateRoot, 'voice-and-music') : candidateRoot;
const output = join(PUBLIC, 'music-previews');
await mkdir(output, { recursive: true });
await mkdir(candidate, { recursive: true });
const master = join(PUBLIC, 'master.wav');
const originalHash = createHash('sha256').update(await readFile(master)).digest('hex');
const baseVideo = join(PUBLIC, 'decent-devs-intro-markus-v4.mp4');

execFileSync(python(), [join(ROOT, 'scripts', 'intro', 'mix_audio.py')], {
  stdio: 'inherit',
  env: { ...process.env, INTRO_MUSIC_FILE: join(candidateRoot, 'source.wav'), INTRO_MUSIC_LABEL: 'Digital Gravity — user supplied', INTRO_MIX_OUTPUT_DIR: candidate, INTRO_FX_GAIN: noEffects ? '0' : '1' },
});
const raw = join(candidate, 'raw-master.wav');
const measured = spawnSync(binary('ffmpeg'), ['-hide_banner', '-i', raw, '-vn', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=8:print_format=json', '-f', 'null', process.platform === 'win32' ? 'NUL' : '/dev/null'], { encoding: 'utf8' });
assert.equal(measured.status, 0, measured.stderr.slice(-1200));
const level = JSON.parse(measured.stderr.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0] || 'null');
assert.ok(level && Number.isFinite(Number(level.input_i)));
const filter = `loudnorm=I=-16:TP=-1.5:LRA=8:measured_I=${level.input_i}:measured_TP=${level.input_tp}:measured_LRA=${level.input_lra}:measured_thresh=${level.input_thresh}:offset=${level.target_offset}:linear=true`;
const normalized = join(candidate, 'master-preview.wav');
runFfmpeg(['-i', raw, '-af', filter, '-t', '60', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', normalized]);
const videoPath = join(output, noEffects ? 'decent-devs-digital-gravity-voice-music.mp4' : 'decent-devs-digital-gravity-preview.mp4');
runFfmpeg(['-i', baseVideo, '-i', normalized, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-t', '60', '-movflags', '+faststart', videoPath]);

assert.equal(createHash('sha256').update(await readFile(master)).digest('hex'), originalHash, 'The original production master was modified.');
const media = JSON.parse(execFileSync(binary('ffprobe'), ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_type,codec_name,width,height,nb_frames,r_frame_rate,channels,sample_rate', '-of', 'json', videoPath], { encoding: 'utf8' }));
const video = media.streams.find(s => s.codec_type === 'video');
const audio = media.streams.find(s => s.codec_type === 'audio');
assert.equal(Number(video.nb_frames), 3600);
assert.equal(video.r_frame_rate, '60/1');
assert.equal(audio.channels, 2);
assert.ok(Math.abs(Number(media.format.duration) - 60) < .06);
await writeFile(join(candidate, 'preview-report.json'), JSON.stringify({ source: 'Digital_Gravity.wav', effectsEnabled: !noEffects, baseVideo, videoPath, targetLUFS: -16, sourceAnalysis: JSON.parse(await readFile(join(candidateRoot, 'analysis.json'), 'utf8')), normalizedMix: level, media }, null, 2));
console.log(JSON.stringify({ preview: videoPath, effectsEnabled: !noEffects, durationSeconds: Number(media.format.duration), frames: Number(video.nb_frames), audioCodec: audio.codec_name, sizeMB: Number((Number(media.format.size) / 1048576).toFixed(2)) }, null, 2));
