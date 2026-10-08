import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const portable = process.platform === 'win32' && process.env.LOCALAPPDATA
  ? join(process.env.LOCALAPPDATA, 'Temp', 'opencode', 'runtimes', 'python', 'python.exe')
  : '';
const python = process.env.PYTHON_BIN || (portable && existsSync(portable) ? portable : process.platform === 'win32' ? 'python' : 'python3');
const result = spawnSync(python, [resolve('scripts/generate_audio.py')], { stdio: 'inherit' });
if (result.error) {
  console.error('Python 3 gerekli. PYTHON_BIN ile Python çalıştırılabilir dosyasını belirtebilirsiniz.');
  process.exitCode = 1;
} else process.exitCode = result.status ?? 1;
