import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { ensureDirectories, eleven, loadEnvironment, readScript, WORK } from './common.mjs';

loadEnvironment();
await ensureDirectories();
const script = await readScript();
const args = process.argv.slice(2);
const voiceArg = args.indexOf('--voice');
const voiceId = voiceArg >= 0 ? args[voiceArg + 1] : process.env.ELEVENLABS_VOICE_ID;
if (!voiceId) throw new Error('Bir ses seçin: ELEVENLABS_VOICE_ID veya --voice VOICE_ID. Ses listesi için npm run intro:voices.');
const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
function setting(name, fallback, min, max) {
  const value = Number(process.env[name]?.trim() || fallback);
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${name} must be between ${min} and ${max}.`);
  return value;
}
const v4 = modelId === 'eleven_v4' || modelId === 'eleven_v4_turbo';
const voiceSettings = {
  stability: setting('ELEVENLABS_STABILITY', v4 ? 0.36 : 0.62, 0, 1),
  similarity_boost: setting('ELEVENLABS_SIMILARITY', v4 ? 1 : 0.78, 0, 1),
  speed: setting('ELEVENLABS_SPEED', 1, 0.7, 1.2),
  ...(v4 ? {} : { style: setting('ELEVENLABS_STYLE', 0, 0, 1), use_speaker_boost: true }),
};
const force = args.includes('--force');
const onlyArg = args.indexOf('--only');
const only = onlyArg >= 0 ? args[onlyArg + 1] : null;
let generated = 0;

for (let index = 0; index < script.chapters.length; index++) {
  const chapter = script.chapters[index];
  if (only && only !== chapter.id) continue;
  const body = { text: chapter.text, model_id: modelId, voice_settings: voiceSettings, seed: 1937 + index, ...(v4 ? {} : { previous_text: script.chapters[index - 1]?.text, next_text: script.chapters[index + 1]?.text }) };
  const fingerprint = createHash('sha256').update(JSON.stringify({ voiceId, body })).digest('hex');
  const metadataPath = join(WORK, 'voice', `${chapter.id}.json`);
  const audioPath = join(WORK, 'voice', `${chapter.id}.mp3`);
  if (!force && existsSync(metadataPath) && existsSync(audioPath)) {
    const cached = JSON.parse(await readFile(metadataPath, 'utf8'));
    if (cached.fingerprint === fingerprint) { console.log(`${chapter.id}: önbellekteki ses kullanıldı.`); continue; }
  }
  const response = await eleven(`/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=mp3_44100_128`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!result.audio_base64 || !result.alignment?.characters?.length) throw new Error(`${chapter.id}: ses veya zaman damgaları eksik. Üretim yanıtı kontrol edilmeli.`);
  await writeFile(audioPath, Buffer.from(result.audio_base64, 'base64'));
  await writeFile(metadataPath, JSON.stringify({ fingerprint, voiceId, modelId, settings: voiceSettings, text: chapter.text, requestId: response.headers.get('request-id'), reportedCharacterCost: response.headers.get('character-cost'), submittedCharacters: chapter.text.length, alignment: result.alignment, normalizedAlignment: result.normalized_alignment, generatedAt: new Date().toISOString() }, null, 2));
  generated++;
  console.log(`${chapter.id}: ses ve karakter zamanları kaydedildi.`);
}
await writeFile(join(WORK, 'selected-voice.json'), JSON.stringify({ voiceId, modelId, narrationLanguage: 'tr', source: 'ElevenLabs API' }, null, 2));
console.log(`${generated} yeni ses üretildi. Sonraki adım: npm run intro:prepare`);
