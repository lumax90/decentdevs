import { existsSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { ensureDirectories, eleven, loadEnvironment, WORK } from './common.mjs';

loadEnvironment();
await ensureDirectories();
const folder = join(WORK, 'sound');
await mkdir(folder, { recursive: true });
const force = process.argv.includes('--force');
const assets = [
  {
    name: 'music', path: '/v1/music?output_format=mp3_44100_128',
    body: {
      model_id: 'music_v1', music_length_ms: 60000, force_instrumental: true,
      prompt: 'Original instrumental underscore for a warm, refined, playful digital product studio film. Exactly 60 seconds. Steady 120 BPM in 4/4. D major with warm major-seventh harmonies, sparse rounded analog plucks, muted soft bass, dry tactile percussion and a little airy texture. A clear, modest rhythmic pulse, lots of breathing room in the midrange for a spoken voiceover. Editorial design launch film, quietly confident, tasteful, human and curious. Clean single-note opening. Gentle movement by 8 seconds, a subtle hint of tension around 12 to 20 seconds, confident warm lift around 32 to 48 seconds. A small memorable three-note resolution and a clean ending at 60 seconds. Instrumental only: no vocals, no choir, no wordless voices. No epic orchestral swell, no aggressive EDM drop.',
    },
  },
  {
    name: 'swish', path: '/v1/sound-generation?output_format=mp3_44100_128',
    body: { text: 'A single short refined soft airy swish, like a thick paper card sliding smoothly past the listener and settling with a gentle tactile click. Close-up, clean, subtle stereo width. No music and no voice.', duration_seconds: 1.1, prompt_influence: 0.5, model_id: 'eleven_text_to_sound_v2' },
  },
  {
    name: 'confirm', path: '/v1/sound-generation?output_format=mp3_44100_128',
    body: { text: 'A single elegant friendly user-interface confirmation sound: two very short soft rounded glass notes rising gently, intimate, warm and restrained, clean silence afterwards. No voice, no music bed, no harsh high frequencies.', duration_seconds: 0.7, prompt_influence: 0.6, model_id: 'eleven_text_to_sound_v2' },
  },
];

for (const asset of assets) {
  const output = join(folder, `${asset.name}.mp3`);
  if (existsSync(output) && !force) { console.log(`${asset.name}: önbellekten.`); continue; }
  try {
    const response = await eleven(asset.path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(asset.body) });
    await writeFile(output, Buffer.from(await response.arrayBuffer()));
    await writeFile(join(folder, `${asset.name}.json`), JSON.stringify({ provider: 'ElevenLabs', request: asset.body, requestId: response.headers.get('request-id'), reportedCost: response.headers.get('character-cost'), createdAt: new Date().toISOString() }, null, 2));
    await writeFile(join(folder, `${asset.name}-availability.json`), JSON.stringify({ available: true, provider: 'ElevenLabs', checkedAt: new Date().toISOString() }, null, 2));
    console.log(`${asset.name}: ElevenLabs kaynağı hazır.`);
  } catch (error) {
    console.log(`${asset.name}: ${error.message}`);
    console.log('Bu katman Python ses tasarımıyla hazırlanacak.');
    await writeFile(join(folder, `${asset.name}-availability.json`), JSON.stringify({ available: false, message: error.message, checkedAt: new Date().toISOString() }, null, 2));
  }
}
