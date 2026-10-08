import { bundle } from '@remotion/bundler';
import { getCompositions, openBrowser, renderMedia, renderStill } from '@remotion/renderer';
import { existsSync } from 'node:fs';
import { copyFile, cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { TOUR_FPS, TOUR_FRAMES, worldTourStops } from '../../src/lib/world-tour';

const root = resolve(import.meta.dirname, '../..');
const output = resolve(root, 'public/hero/tour');
const artifacts = resolve(root, 'artifacts/hero/tour');
const assets = resolve(artifacts, 'assets');
await mkdir(output, { recursive: true });
await mkdir(artifacts, { recursive: true });
await mkdir(assets, { recursive: true });
await cp(resolve(root, 'public/fonts'), resolve(assets, 'fonts'), { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || (existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe') ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined);
const browser = await openBrowser('chrome', { browserExecutable });
const only = process.argv.find(argument => argument.startsWith('--scene='))?.slice('--scene='.length);
try {
  const serveUrl = await bundle({ entryPoint: resolve(root, 'remotion/tour/index.tsx'), publicDir: assets, outDir: resolve(artifacts, 'bundle') });
  const compositions = await getCompositions(serveUrl, { puppeteerInstance: browser });
  for (const stop of worldTourStops.filter(stop => !only || only.split(',').includes(stop.scene))) {
    const composition = compositions.find(composition => composition.id === stop.composition)!;
    if (!process.argv.includes('--stills-only')) {
      await renderMedia({ serveUrl, composition, puppeteerInstance: browser, codec: 'h264', crf: 18, pixelFormat: 'yuv420p', muted: true, concurrency: 2, outputLocation: resolve(artifacts, `${stop.scene}.mp4`) });
      await copyFile(resolve(artifacts, `${stop.scene}.mp4`), resolve(output, `${stop.scene}.mp4`));
    }
    await renderStill({ serveUrl, composition, puppeteerInstance: browser, frame: stop.posterFrame, output: resolve(artifacts, `${stop.scene}.png`), imageFormat: 'png' });
    await sharp(resolve(artifacts, `${stop.scene}.png`)).webp({ quality: 88 }).toFile(resolve(output, `${stop.scene}.webp`));
    console.log(`Ready: ${stop.label} / ${stop.scene}`);
  }
  const completed = worldTourStops.filter(stop => existsSync(resolve(output, `${stop.scene}.webp`)));
  const thumbnails = await Promise.all(completed.map(async stop => ({ input: await sharp(resolve(output, `${stop.scene}.webp`)).resize(320, 180).toBuffer(), stop })));
  await sharp({ create: { width: 640, height: Math.ceil(completed.length / 2) * 180, channels: 3, background: '#151719' } }).composite(thumbnails.map(({ input }, index) => ({ input, left: index % 2 * 320, top: Math.floor(index / 2) * 180 }))).png().toFile(resolve(artifacts, 'contact-sheet.png'));
  await writeFile(resolve(output, 'manifest.json'), JSON.stringify({ generator: 'Remotion', fps: TOUR_FPS, frames: TOUR_FRAMES, width: 640, height: 360, audio: false, scenes: worldTourStops.map(stop => ({ id: stop.scene, composition: stop.composition, location: stop.location })) }, null, 2) + '\n');
} finally { await browser.close({ silent: true }); }
