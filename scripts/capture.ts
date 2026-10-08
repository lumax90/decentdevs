import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

async function main() {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHROME === '1' ? 'chrome' : undefined });
  try {
    await mkdir('artifacts', { recursive: true });
    const prefix = process.env.CAPTURE_NAME ? `${process.env.CAPTURE_NAME}-` : '';
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
    const response = await page.goto(process.env.CAPTURE_URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
    if (!response?.ok()) throw new Error(`Page returned HTTP ${response?.status()}`);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-revealed')));
    await page.screenshot({ path: `artifacts/${prefix}desktop.png`, fullPage: true, animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `artifacts/${prefix}mobile.png`, fullPage: true, animations: 'disabled' });
    console.log('Saved desktop and mobile captures in artifacts/.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
