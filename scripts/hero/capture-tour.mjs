import { chromium, devices } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const mobile = process.argv.includes('--mobile');
const manifest = JSON.parse(await readFile(new URL('../../public/hero/tour/manifest.json', import.meta.url), 'utf8'));
const stops = manifest.scenes.map(scene => scene.location);
const browser = await chromium.launch({ channel: 'chrome' });
await mkdir('artifacts/hero/tour', { recursive: true });
try {
  const page = await browser.newPage(mobile ? { ...devices['iPhone 13'], deviceScaleFactor: 1 } : { viewport: { width: 1440, height: 1000 } });
  const errors = [];
  const results = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(process.env.HERO_REVIEW_URL || 'http://localhost:3000');
  const world = page.locator('[data-scene-state]');
  await page.waitForFunction(() => document.querySelector('[data-scene-state]')?.dataset.sceneState === 'ready');
  await world.scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  const visited = new Set();
  let previous = null;
  for (let index = 0; index < stops.length; index++) {
    try {
      await page.waitForFunction(previous => {
        const pane = document.querySelector('[data-tour-preview]');
        return pane && pane.dataset.tourPreview !== previous && pane.querySelector('video')?.currentTime > 2.3;
      }, previous, { timeout: 35000 });
    } catch (error) {
      console.log({ previous, results, errors, state: await page.evaluate(() => ({ world: { ...document.querySelector('[data-scene-state]')?.dataset }, video: Array.from(document.querySelectorAll('video')).map(video => ({ src: video.currentSrc, time: video.currentTime, paused: video.paused, error: video.error?.message })) })).catch(() => null) });
      await page.screenshot({ path: `artifacts/hero/tour/live-${mobile ? 'mobile' : 'desktop'}-failure.png` }).catch(() => {});
      throw error;
    }
    const stop = await page.locator('[data-tour-preview]').getAttribute('data-tour-preview');
    if (visited.has(stop)) throw new Error(`Repeated ${stop} before visiting all locations.`);
    visited.add(stop); previous = stop;
    const window = page.locator(`[data-tour-preview="${stop}"]`);
    await page.screenshot({ path: `artifacts/hero/tour/live-${mobile ? 'mobile' : 'desktop'}-${stop}.png` });
    results.push(await window.evaluate(window => {
      const video = window.querySelector('video');
      const rect = window.getBoundingClientRect();
      return { stop: window.dataset.tourPreview, duration: video.duration, time: video.currentTime, muted: video.muted, bounds: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }, overflow: document.documentElement.scrollWidth > innerWidth };
    }));
  }
  const report = { device: mobile ? 'mobile' : 'desktop', results, errors };
  await writeFile(`artifacts/hero/tour/live-${mobile ? 'mobile' : 'desktop'}.json`, JSON.stringify(report, null, 2));
  console.log(report);
  if (errors.length || results.some(result => result.overflow || !result.muted || result.duration < 6.9)) throw new Error('The live tour needs review.');
} finally { await browser.close(); }
