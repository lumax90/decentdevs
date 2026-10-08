import { existsSync } from 'node:fs';
import { cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file);
}
const standalone = resolve('.next/standalone');
if (!existsSync(resolve(standalone, 'server.js'))) throw new Error('Önce npm run build çalıştırılmalı.');
await cp('public', resolve(standalone, 'public'), { recursive: true });
await cp('.next/static', resolve(standalone, '.next/static'), { recursive: true });
const args = process.argv.slice(2);
const portIndex = args.findIndex(arg => arg === '--port' || arg === '-p');
const port = portIndex >= 0 ? args[portIndex + 1] : process.env.PORT || '3000';
const child = spawn(process.execPath, [resolve(standalone, 'server.js')], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port, HOSTNAME: '0.0.0.0', DATA_DIR: resolve(process.env.DATA_DIR || './.data') },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', code => { process.exitCode = code ?? 0; });
