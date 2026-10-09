import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fixture } from '../fixture';

test('homepage, product switcher and keyboard service navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Good enough.');
  await page.getByRole('button', { name: 'Mobil', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mobil', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.stage-sakin')).toBeVisible();
  await page.getByRole('button', { name: 'Biraz tasarım', exact: true }).click();
  await expect(page.locator('.stage-luma')).toBeVisible();
  await page.getByRole('tab', { name: /Web siteleri/ }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('tab', { name: /Web uygulamaları/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('Bir sekmede, epey şey mümkün.');
  await page.getByRole('link', { name: 'Biraz daha yakından' }).click();
  await expect(page).toHaveURL(/hizmetler\/web-uygulama-gelistirme/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Bir sekmede');
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('Orbit changes real task state, adds a task and updates completion', async ({ page }) => {
  await page.goto('/laboratuvar/orbit');
  await page.getByRole('checkbox', { name: 'Küçük detayları düşün görevini tamamla' }).check();
  await expect(page.getByRole('checkbox', { name: 'Küçük detayları düşün görevini yeniden aç' })).toBeChecked();
  await expect(page.locator('.orbit-progress-stat strong')).toHaveText('75%');
  await page.getByRole('textbox', { name: 'Yeni görev' }).fill('İyi bir test yaz');
  await page.getByRole('button', { name: 'Görev ekle' }).click();
  await expect(page.getByRole('checkbox', { name: 'İyi bir test yaz görevini tamamla' })).toBeVisible();
  await expect(page.locator('.orbit-progress-stat strong')).toHaveText('60%');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('Sakin uses elapsed time and Luma responds to color and light controls', async ({ page }) => {
  await page.goto('/laboratuvar/sakin');
  await page.getByRole('button', { name: '15 dk', exact: true }).click();
  await expect(page.getByRole('timer')).toHaveText('15:00');
  await page.getByRole('button', { name: 'Odaklanalım' }).click();
  await expect(page.getByRole('button', { name: 'Bir nefes al' })).toBeVisible();
  await expect(page.getByRole('timer')).not.toHaveText('15:00', { timeout: 4000 });
  await page.getByRole('button', { name: 'Zamanlayıcıyı sıfırla' }).click();
  await expect(page.getByRole('timer')).toHaveText('15:00');
  await page.goto('/laboratuvar/luma');
  await page.getByRole('button', { name: 'Leylak', exact: true }).click();
  await expect(page.getByRole('img', { name: /Leylak renkli masa lambası, ışık açık/ })).toBeVisible();
  await page.getByRole('button', { name: 'Işığı kapat', exact: true }).click();
  await expect(page.getByRole('img', { name: /ışık kapalı/ })).toBeVisible();
});

test('the approved narrated film loads with controls, lasts sixty seconds and closes with Escape', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Nasıl mı?' }).click();
  const dialog = page.getByRole('dialog', { name: 'Decent Devs stüdyo filmi' });
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.locator('video').evaluate(v => (v as HTMLVideoElement).duration)).toBeCloseTo(60, 1);
  await expect(dialog.locator('video')).toHaveAttribute('controls', '');
  await expect(dialog.locator('video')).toHaveAttribute('controlsList', 'nodownload');
  await expect(dialog.getByRole('link', { name: 'Filmi indir' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(dialog.locator('video')).toHaveCount(0);
});

test('adaptive brief, back navigation, persistence, successful storage and download', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Fikrini anlat', exact: true }).first().click();
  await expect(page).toHaveURL(/baslayalim/);
  await page.getByRole('button', { name: 'Devam', exact: true }).click();
  await expect(page.getByText('Bir başlangıç seçelim.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: /^Mobil uygulama/ }).click();
  await page.getByRole('button', { name: /^Özel yazılım/ }).click();
  const goal = 'Saha ekibi ziyaret notlarını telefondan girsin, ofis tek panelden takip etsin.';
  await page.getByLabel('Bu fikir, neyi kolaylaştıracak?').fill(goal);
  await page.getByRole('button', { name: 'Devam', exact: true }).click();
  await page.getByLabel('Kim kullanacak?').selectOption('team');
  await page.getByRole('button', { name: 'Çevrimdışı kullanım', exact: true }).click();
  await page.getByRole('button', { name: 'Başka sistemlere bağlantı', exact: true }).click();
  await page.getByLabel('Hangi telefonlarda olsun?').selectOption('both');
  await page.getByLabel('Hangi sistemlere bağlanacak?').fill('Mevcut sipariş API');
  await page.getByLabel('İlk etapta yaklaşık kaç kullanıcı?').selectOption('10to100');
  await page.getByRole('button', { name: 'Devam', exact: true }).click();
  await page.getByRole('button', { name: 'Marka / logo', exact: true }).click();
  await page.getByLabel('Mevcut site veya ürün bağlantısı').fill('https://example.com');
  await page.getByRole('button', { name: 'Geri', exact: true }).click();
  await expect(page.getByLabel('Hangi sistemlere bağlanacak?')).toHaveValue('Mevcut sipariş API');
  await page.getByRole('button', { name: 'Devam', exact: true }).click();
  await page.reload();
  await expect(page.getByText('Kaldığın yeri hatırladık.')).toBeVisible();
  await expect(page.getByLabel('Mevcut site veya ürün bağlantısı')).toHaveValue('https://example.com');
  await page.getByRole('button', { name: 'Devam', exact: true }).click();
  await expect(page.locator('#budget')).toHaveCount(0);
  await page.getByRole('button', { name: 'Belli bir tarih var', exact: true }).click();
  await page.getByLabel('Hedef tarih', { exact: true }).fill('2099-06-15');
  await page.getByLabel('Bu tarihin özel bir nedeni var mı?').fill('Ürün lansmanı');
  await page.getByRole('button', { name: 'Devam', exact: true }).click();
  await page.getByLabel('Adın', { exact: true }).fill('Deniz Test');
  await page.getByLabel('E-posta adresin').fill(`e2e-${randomUUID()}@example.com`);
  await page.getByRole('checkbox', { name: /Slack’te devam edelim/ }).check();
  const response = page.waitForResponse(r => r.url().endsWith('/api/brief') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Notumu gönder' }).click();
  expect((await response).status()).toBe(202);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Notunu aldık');
  await expect(page.getByText(/Bu önizlemede brief yerel olarak kaydedildi/)).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Proje özetimi indir' }).click();
  const download = await downloadPromise;
  const text = await readFile((await download.path())!, 'utf8');
  expect(text).toContain(goal);
  expect(text).toContain('iOS ve Android');
  expect(text).toContain('Mevcut sipariş API');
  expect(text).toContain('Slack üzerinden devam etmek istiyor');
  expect(text).not.toMatch(/bütçe/i);
  expect(await page.evaluate(() => sessionStorage.getItem('decent-project-v1'))).toBeNull();
});

test('the 3D hero reaches a selected destination, pauses, and carries a game idea into the brief', async ({ page }) => {
  const graphicsErrors: string[] = [];
  page.on('console', message => { if (message.type() === 'error' && /WebGL|Shader|GL_INVALID/i.test(message.text())) graphicsErrors.push(message.text()); });
  await page.goto('/');
  const world = page.getByRole('group', { name: 'Decent Devs’in etkileşimli dünyası', exact: true });
  const picker = page.getByRole('group', { name: 'Projenin yönünü seç' });
  await expect(world).toHaveAttribute('data-scene-state', 'ready', { timeout: 30000 });
  await picker.getByRole('button', { name: 'Web uygulaması', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(world).toHaveAttribute('data-destination', 'webapp');
  await expect(page.getByRole('status')).toContainText('DOĞRU YERDESİN.', { timeout: 20000 });
  expect(graphicsErrors).toEqual([]);
  await page.getByRole('button', { name: /Bir mola: hareketi duraklat/ }).click();
  await expect(world).toHaveAttribute('data-motion', 'paused');
  await world.focus();
  await page.keyboard.press('Space');
  await expect(world).toHaveAttribute('data-motion', 'running');
  await page.keyboard.press('ArrowRight');
  await expect(world).toHaveAttribute('data-destination', 'explore');
  await picker.getByRole('button', { name: 'Oyun', exact: true }).click();
  await page.locator('a[href="/baslayalim?tur=game"]').click();
  await expect(page).toHaveURL(/\/baslayalim\?tur=game$/);
  await expect(page.getByRole('button', { name: /^Oyun/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('Bu fikir, neyi kolaylaştıracak?').fill('Arkadaşların birlikte bulmaca çözebileceği bir oyun istiyorum.');
  await page.getByRole('button', { name: 'Devam', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Çok oyunculu deneyim', exact: true })).toBeVisible();
});

test('a disconnected brief can retry the same submission and stays consistent while saving', async ({ page }) => {
  const draft = fixture({ email: `retry-${randomUUID()}@example.com` });
  await page.addInitScript(draft => {
    sessionStorage.setItem('decent-project-v1', JSON.stringify({ draft, step: 4, savedAt: Date.now() }));
  }, draft);
  const keys: string[] = [];
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/brief', async route => {
    keys.push(route.request().headers()['idempotency-key']);
    if (keys.length === 1) { await route.abort('internetdisconnected'); return; }
    await pending;
    await route.continue();
  });
  await page.goto('/baslayalim');
  const email = page.getByLabel('E-posta adresin');
  await expect(email).toHaveValue(draft.email);
  await page.getByRole('button', { name: 'Notumu gönder' }).click();
  await expect(page.locator('.brief-form').getByRole('alert')).toContainText('Bağlantıyı kontrol edip tekrar deneyebilir misin?');
  await expect(email).toBeEnabled();
  await expect(email).toHaveValue(draft.email);
  await page.getByRole('button', { name: 'Notumu gönder' }).click();
  await expect(email).toBeDisabled();
  await expect(page.getByLabel('Adın', { exact: true })).toBeDisabled();
  await expect(page.locator('button[aria-label="Proje fikrini düzenle"]')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Yeni bir başlangıç' })).toBeDisabled();
  release();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Notunu aldık');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBeTruthy();
  expect(keys[1]).toBe(keys[0]);
  expect(await page.evaluate(() => sessionStorage.getItem('decent-project-v1'))).toBeNull();
});

test('the hero recovers from a model failure and respects reduced motion', async ({ page }) => {
  await page.route('**/hero/models/courier.glb', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/');
  const world = page.locator('[data-scene-state]');
  await expect(world).toHaveAttribute('data-scene-state', 'error', { timeout: 30000 });
  await expect(world.locator('img')).toBeVisible();
  await expect(page.getByText('Küçük dünyamız hazırlanıyor…')).toHaveCount(0);
  const picker = page.getByRole('group', { name: 'Projenin yönünü seç' });
  await picker.getByRole('button', { name: 'Mobil uygulama', exact: true }).click();
  await expect(page.locator('a[href="/baslayalim?tur=mobile"]')).toBeVisible();
  await page.unroute('**/hero/models/courier.glb');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: '3B dünyayı tekrar yükle' }).click();
  await expect(world).toHaveAttribute('data-scene-state', 'ready', { timeout: 30000 });
  await expect(world).toHaveAttribute('data-motion', 'paused');
  await picker.getByRole('button', { name: 'Web sitesi', exact: true }).click();
  await expect(world).toHaveAttribute('data-motion', 'paused');
  await expect(page.getByRole('status')).toContainText('DOĞRU YERDESİN.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('API validates origin, bounds payloads and makes retries idempotent', async ({ request }) => {
  const data = fixture({ email: `api-${randomUUID()}@example.com` });
  const headers = { Origin: 'http://127.0.0.1:3101', 'Idempotency-Key': randomUUID() };
  expect((await request.post('/api/brief', { headers: { ...headers, Origin: 'https://other.example' }, data })).status()).toBe(403);
  expect((await request.post('/api/brief', { headers, data: { ...data, goal: '' } })).status()).toBe(422);
  expect((await request.post('/api/brief', { headers, data: { ...data, notes: 'x'.repeat(26000) } })).status()).toBe(413);
  const first = await request.post('/api/brief', { headers, data });
  expect(first.status()).toBe(202);
  const second = await request.post('/api/brief', { headers, data });
  expect(second.status()).toBe(200);
  expect((await second.json()).reference).toBe((await first.json()).reference);
  expect((await request.post('/api/brief', { headers, data: { ...data, goal: 'Bu aynı anahtarla başka bir talep olmamalı.' } })).status()).toBe(409);
});

test('indexable service pages, canonical links, sitemap and not-found status', async ({ page, request }) => {
  await page.goto('/hizmetler/mobil-uygulama-gelistirme');
  await expect(page).toHaveTitle(/iOS & Android Mobil Uygulama Geliştirme/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://decentdevs.com/hizmetler/mobil-uygulama-gelistirme');
  const html = await (await request.get('/hizmetler/mobil-uygulama-gelistirme')).text();
  expect(html).toContain('Cebinizdeki iyi fikir.');
  expect(html).toContain('application/ld+json');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/hizmetler/kurumsal-yazilim');
  expect(sitemap).toContain('/laboratuvar/luma');
  expect((await request.get('/laboratuvar/no-such-concept')).status()).toBe(404);
});

test('primary pages have no automated WCAG A/AA violations', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/', '/baslayalim']) {
    await page.goto(path);
    await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-revealed')));
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await testInfo.attach(`accessibility-${path === '/' ? 'home' : 'brief'}`, { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
    expect.soft(results.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target.join(' ')) })), path).toEqual([]);
  }
});
