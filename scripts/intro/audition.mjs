import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { eleven, loadEnvironment, probe, PUBLIC, ROOT, runFfmpeg, WORK } from './common.mjs';

loadEnvironment();
const spec = JSON.parse(await readFile(join(ROOT, 'remotion', 'intro', 'audition-markus.json'), 'utf8'));
const dir = join(WORK, 'auditions');
await mkdir(dir, { recursive: true });
await mkdir(PUBLIC, { recursive: true });
const raw = join(dir, 'markus.mp3');
const metadataPath = join(dir, 'markus.json');
const fingerprint = createHash('sha256').update(JSON.stringify(spec)).digest('hex');
let cached = false;
if (existsSync(raw) && existsSync(metadataPath)) cached = JSON.parse(await readFile(metadataPath, 'utf8')).fingerprint === fingerprint;
if (!cached) {
  const response = await eleven(`/v1/text-to-speech/${spec.voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: spec.text, model_id: spec.modelId, voice_settings: spec.settings, seed: 1937 }),
  });
  const result = await response.json();
  if (!result.audio_base64) throw new Error('Ses denemesi üretilemedi.');
  await writeFile(raw, Buffer.from(result.audio_base64, 'base64'));
  await writeFile(metadataPath, JSON.stringify({ ...spec, fingerprint, requestId: response.headers.get('request-id'), alignment: result.alignment, generatedAt: new Date().toISOString() }, null, 2));
}
const output = join(PUBLIC, 'markus-preview.wav');
runFfmpeg(['-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=8', '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', output]);
console.log(JSON.stringify({ name: spec.name, durationSeconds: Number(probe(output).format.duration), cached, output }, null, 2));
