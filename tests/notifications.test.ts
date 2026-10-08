import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { LeadStore } from '../src/lib/server/store';
import { deliverJob, htmlEscape, NotConfigured, processNotifications, slackPayload } from '../src/lib/server/notifications';
import { fixture } from './fixture';

test('unconfigured services retain the brief and pending work, without outbound requests', async () => {
  const store = new LeadStore(':memory:');
  try {
    const lead = store.create(fixture({ slack: true }), randomUUID()).lead;
    let calls = 0;
    await processNotifications(lead.id, store, {}, async () => { calls++; throw new Error('Unexpected outbound request'); });
    assert.equal(calls, 0);
    assert.ok(store.get(lead.id));
    const jobs = store.db.prepare('SELECT state, attempts FROM notifications').all();
    assert.ok(jobs.every(j => j.state === 'pending' && j.attempts === 0));
  } finally { store.close(); }
});

test('a provider failure queues a retry without losing the successful form submission', async () => {
  const store = new LeadStore(':memory:');
  try {
    const lead = store.create(fixture(), randomUUID()).lead;
    const calls: string[] = [];
    await processNotifications(lead.id, store, { RESEND_API_KEY: 'test', EMAIL_FROM: 'test@example.com' }, async (url) => { calls.push(String(url)); return new Response('unavailable', { status: 503 }); });
    assert.equal(calls.length, 1);
    assert.equal(calls[0], 'https://api.resend.com/emails');
    const failed = store.db.prepare("SELECT state, attempts FROM notifications WHERE kind = 'email'").get();
    assert.equal(failed?.state, 'failed');
    assert.equal(failed?.attempts, 1);
    assert.ok(store.get(lead.id));
  } finally { store.close(); }
});

test('user text is inert in email HTML and in Slack blocks', () => {
  assert.equal(htmlEscape('<script>"&'), '&lt;script&gt;&quot;&amp;');
  const store = new LeadStore(':memory:');
  try {
    const lead = store.create(fixture({ goal: '<!channel> <script>alert(1)</script>' }), randomUUID()).lead;
    const payload = slackPayload(lead);
    assert.ok(payload.blocks.every(block => block.text.type === 'plain_text'));
    assert.doesNotMatch(payload.text, /!channel/);
  } finally { store.close(); }
});

test('an Enterprise invite creates a private channel and persists it for safe retries', async () => {
  const store = new LeadStore(':memory:');
  try {
    const lead = store.create(fixture({ slack: true }), randomUUID()).lead;
    const job = store.claimJobs(lead.id).find(j => j.kind === 'slack-invite')!;
    const calls: { url: string; body: Record<string, unknown> }[] = [];
    const fetcher: typeof fetch = async (url, init) => {
      const body = JSON.parse(String(init?.body)); calls.push({ url: String(url), body });
      return Response.json(String(url).endsWith('conversations.create') ? { ok: true, channel: { id: 'C_PRIVATE' } } : { ok: true });
    };
    const env = { SLACK_INVITE_MODE: 'enterprise', SLACK_ADMIN_TOKEN: 'test-admin', SLACK_BOT_TOKEN: 'test-bot', SLACK_TEAM_ID: 'T_TEST' };
    await deliverJob(job, lead, store, env, fetcher);
    assert.equal(calls[0].body.is_private, true);
    assert.equal(calls[1].body.is_ultra_restricted, true);
    assert.equal(calls[1].body.email, lead.draft.email);
    assert.equal(calls[1].body.channel_ids, 'C_PRIVATE');
    assert.equal(store.get(lead.id)?.slackChannel, 'C_PRIVATE');
    await deliverJob(job, store.get(lead.id)!, store, env, fetcher);
    assert.equal(calls.filter(c => c.url.endsWith('conversations.create')).length, 1);
  } finally { store.close(); }
});

test('manual Slack mode never silently adds a customer to a workspace', async () => {
  const store = new LeadStore(':memory:');
  try {
    const lead = store.create(fixture({ slack: true }), randomUUID()).lead;
    const job = store.claimJobs(lead.id).find(j => j.kind === 'slack-invite')!;
    await assert.rejects(deliverJob(job, lead, store, { SLACK_INVITE_MODE: 'manual' }, async () => { throw new Error('Unexpected call'); }), NotConfigured);
  } finally { store.close(); }
});
