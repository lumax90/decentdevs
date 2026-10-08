import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ensureDirectories, eleven, loadEnvironment, WORK } from './common.mjs';

loadEnvironment();
await ensureDirectories();
const query = new URLSearchParams({ page_size: '100', include_total_count: 'false' });
if (!process.argv.includes('--all')) query.set('language', 'tr');
const response = await eleven(`/v2/voices?${query}`);
const result = await response.json();
const voices = result.voices.map(v => ({ id: v.voice_id, name: v.name, category: v.category, labels: v.labels, description: v.description, preview: v.preview_url, languages: v.verified_languages?.map(l => ({ language: l.language, model: l.model_id, preview: l.preview_url })), quality: v.recording_quality }));
await writeFile(join(WORK, 'voice-options.json'), JSON.stringify({ voices, hasMore: result.has_more, nextPageToken: result.next_page_token }, null, 2));
console.log(JSON.stringify(voices.map(({ id, name, labels, quality }) => ({ id, name, labels, quality })), null, 2));
if (!voices.length) console.log('Türkçe etiketli ses bulunamadı. Tüm sesler için npm run intro:voices -- --all veya ELEVENLABS_VOICE_ID kullanın.');
