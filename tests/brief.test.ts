import test from 'node:test';
import assert from 'node:assert/strict';
import { briefMarkdown, briefSchema, emptyDraft, normalizeDraft, openQuestions, validateStep } from '../src/lib/brief';
import { fixture } from './fixture';

test('an early-stage brief leaves platform decisions open without asking for a budget', () => {
  const parsed = briefSchema.parse(fixture({ types: ['mobile'], features: ['auth', 'offline'], email: ' Deniz@Example.com ' }));
  assert.equal(parsed.email, 'deniz@example.com');
  assert.ok(openQuestions(parsed).includes('Mobil platform seçimi'));
  assert.doesNotMatch(briefMarkdown(parsed), /bütçe/i);
  assert.match(briefMarkdown(parsed, 'DD-TEST'), /Çevrimdışı kullanım/);
  assert.match(briefMarkdown(parsed, 'DD-TEST'), /Referans: DD-TEST/);
});

test('game briefs accept game features and discard them when the project changes', () => {
  const parsed = briefSchema.parse(fixture({ types: ['game'], features: ['multiplayer', 'leaderboard'] }));
  assert.match(briefMarkdown(parsed), /Çok oyunculu deneyim/);
  assert.equal(briefSchema.safeParse(fixture({ types: ['website'], features: ['multiplayer'] })).success, false);
  assert.deepEqual(normalizeDraft({ ...parsed, types: ['website'] }).features, []);
});

test('empty and forged product-feature combinations are rejected on the server', () => {
  assert.equal(briefSchema.safeParse(emptyDraft).success, false);
  assert.equal(briefSchema.safeParse(fixture({ types: ['website'], features: ['camera'] })).success, false);
  assert.equal(briefSchema.safeParse(fixture({ types: ['unsure', 'mobile'] })).success, false);
  assert.equal(briefSchema.safeParse(fixture({ featuresUnsure: true })).success, false);
});

test('changing scope drops hidden answers instead of quoting stale requirements', () => {
  const result = normalizeDraft(fixture({ types: ['website'], features: ['camera', 'cms'], platform: 'ios', integrations: 'An old ERP', timing: 'flexible', launchDate: '2099-12-31', deadlineReason: 'Old launch' }));
  assert.deepEqual(result.features, ['cms']);
  assert.equal(result.platform, 'unsure');
  assert.equal(result.integrations, '');
  assert.equal(result.launchDate, '');
  assert.doesNotMatch(briefMarkdown(result), /Old launch|An old ERP|Mobil platform/);
});

test('bad links, impossible dates, invalid emails and oversized text are rejected', () => {
  for (const override of [
    { existingUrl: 'javascript:alert(1)' }, { references: 'https://example.com\nfile:///secret' },
    { timing: 'fixed' as const, launchDate: '2099-02-31' }, { timing: 'fixed' as const, launchDate: '2000-01-01' },
    { email: 'not-an-email' }, { goal: 'x'.repeat(1501) }, { name: 'Name\nBcc:other@example.com' },
  ]) assert.equal(briefSchema.safeParse(fixture(override)).success, false, JSON.stringify(override));
});

test('unknown features and optional links do not prevent an early-stage idea', () => {
  const parsed = briefSchema.parse(fixture({ types: ['unsure'], features: [], featuresUnsure: true }));
  assert.match(briefMarkdown(parsed), /İlk sürümün öncelikli işlevleri/);
  assert.deepEqual(validateStep(parsed, 2), {});
});
