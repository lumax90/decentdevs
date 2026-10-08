import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { binary, ensureDirectories, loadEnvironment, probe, PUBLIC, python, readScript, ROOT, runFfmpeg, WORK } from './common.mjs';
import { alignmentWords, allocateChapters, captionsForWords, vtt } from './timeline.mjs';

loadEnvironment();
await ensureDirectories();
const script = await readScript();
const clips = [];
for (const chapter of script.chapters) {
  const metadata = JSON.parse(await readFile(join(WORK, 'voice', `${chapter.id}.json`), 'utf8'));
  if (metadata.text !== chapter.text) throw new Error(`${chapter.id}: metin değişmiş. Önce intro:narrate çalıştırın.`);
  const starts = metadata.alignment.character_start_times_seconds;
  const ends = metadata.alignment.character_end_times_seconds;
  const firstIndex = metadata.alignment.characters.findIndex(c => c.trim());
  const trimStart = Math.max(0, starts[Math.max(0, firstIndex)] - .065);
  const trimEnd = Math.max(...ends) + .10;
  const source = join(WORK, 'voice', `${chapter.id}.mp3`);
  const raw = join(WORK, 'voice', `${chapter.id}-raw.wav`);
  runFfmpeg(['-ss', trimStart.toFixed(5), '-i', source, '-t', (trimEnd - trimStart).toFixed(5), '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', raw]);
  clips.push({ id: chapter.id, metadata, raw, trimStart, duration: Number(probe(raw).format.duration) });
}
if (new Set(clips.map(c => c.metadata.voiceId)).size !== 1 || new Set(clips.map(c => c.metadata.modelId)).size !== 1) {
  throw new Error('Bölümler farklı seslerle üretilmiş. intro:narrate ile aynı ses seçimini tüm bölümlere uygulayın.');
}

let speed = 1;
const maxSpeed = Number(process.env.INTRO_MAX_PLAYBACK_SPEED || 1.14);
if (!Number.isFinite(maxSpeed) || maxSpeed < 1 || maxSpeed > 1.14) throw new Error('INTRO_MAX_PLAYBACK_SPEED must be between 1 and 1.14.');
let chapters = allocateChapters(script, clips.map(c => c.duration));
while (!chapters && speed < maxSpeed) {
  speed = Math.round((speed + .01) * 100) / 100;
  chapters = allocateChapters(script, clips.map(c => c.duration / speed));
}
if (!chapters) throw new Error('Ses, doğal bir tempoyla 60 saniyeye sığmıyor. Metni kısaltıp tekrar seslendirin.');

const durations = [];
for (const clip of clips) {
  const out = join(WORK, 'voice', `${clip.id}.wav`);
  runFfmpeg(['-i', clip.raw, ...(speed === 1 ? [] : ['-af', `atempo=tempo=${speed.toFixed(5)}`]), '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', out]);
  durations.push(Number(probe(out).format.duration));
}
chapters = allocateChapters(script, durations);
if (!chapters) throw new Error('Ses işleme sonrasında zaman çizelgesi yeniden düzenlenmeli.');
const captions = clips.flatMap((clip, i) => captionsForWords(alignmentWords(clip.metadata.alignment, clip.trimStart, speed), chapters[i].voiceFrom / script.fps, (chapters[i].from + chapters[i].durationInFrames) / script.fps));
for (let i = 0; i < captions.length - 1; i++) captions[i].end = Math.min(captions[i].end, captions[i + 1].start);

for (const name of ['music', 'swish', 'confirm']) {
  const source = join(WORK, 'sound', `${name}.mp3`);
  if (existsSync(source)) runFfmpeg(['-i', source, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', join(WORK, 'sound', `${name}.wav`)]);
}

const timing = { ready: false, fps: script.fps, durationInFrames: script.durationInFrames, bpm: 120, voiceId: clips[0].metadata.voiceId, speed, chapters, captions };
const timingPath = join(ROOT, 'remotion', 'intro', 'timing.json');
await writeFile(timingPath, JSON.stringify(timing, null, 2));
execFileSync(python(), [join(ROOT, 'scripts', 'intro', 'mix_audio.py')], { stdio: 'inherit' });
const rawMaster = join(WORK, 'raw-master.wav');
const measure = spawnSync(binary('ffmpeg'), ['-hide_banner', '-i', rawMaster, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=8:print_format=json', '-f', 'null', process.platform === 'win32' ? 'NUL' : '/dev/null'], { encoding: 'utf8' });
if (measure.status !== 0) throw new Error('Ses seviyesi ölçülemedi: ' + measure.stderr.slice(-800));
const loudness = JSON.parse(measure.stderr.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0] || 'null');
if (!loudness || !Number.isFinite(Number(loudness.input_i))) throw new Error('Geçersiz ses seviyesi ölçümü.');
const filter = `loudnorm=I=-16:TP=-1.5:LRA=8:measured_I=${loudness.input_i}:measured_TP=${loudness.input_tp}:measured_LRA=${loudness.input_lra}:measured_thresh=${loudness.input_thresh}:offset=${loudness.target_offset}:linear=true`;
runFfmpeg(['-i', rawMaster, '-af', filter, '-t', '60', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', join(PUBLIC, 'master.wav')]);
await writeFile(join(WORK, 'loudness.json'), JSON.stringify({ targetIntegratedLUFS: -16, targetTruePeakDBTP: -1.5, measurement: loudness }, null, 2));
timing.ready = true;
await writeFile(timingPath, JSON.stringify(timing, null, 2));
await writeFile(join(PUBLIC, 'captions-tr.vtt'), vtt(captions));
await writeFile(join(PUBLIC, 'narration.txt'), script.chapters.map(c => c.text).join('\n\n'));
await writeFile(join(WORK, 'timing-report.json'), JSON.stringify({ originalVoiceSeconds: clips.reduce((n, c) => n + c.duration, 0), playbackSpeed: speed, outputSeconds: 60, captions: captions.length, chapters: chapters.map(c => ({ id: c.id, start: c.from / script.fps, duration: c.durationInFrames / script.fps, speechDuration: c.voiceDurationInFrames / script.fps })) }, null, 2));
console.log(`60 saniyelik ses hazır. ${captions.length} altyazı; konuşma hız çarpanı ${speed}.`);
