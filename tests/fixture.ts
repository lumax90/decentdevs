import { emptyDraft, type BriefDraft } from '../src/lib/brief';

export function fixture(overrides: Partial<BriefDraft> = {}): BriefDraft {
  return { ...emptyDraft, types: ['webapp'], goal: 'Müşteriler siparişlerini tek bir panelden takip edebilsin.', audience: 'customers', features: ['auth', 'reports'], name: 'Deniz Test', email: 'deniz@example.com', ...overrides };
}
