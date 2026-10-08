import { timingSafeEqual } from 'node:crypto';
import { getStore } from '@/lib/server/store';
import { processNotifications } from '@/lib/server/notifications';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: 'Not configured.' }, { status: 503 });
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '') || '';
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  const store = getStore();
  store.prune();
  const processed = await processNotifications(undefined, store);
  return Response.json({ processed }, { headers: { 'Cache-Control': 'no-store' } });
}
