import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getStore } from '../src/lib/server/store';
import { briefMarkdown } from '../src/lib/brief';

async function main() {
  if (existsSync('.env.local')) process.loadEnvFile('.env.local');
  else if (existsSync('.env')) process.loadEnvFile('.env');
  const output = resolve(process.env.DATA_DIR || './.data', 'exports');
  await mkdir(output, { recursive: true });
  const store = getStore();
  const leads = store.all();
  for (const lead of leads) await writeFile(resolve(output, `${lead.reference}.md`), briefMarkdown(lead.draft, lead.reference), 'utf8');
  console.log(`${leads.length} brief exported to ${output}`);
  store.close();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
