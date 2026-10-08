import { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { BriefDraft } from '../brief';

export type Lead = { id: string; reference: string; createdAt: number; draft: BriefDraft; slackChannel: string | null };
export type JobKind = 'email' | 'studio-email' | 'slack' | 'slack-invite';
export type NotificationJob = { id: string; lead_id: string; kind: JobKind; attempts: number };
type RawLead = { id: string; reference: string; created_at: number; payload: string; fingerprint: string; slack_channel: string | null };

export class IdempotencyConflict extends Error { constructor() { super('This submission key belongs to a different brief.'); } }
export function fingerprint(draft: BriefDraft) { return createHash('sha256').update(JSON.stringify(draft)).digest('hex'); }
function fromRow(row: RawLead): Lead { return { id: row.id, reference: row.reference, createdAt: row.created_at, draft: JSON.parse(row.payload), slackChannel: row.slack_channel }; }

export class LeadStore {
  readonly db: DatabaseSync;

  constructor(filename: string) {
    if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
    this.db = new DatabaseSync(filename);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY, reference TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL,
        idempotency_key TEXT NOT NULL UNIQUE, fingerprint TEXT NOT NULL, payload TEXT NOT NULL,
        slack_channel TEXT
      );
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY, lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        kind TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0,
        next_attempt INTEGER NOT NULL DEFAULT 0, lease_until INTEGER NOT NULL DEFAULT 0,
        last_error TEXT, sent_at INTEGER, UNIQUE(lead_id, kind)
      );
      CREATE INDEX IF NOT EXISTS notifications_ready ON notifications(state, next_attempt);
      CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
    `);
  }

  existing(key: string, draft: BriefDraft): Lead | null {
    const row = this.db.prepare('SELECT * FROM leads WHERE idempotency_key = ?').get(key) as RawLead | undefined;
    if (!row) return null;
    if (row.fingerprint !== fingerprint(draft)) throw new IdempotencyConflict();
    return fromRow(row);
  }

  create(draft: BriefDraft, key: string): { lead: Lead; duplicate: boolean } {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const previous = this.existing(key, draft);
      if (previous) { this.db.exec('COMMIT'); return { lead: previous, duplicate: true }; }
      const id = randomUUID();
      const reference = `DD-${id.slice(0, 8).toUpperCase()}`;
      const createdAt = Date.now();
      this.db.prepare('INSERT INTO leads (id, reference, created_at, idempotency_key, fingerprint, payload) VALUES (?, ?, ?, ?, ?, ?)').run(id, reference, createdAt, key, fingerprint(draft), JSON.stringify(draft));
      const kinds: JobKind[] = ['email', 'studio-email', 'slack', ...(draft.slack ? ['slack-invite' as const] : [])];
      for (const kind of kinds) this.db.prepare('INSERT INTO notifications (id, lead_id, kind) VALUES (?, ?, ?)').run(randomUUID(), id, kind);
      this.db.exec('COMMIT');
      return { lead: { id, reference, createdAt, draft, slackChannel: null }, duplicate: false };
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }

  get(id: string): Lead | null {
    const row = this.db.prepare('SELECT * FROM leads WHERE id = ?').get(id) as RawLead | undefined;
    return row ? fromRow(row) : null;
  }

  all(): Lead[] { return (this.db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all() as RawLead[]).map(fromRow); }

  allowRequest(key: string, limit = 5, windowMs = 600_000, now = Date.now()) {
    const row = this.db.prepare(`INSERT INTO rate_limits (key, count, expires) VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET count = CASE WHEN expires <= ? THEN 1 ELSE count + 1 END,
      expires = CASE WHEN expires <= ? THEN ? ELSE expires END RETURNING count, expires`).get(key, now + windowMs, now, now, now + windowMs) as { count: number; expires: number };
    return { allowed: row.count <= limit, retryAfter: Math.max(1, Math.ceil((row.expires - now) / 1000)) };
  }

  claimJobs(leadId?: string, now = Date.now()): NotificationJob[] {
    return this.db.prepare(`UPDATE notifications SET state = 'processing', lease_until = ?
      WHERE id IN (SELECT id FROM notifications WHERE attempts < 8
      AND ((state IN ('pending', 'failed') AND next_attempt <= ?) OR (state = 'processing' AND lease_until <= ?))
      ${leadId ? 'AND lead_id = ?' : ''} ORDER BY next_attempt LIMIT 4)
      RETURNING id, lead_id, kind, attempts`).all(...(leadId ? [now + 120_000, now, now, leadId] : [now + 120_000, now, now])) as NotificationJob[];
  }

  sent(job: NotificationJob) { this.db.prepare("UPDATE notifications SET state = 'sent', sent_at = ?, lease_until = 0, last_error = NULL WHERE id = ?").run(Date.now(), job.id); }
  defer(job: NotificationJob, reason: string, configured: boolean) {
    const attempts = job.attempts + (configured ? 1 : 0);
    const delay = configured ? Math.min(3_600_000, 30_000 * 2 ** attempts) : 300_000;
    this.db.prepare("UPDATE notifications SET state = ?, attempts = ?, next_attempt = ?, lease_until = 0, last_error = ? WHERE id = ?").run(configured ? 'failed' : 'pending', attempts, Date.now() + delay, reason.slice(0, 180), job.id);
  }
  setSlackChannel(id: string, channel: string) { this.db.prepare('UPDATE leads SET slack_channel = ? WHERE id = ?').run(channel, id); }
  prune(now = Date.now()) {
    this.db.prepare('DELETE FROM rate_limits WHERE expires < ?').run(now);
    this.db.prepare('DELETE FROM leads WHERE created_at < ?').run(now - 90 * 86_400_000);
  }
  close() { this.db.close(); }
}

const cache = globalThis as typeof globalThis & { decentLeadStore?: { filename: string; store: LeadStore } };
export function getStore() {
  const filename = resolve(process.env.DATA_DIR || './.data', 'briefs.sqlite');
  if (!cache.decentLeadStore || cache.decentLeadStore.filename !== filename) {
    cache.decentLeadStore?.store.close();
    cache.decentLeadStore = { filename, store: new LeadStore(filename) };
  }
  return cache.decentLeadStore.store;
}
