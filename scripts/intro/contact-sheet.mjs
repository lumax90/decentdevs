import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';
import sharp from 'sharp';
import { PUBLIC, ROOT, WORK } from './common.mjs';

const timing = JSON.parse(await readFile(join(ROOT, 'remotion', 'intro', 'timing.json'), 'utf8'));
const folder = join(WORK, 'frames');
await mkdir(folder, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || (process.platform === 'win32' && existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe') ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined);
const serveUrl = await bundle({ entryPoint: join(ROOT, 'remotion', 'intro', 'index.ts'), publicDir: join(ROOT, 'public') });
const browser = await openBrowser('chrome', { browserExecutable, logLevel: 'error' });
const targets = timing.chapters.flatMap(c => [.24, .68].map(fraction => ({ id: c.id, frame: c.from + Math.floor(c.durationInFrames * fraction) })));
try {
  const composition = await selectComposition({ serveUrl, id: timing.ready ? 'DecentIntro' : 'DecentIntroAnimatic', puppeteerInstance: browser, logLevel: 'error' });
  const layers = [];
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const output = join(folder, `${String(i + 1).padStart(2, '0')}-${target.id}.jpg`);
    await renderStill({ serveUrl, composition, puppeteerInstance: browser, output, frame: target.frame, imageFormat: 'jpeg', jpegQuality: 91, logLevel: 'error' });
    layers.push({ input: await sharp(output).resize(640, 360).toBuffer(), left: (i % 3) * 640, top: Math.floor(i / 3) * 397 });
    const label = `${String(i + 1).padStart(2, '0')} / ${target.id} / ${(target.frame / timing.fps).toFixed(2)}s`;
    layers.push({ input: Buffer.from(`<svg width="640" height="37"><rect width="640" height="37" fill="#182017"/><text x="15" y="24" font-family="Arial" font-size="15" fill="#d5e6c7">${label}</text></svg>`), left: (i % 3) * 640, top: Math.floor(i / 3) * 397 + 360 });
  }
  await sharp({ create: { width: 1920, height: Math.ceil(targets.length / 3) * 397, channels: 3, background: '#182017' } }).composite(layers).jpeg({ quality: 92 }).toFile(join(WORK, 'contact-sheet.jpg'));
  const final = timing.chapters.at(-1);
  const posterComposition = await selectComposition({ serveUrl, id: timing.ready ? 'DecentIntroClean' : 'DecentIntroAnimatic', puppeteerInstance: browser, logLevel: 'error' });
  await renderStill({ serveUrl, composition: posterComposition, puppeteerInstance: browser, output: join(PUBLIC, 'poster.jpg'), frame: final.from + Math.floor(final.durationInFrames * .65), imageFormat: 'jpeg', jpegQuality: 92, logLevel: 'error' });
  await writeFile(join(WORK, 'frames.json'), JSON.stringify(targets, null, 2));
  console.log(`Rendered ${targets.length} review frames and the poster.`);
} finally { await browser.close({ silent: true }); }
