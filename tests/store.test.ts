import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { LeadStore, IdempotencyConflict } from '../src/lib/server/store';
import { fixture } from './fixture';

test('a retried submission is stored once, with a single atomic outbox', () => {
  const store = new LeadStore(':memory:');
  try {
    const key = randomUUID();
    const first = store.create(fixture(), key);
    const retry = store.create(fixture(), key);
    assert.equal(retry.duplicate, true);
    assert.equal(retry.lead.reference, first.lead.reference);
    assert.equal(store.all().length, 1);
    assert.equal(store.claimJobs().length, 3);
    assert.throws(() => store.create(fixture({ goal: 'A completely different scope for this project.' }), key), IdempotencyConflict);
    assert.equal(store.all()[0].draft.goal, fixture().goal);
  } finally { store.close(); }
});

test('briefs survive process restarts and invitations require explicit opt-in', () => {
  const dir = mkdtempSync(join(tmpdir(), 'decent-store-'));
  try {
    const filename = join(dir, 'briefs.sqlite');
    let store = new LeadStore(filename);
    const created = store.create(fixture({ slack: true }), randomUUID()).lead;
    store.close();
    store = new LeadStore(filename);
    assert.equal(store.get(created.id)?.draft.email, fixture().email);
    assert.equal(store.claimJobs(created.id).filter(j => j.kind === 'slack-invite').length, 1);
    store.close();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('notification leases prevent simultaneous delivery and recover after interruption', () => {
  const store = new LeadStore(':memory:');
  try {
    store.create(fixture(), randomUUID());
    const jobs = store.claimJobs(undefined, 1000);
    assert.equal(jobs.length, 3);
    assert.equal(store.claimJobs(undefined, 2000).length, 0);
    assert.equal(store.claimJobs(undefined, 122_000).length, 3);
  } finally { store.close(); }
});

test('rate limits expire and retention removes both a lead and its jobs', () => {
  const store = new LeadStore(':memory:');
  try {
    assert.equal(store.allowRequest('key', 2, 1000, 100).allowed, true);
    assert.equal(store.allowRequest('key', 2, 1000, 200).allowed, true);
    assert.equal(store.allowRequest('key', 2, 1000, 300).allowed, false);
    assert.equal(store.allowRequest('key', 2, 1000, 1200).allowed, true);
    const lead = store.create(fixture(), randomUUID()).lead;
    store.prune(lead.createdAt + 91 * 86_400_000);
    assert.equal(store.all().length, 0);
    assert.equal(store.claimJobs().length, 0);
  } finally { store.close(); }
});
