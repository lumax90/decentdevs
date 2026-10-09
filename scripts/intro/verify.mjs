import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { basename, join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { binary, PUBLIC, readScript, ROOT, WORK } from './common.mjs';

const script = await readScript();
const timing = JSON.parse(await readFile(join(ROOT, 'remotion', 'intro', 'timing.json'), 'utf8'));
assert.equal(timing.ready, true);
assert.equal(timing.durationInFrames, 3600);
assert.equal(timing.fps, 60);
let next = 0;
for (const c of timing.chapters) {
  assert.equal(c.from, next, `Non-contiguous scene: ${c.id}`);
  assert.ok(c.voiceFrom >= c.from);
  assert.ok(c.voiceFrom + c.voiceDurationInFrames <= c.from + c.durationInFrames, `Truncated narration: ${c.id}`);
  next += c.durationInFrames;
}
assert.equal(next, 3600);
for (let i = 0; i < timing.captions.length; i++) {
  const c = timing.captions[i];
  assert.ok(c.start >= 0 && c.end > c.start && c.end <= 60);
  if (i) assert.ok(timing.captions[i - 1].end <= c.start + .002, 'Overlapping captions.');
}
const clean = s => s.normalize('NFC').replace(/\s+/g, '');
assert.equal(clean(timing.captions.map(c => c.text).join(' ')), clean(script.chapters.map(c => c.text).join(' ')), 'Incomplete transcript.');

const file = process.argv[2] ? resolve(ROOT, process.argv[2]) : join(PUBLIC, 'decent-devs-intro.mp4');
const probe = JSON.parse(execFileSync(binary('ffprobe'), ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,codec_type,width,height,pix_fmt,r_frame_rate,nb_frames,sample_rate,channels', '-of', 'json', file], { encoding: 'utf8' }));
const video = probe.streams.find(s => s.codec_type === 'video');
const audio = probe.streams.find(s => s.codec_type === 'audio');
assert.equal(video.width, 1920);
assert.equal(video.height, 1080);
assert.equal(video.r_frame_rate, '60/1');
assert.equal(Number(video.nb_frames), 3600);
assert.equal(video.codec_name, 'h264');
// ffprobe names full-range 8-bit 4:2:0 "yuvj420p". Both are browser-compatible H.264.
assert.ok(['yuv420p', 'yuvj420p'].includes(video.pix_fmt), 'Expected 8-bit 4:2:0 video.');
assert.equal(audio.channels, 2);
assert.equal(audio.sample_rate, '48000');
assert.ok(Math.abs(Number(probe.format.duration) - 60) < .06);

const measured = spawnSync(binary('ffmpeg'), ['-hide_banner', '-i', file, '-vn', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=8:print_format=json', '-f', 'null', process.platform === 'win32' ? 'NUL' : '/dev/null'], { encoding: 'utf8' });
assert.equal(measured.status, 0, measured.stderr.slice(-1500));
const level = JSON.parse(measured.stderr.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0] || 'null');
assert.ok(level && Number(level.input_tp) <= -.5, 'Audio peaks need attention.');
assert.ok(Math.abs(Number(level.input_i) + 16) < 1.5, 'Narration loudness needs attention.');
const approvedMix = basename(file) === 'decent-devs-digital-gravity-voice-music.mp4';
const mixReport = JSON.parse(await readFile(approvedMix ? join(WORK, 'music-candidates', 'digital-gravity', 'voice-and-music', 'preview-report.json') : join(WORK, 'mix-report.json'), 'utf8'));
if (approvedMix) {
  assert.equal(mixReport.source, 'Digital_Gravity.wav');
  assert.equal(mixReport.effectsEnabled, false, 'The approved mix contains voice and music only.');
}
const voiceMetadata = await Promise.all(script.chapters.map(c => readFile(join(WORK, 'voice', `${c.id}.json`), 'utf8').then(JSON.parse)));
assert.ok(voiceMetadata.every(m => m.voiceId === timing.voiceId), 'Mixed voices in the source files.');
assert.equal(new Set(voiceMetadata.map(m => m.modelId)).size, 1, 'Mixed models in the source files.');
const result = { valid: true, file: basename(file), sha256: createHash('sha256').update(await readFile(file)).digest('hex'), voiceId: timing.voiceId, modelId: voiceMetadata[0].modelId, voiceSettings: voiceMetadata[0].settings, narrationLanguage: 'tr', voicePlaybackRate: timing.speed, musicSource: approvedMix ? 'Digital Gravity — user supplied' : mixReport.musicSource, ...(approvedMix ? { effectsEnabled: false } : {}), durationSeconds: Number(probe.format.duration), frames: Number(video.nb_frames), width: video.width, height: video.height, fps: 60, videoCodec: video.codec_name, audioCodec: audio.codec_name, captions: timing.captions.length, integratedLUFS: Number(level.input_i), truePeakDBTP: Number(level.input_tp), sizeMB: Number((Number(probe.format.size) / 1024 / 1024).toFixed(2)) };
await writeFile(join(WORK, 'verification.json'), JSON.stringify(result, null, 2));
await writeFile(join(WORK, `${basename(file, '.mp4')}-manifest.json`), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
