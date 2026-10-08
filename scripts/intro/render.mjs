import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ensureDirectories, PUBLIC, ROOT } from './common.mjs';

await ensureDirectories();
const args = process.argv.slice(2);
const animatic = args.includes('--animatic');
const clean = args.includes('--clean');
const stillIndex = args.indexOf('--still');
const outputIndex = args.indexOf('--output');
if (outputIndex >= 0 && !args[outputIndex + 1]) throw new Error('--output için bir dosya yolu gerekli.');
const timing = JSON.parse(await readFile(join(ROOT, 'remotion', 'intro', 'timing.json'), 'utf8'));
if (!animatic && (!timing.ready || !existsSync(join(PUBLIC, 'master.wav')))) throw new Error('Önce intro:narrate ve intro:prepare ile ses dosyalarını hazırlayın.');
const chrome = process.env.REMOTION_BROWSER_EXECUTABLE || (process.platform === 'win32' && existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe') ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '');
const composition = animatic ? 'DecentIntroAnimatic' : clean ? 'DecentIntroClean' : 'DecentIntro';
const entry = join(ROOT, 'remotion', 'intro', 'index.ts');
const cli = join(ROOT, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
let command;
if (stillIndex >= 0) {
  const frame = Number(args[stillIndex + 1]);
  const output = args[stillIndex + 2] || join(PUBLIC, 'poster.jpg');
  command = ['still', entry, composition, output, `--frame=${frame}`];
} else {
  const output = outputIndex >= 0 ? resolve(ROOT, args[outputIndex + 1]) : animatic ? join(ROOT, 'artifacts', 'intro', 'animatic.mp4') : join(PUBLIC, clean ? 'decent-devs-intro-clean.mp4' : 'decent-devs-intro.mp4');
  command = ['render', entry, composition, output, '--codec=h264', '--crf=18', '--audio-bitrate=256k', '--pixel-format=yuv420p', '--concurrency=3'];
}
if (chrome) command.push(`--browser-executable=${chrome}`);
command.push('--log=error');
const result = spawnSync(process.execPath, [cli, ...command], { stdio: 'inherit', cwd: ROOT });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
