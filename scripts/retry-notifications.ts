import { existsSync } from 'node:fs';
import { getStore } from '../src/lib/server/store';
import { processNotifications } from '../src/lib/server/notifications';

async function main() {
  if (existsSync('.env.local')) process.loadEnvFile('.env.local');
  else if (existsSync('.env')) process.loadEnvFile('.env');
  const store = getStore();
  store.prune();
  const count = await processNotifications(undefined, store);
  console.log(`Processed ${count} due notification jobs. Delivery state is persisted in the outbox.`);
  store.close();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
