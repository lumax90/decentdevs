import { test, expect } from '@playwright/test';

test('automatic arrivals play a real demo, pause offscreen and continue to React; dragging takes control', async ({ page }) => {
  test.setTimeout(75000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const world = page.locator('[data-scene-state]');
  await expect(world).toHaveAttribute('data-scene-state', 'ready', { timeout: 30000 });
  await world.scrollIntoViewIfNeeded();
  await expect(world).toHaveAttribute('data-destination', 'game', { timeout: 5000 });
  const game = page.locator('[data-tour-preview="game"]');
  await expect(game).toBeVisible({ timeout: 18000 });
  const video = game.locator('video');
  const previousVideo = await video.elementHandle();
  await expect(video).toHaveAttribute('src', /tennis\.mp4/);
  await expect.poll(() => video.evaluate(video => (video as HTMLVideoElement).currentTime)).toBeGreaterThan(.2);
  await expect.poll(() => video.evaluate(video => (video as HTMLVideoElement).duration)).toBeCloseTo(7, 1);
  await page.getByRole('button', { name: /Bir mola: hareketi duraklat/ }).click();
  await expect.poll(() => video.evaluate(video => (video as HTMLVideoElement).paused)).toBe(true);
  const pausedAt = await video.evaluate(video => (video as HTMLVideoElement).currentTime);
  await page.waitForTimeout(400);
  expect(await video.evaluate(video => (video as HTMLVideoElement).currentTime)).toBeCloseTo(pausedAt, 1);
  await page.getByRole('button', { name: 'Devam: hareketi başlat' }).click();
  await page.locator('footer.site-footer').scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate(video => (video as HTMLVideoElement).paused)).toBe(true);
  await world.scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  await expect(world).toHaveAttribute('data-destination', 'react', { timeout: 18000 });
  await expect.poll(() => previousVideo!.evaluate(video => video.getAttribute('src'))).toBeNull();
  const react = page.locator('[data-tour-preview="react"]');
  await expect(react).toBeVisible({ timeout: 18000 });
  await expect(react.locator('video')).toHaveAttribute('src', /react\.mp4/);
  const bounds = (await world.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width * .84, bounds.y + 55);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * .65, bounds.y + 74, { steps: 8 });
  await page.mouse.up();
  await expect(world).toHaveAttribute('data-tour-mode', 'manual');
  await expect(world).toHaveAttribute('data-destination', 'explore');
  await expect(page.locator('[data-tour-preview]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Tura dön: keşif turunu başlat' }).click();
  await expect(world).toHaveAttribute('data-tour-mode', 'auto');
  await expect(world).not.toHaveAttribute('data-destination', 'game');
  await expect(world).not.toHaveAttribute('data-destination', 'react');
  expect(errors).toEqual([]);
});

test('parking the globe near a location opens its animation and then follows a nearby route', async ({ page }) => {
  test.setTimeout(65000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const world = page.locator('[data-scene-state]');
  await expect(world).toHaveAttribute('data-scene-state', 'ready', { timeout: 30000 });
  await page.getByRole('button', { name: 'Devam: hareketi başlat' }).click();
  await world.scrollIntoViewIfNeeded();
  const box = (await world.boundingBox())!;
  const x = box.x + box.width * .9, y = box.y + box.height * .45;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 20; i++) {
    await page.mouse.move(x + box.width * .065 * i / 20, y - box.width * .2 * i / 20);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(1100);
  await page.mouse.up();
  await page.mouse.move(1, 1);
  const preview = page.locator('[data-tour-preview="website"]');
  await expect(preview).toBeVisible({ timeout: 9000 });
  await expect(preview.locator('video')).toHaveAttribute('src', /web\.mp4/);
  await expect(preview).not.toContainText(/Remotion|mini konsept/i);
  await expect(page.getByRole('button', { name: /^Sis/ })).toHaveCount(0);
  await expect(world).toHaveAttribute('data-tour-mode', 'auto', { timeout: 13000 });
  await expect(world).toHaveAttribute('data-destination', 'rust');
});

test('a failed mini video does not strand the tour at its first stop', async ({ page }) => {
  test.setTimeout(45000);
  await page.route('**/hero/tour/tennis.mp4*', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/');
  const world = page.locator('[data-scene-state]');
  await expect(world).toHaveAttribute('data-scene-state', 'ready', { timeout: 30000 });
  await world.scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  await expect(world).toHaveAttribute('data-destination', 'game', { timeout: 5000 });
  await expect(world).toHaveAttribute('data-destination', 'react', { timeout: 20000 });
  await expect(world).toHaveAttribute('data-tour-mode', 'auto');
});
