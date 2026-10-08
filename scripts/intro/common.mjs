import { existsSync } from 'node:fs';
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const WORK = join(ROOT, 'artifacts', 'intro');
export const PUBLIC = join(ROOT, 'public', 'film', 'intro');

export function loadEnvironment() {
  for (const file of ['.env.local', '.env']) {
    const path = join(ROOT, file);
    if (existsSync(path)) process.loadEnvFile(path);
  }
}

export async function readScript() { return JSON.parse(await readFile(join(ROOT, 'remotion', 'intro', 'script.json'), 'utf8')); }
export async function ensureDirectories() {
  await Promise.all([mkdir(WORK, { recursive: true }), mkdir(PUBLIC, { recursive: true }), mkdir(join(WORK, 'voice'), { recursive: true })]);
}

export function binary(name) {
  const override = process.env[`${name.toUpperCase()}_BIN`];
  if (override) return override;
  if (process.platform === 'win32') {
    const candidate = join(ROOT, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', `${name}.exe`);
    if (existsSync(candidate)) return candidate;
  }
  return name;
}

export function probe(path) {
  const raw = execFileSync(binary('ffprobe'), ['-v', 'error', '-show_entries', 'format=duration:stream=codec_name,codec_type,sample_rate,channels', '-of', 'json', path], { encoding: 'utf8' });
  return JSON.parse(raw);
}

export function runFfmpeg(args) { execFileSync(binary('ffmpeg'), ['-y', '-v', 'error', ...args], { stdio: ['ignore', 'inherit', 'inherit'] }); }

export function python() {
  if (process.env.PYTHON_BIN) return process.env.PYTHON_BIN;
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
    const path = join(process.env.LOCALAPPDATA, 'Temp', 'opencode', 'runtimes', 'python', 'python.exe');
    if (existsSync(path)) return path;
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}

export async function eleven(path, init = {}) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY gerekli. Proje kökündeki .env.local dosyasına ekleyin.');
  const response = await fetch(`https://api.elevenlabs.io${path}`, {
    ...init,
    headers: { 'xi-api-key': key, ...init.headers },
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) {
    let status = '';
    let message = '';
    try {
      const result = await response.json();
      status = typeof result.detail?.status === 'string' ? result.detail.status : '';
      message = typeof result.detail?.message === 'string' ? result.detail.message.replaceAll(key, '[redacted]').slice(0, 600) : '';
    } catch { /* HTTP status is sufficient. */ }
    throw new Error(`ElevenLabs HTTP ${response.status}${status ? ` (${status})` : ''}. ${message || 'Anahtar izinlerini, ses erişimini ve kredi durumunu kontrol edin.'}`);
  }
  return response;
}
