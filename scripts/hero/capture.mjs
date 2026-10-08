import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const base = process.env.HERO_REVIEW_URL || 'http://localhost:3001';
const browser = await chromium.launch({ channel: 'chrome' });
await mkdir('artifacts/hero', { recursive: true });
try {
  for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    if (process.argv.includes('--poster')) await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(base);
    const stage = page.locator('[data-scene-state]');
    await page.waitForFunction(() => document.querySelector('[data-scene-state]')?.getAttribute('data-scene-state') !== 'loading', undefined, { timeout: 40000 });
    await page.evaluate(() => document.fonts.ready);
    if (await stage.getAttribute('data-scene-state') === 'ready') {
      await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-location]')).some(label => Number(label.style.opacity) > 0.5));
    }
    await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' });
    if (process.argv.includes('--poster') && await stage.getAttribute('data-scene-state') === 'ready') {
      const bounds = await stage.boundingBox();
      await page.addStyleTag({ content: `html, body { background: transparent !important; } body * { visibility: hidden !important; } canvas { visibility: visible !important; } [data-scene-state] { position: fixed !important; inset: 0 !important; width: ${bounds.width}px !important; height: ${bounds.height}px !important; z-index: 1000 !important; }` });
      const canvas = stage.locator('canvas');
      await canvas.evaluate(element => new Promise(resolve => {
        const observer = new ResizeObserver(() => { observer.disconnect(); requestAnimationFrame(() => requestAnimationFrame(resolve)); });
        observer.observe(element);
      }));
      const image = await canvas.screenshot({ omitBackground: true });
      const destination = viewport.name === 'mobile' ? 'public/hero/world-closeup-mobile.webp' : 'public/hero/world-closeup.webp';
      await sharp(image).webp({ quality: 85 }).toFile(destination);
      console.log(`Saved ${destination}`);
    } else {
      await page.screenshot({ path: `artifacts/hero/${viewport.name}.png` });
      if (viewport.name === 'mobile') await page.locator('section').filter({ has: page.getByRole('heading', { level: 1 }) }).screenshot({ path: 'artifacts/hero/mobile-complete.png' });
    }
    console.log({ viewport: viewport.name, scene: await stage.getAttribute('data-scene-state'), overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), errors });
    await page.close();
  }
} finally { await browser.close(); }
