import { after } from 'next/server';
import { createHmac } from 'node:crypto';
import { briefMarkdown, briefSchema } from '@/lib/brief';
import { getStore, IdempotencyConflict, type Lead } from '@/lib/server/store';
import { notificationsConnected, processNotifications } from '@/lib/server/notifications';
import { allowedOrigin } from '@/lib/server/origin';

export const runtime = 'nodejs';
export const maxDuration = 60;
const MAX_BYTES = 24_000;
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

async function readPayload(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > MAX_BYTES) throw new RangeError('Payload too large.');
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError('Empty body.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) { await reader.cancel(); throw new RangeError('Payload too large.'); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function accepted(lead: Lead, duplicate: boolean) {
  after(async () => { try { await processNotifications(lead.id); } catch (error) { console.error('[brief] Notification processing deferred.', error instanceof Error ? error.name : 'Error'); } });
  return json({ reference: lead.reference, markdown: briefMarkdown(lead.draft, lead.reference), deliveryMode: notificationsConnected() ? 'connected' : 'local', duplicate }, duplicate ? 200 : 202);
}

export async function POST(request: Request) {
  if (!allowedOrigin(request, process.env.NEXT_PUBLIC_SITE_URL)) return json({ error: 'Bu formu Decent Devs sitesi üzerinden gönderebilirsin.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Form verisi okunamadı.' }, 415);
  const key = request.headers.get('idempotency-key') || '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) return json({ error: 'Gönderimi yenileyip tekrar deneyebilir misin?' }, 400);

  let body: unknown;
  try { body = await readPayload(request); }
  catch (error) { return json({ error: error instanceof RangeError ? 'Proje notu biraz uzun. Metni kısaltıp tekrar deneyebilir misin?' : 'Form verisi okunamadı.' }, error instanceof RangeError ? 413 : 400); }
  const parsed = briefSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'İşaretlenen alanları bir kontrol edelim.', fields: Object.fromEntries(parsed.error.issues.map(i => [String(i.path[0]), i.message])) }, 422);
  if (parsed.data.fax) return json({ error: 'Form gönderilemedi. Sayfayı yenileyip tekrar deneyebilirsin.' }, 422);

  try {
    const store = getStore();
    store.prune();
    const existing = store.existing(key, parsed.data);
    if (existing) return accepted(existing, true);
    const identity = process.env.TRUST_PROXY_HEADERS === 'true' ? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || parsed.data.email : parsed.data.email;
    const hash = createHmac('sha256', process.env.RATE_LIMIT_SECRET || 'local-preview-only').update(identity).digest('hex');
    const limit = store.allowRequest(hash);
    const globalLimit = store.allowRequest('global-submission-window', 100, 600_000);
    if (!limit.allowed || !globalLimit.allowed) return json({ error: 'Biraz fazla deneme oldu. Birkaç dakika sonra yeniden deneyebilirsin.' }, 429, { 'Retry-After': String(Math.max(limit.retryAfter, globalLimit.retryAfter)) });
    const created = store.create(parsed.data, key);
    return accepted(created.lead, created.duplicate);
  } catch (error) {
    if (error instanceof IdempotencyConflict) return json({ error: 'Notun bu sırada değişmiş. Bir alanı düzenleyip yeniden gönderebilir misin?' }, 409);
    console.error('[brief] Save failed.', error instanceof Error ? error.name : 'Error');
    return json({ error: 'Notunu şu anda kaydedemedik. Cevapların burada duruyor; birazdan tekrar deneyebilirsin.' }, 503);
  }
}
