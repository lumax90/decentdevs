import { z } from 'zod';

export const projectTypes = [
  { id: 'website', label: 'Web sitesi', hint: 'Markanın internetteki hâli.' },
  { id: 'webapp', label: 'Web uygulaması', hint: 'Tarayıcıda çalışan bir ürün.' },
  { id: 'mobile', label: 'Mobil uygulama', hint: 'Cebe sığan bir fikir.' },
  { id: 'game', label: 'Oyun', hint: 'Oynanacak bir dünya.' },
  { id: 'internal', label: 'Özel yazılım', hint: 'İşine uyan bir sistem.' },
  { id: 'existing', label: 'Var olanı iyileştirmek', hint: 'Daha iyi olabilir dediğin şey.' },
  { id: 'unsure', label: 'Birlikte bulalım', hint: 'Önce fikri konuşalım.' },
] as const;
export type ProjectType = typeof projectTypes[number]['id'];

export const features = [
  { id: 'cms', label: 'İçerik yönetimi', types: ['website', 'webapp'] },
  { id: 'multilingual', label: 'Birden fazla dil', types: ['website', 'webapp', 'mobile', 'game'] },
  { id: 'auth', label: 'Üyelik / giriş', types: ['webapp', 'mobile', 'internal', 'game'] },
  { id: 'payments', label: 'Ödeme / abonelik', types: ['website', 'webapp', 'mobile', 'game'] },
  { id: 'booking', label: 'Randevu / rezervasyon', types: ['website', 'webapp', 'mobile'] },
  { id: 'roles', label: 'Roller / yetkiler', types: ['webapp', 'internal'] },
  { id: 'reports', label: 'Panel / raporlar', types: ['webapp', 'internal'] },
  { id: 'integrations', label: 'Başka sistemlere bağlantı', types: ['website', 'webapp', 'mobile', 'internal'] },
  { id: 'offline', label: 'Çevrimdışı kullanım', types: ['mobile', 'internal', 'game'] },
  { id: 'notifications', label: 'Bildirimler', types: ['webapp', 'mobile', 'internal'] },
  { id: 'camera', label: 'Kamera / konum', types: ['mobile'] },
  { id: 'migration', label: 'Mevcut veriyi taşımak', types: ['website', 'webapp', 'internal'] },
  { id: 'multiplayer', label: 'Çok oyunculu deneyim', types: ['game'] },
  { id: 'leaderboard', label: 'Skor / ilerleme sistemi', types: ['game'] },
] as const;
export type FeatureId = typeof features[number]['id'];

export const timingOptions = [
  { id: 'flexible', label: 'Doğru zamanda, iyi olsun' },
  { id: 'soon', label: 'Önümüzdeki 1–3 ay' },
  { id: 'later', label: '3–6 ay içinde' },
  { id: 'fixed', label: 'Belli bir tarih var' },
] as const;
export const assetOptions = [
  { id: 'brand', label: 'Marka / logo' }, { id: 'design', label: 'Tasarım / prototip' },
  { id: 'content', label: 'Metinler / görseller' }, { id: 'api', label: 'Mevcut yazılım / API' },
] as const;

const smallText = z.string().trim().max(500);
const urlText = z.string().trim().max(500).refine(v => !v || isHttpUrl(v), 'http:// veya https:// ile başlayan geçerli bir bağlantı yaz.');
export const draftSchema = z.object({
  types: z.array(z.enum(['website', 'webapp', 'mobile', 'game', 'internal', 'existing', 'unsure'])).max(6),
  goal: z.string().trim().max(1500),
  audience: z.enum(['customers', 'team', 'both', 'unsure']),
  features: z.array(z.enum(['cms', 'multilingual', 'auth', 'payments', 'booking', 'roles', 'reports', 'integrations', 'offline', 'notifications', 'camera', 'migration', 'multiplayer', 'leaderboard'])).max(14),
  featuresUnsure: z.boolean(),
  platform: z.enum(['both', 'ios', 'android', 'unsure']),
  integrations: smallText,
  users: z.enum(['under10', '10to100', '100to1000', '1000plus', 'unsure']),
  assets: z.array(z.enum(['brand', 'design', 'content', 'api'])).max(4),
  existingUrl: urlText,
  references: z.string().trim().max(1600),
  notes: z.string().trim().max(1500),
  timing: z.enum(['flexible', 'soon', 'later', 'fixed']),
  launchDate: z.string().max(10),
  deadlineReason: z.string().trim().max(300),
  name: z.string().trim().max(90).refine(v => !/[\r\n\x00-\x1f]/.test(v), 'Adını tek satırda yaz.'),
  email: z.string().trim().max(200),
  company: z.string().trim().max(120),
  phone: z.string().trim().max(35),
  slack: z.boolean(),
  fax: z.string().max(200),
});

export type BriefDraft = z.infer<typeof draftSchema>;
export const emptyDraft: BriefDraft = {
  types: [], goal: '', audience: 'unsure', features: [], featuresUnsure: false, platform: 'unsure', integrations: '', users: 'unsure', assets: [], existingUrl: '', references: '', notes: '', timing: 'flexible', launchDate: '', deadlineReason: '', name: '', email: '', company: '', phone: '', slack: false, fax: '',
};

export function isHttpUrl(value: string) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && Boolean(url.hostname); } catch { return false; }
}

export function availableFeatures(types: readonly string[]) {
  return features.filter(f => types.includes('unsure') || types.includes('existing') || f.types.some(t => types.includes(t)));
}

export function normalizeDraft(data: BriefDraft): BriefDraft {
  const allowed = availableFeatures(data.types).map(f => f.id);
  const selected = [...new Set(data.features)].filter(f => allowed.includes(f));
  return {
    ...data,
    types: [...new Set(data.types)],
    assets: [...new Set(data.assets)],
    features: data.featuresUnsure ? [] : selected,
    platform: data.types.includes('mobile') ? data.platform : 'unsure',
    integrations: selected.includes('integrations') && !data.featuresUnsure ? data.integrations : '',
    launchDate: data.timing === 'fixed' ? data.launchDate : '',
    deadlineReason: data.timing === 'fixed' ? data.deadlineReason : '',
    email: data.email.trim().toLowerCase(),
  };
}

export function validateStep(draft: BriefDraft, step: number): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 0) {
    if (!draft.types.length) errors.types = 'Bir başlangıç seçelim. “Birlikte bulalım” da olur.';
    if (draft.goal.trim().length < 12) errors.goal = 'Fikrini bir cümleyle anlatabilir misin? En az 12 karakter yeterli.';
    if (draft.goal.length > 1500) errors.goal = 'Bu alanı 1500 karakter içinde tutalım.';
  }
  if (step === 1) {
    if (!draft.features.length && !draft.featuresUnsure) errors.features = 'Öncelikleri seçebilir veya birlikte netleştirmeyi tercih edebilirsin.';
  }
  if (step === 2) {
    if (draft.existingUrl && !isHttpUrl(draft.existingUrl)) errors.existingUrl = 'http:// veya https:// ile başlayan bir bağlantı yaz.';
    const refs = draft.references.split('\n').map(r => r.trim()).filter(Boolean);
    if (refs.length > 3 || refs.some(r => !isHttpUrl(r))) errors.references = 'Her satıra bir bağlantı gelecek şekilde en fazla 3 geçerli http/https bağlantısı ekleyebilirsin.';
  }
  if (step === 3 && draft.timing === 'fixed') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.launchDate) || !Number.isFinite(Date.parse(draft.launchDate)) || new Date(draft.launchDate).toISOString().slice(0, 10) !== draft.launchDate) errors.launchDate = 'Geçerli bir hedef tarih seçelim.';
    if (draft.launchDate && draft.launchDate < new Date().toISOString().slice(0, 10)) errors.launchDate = 'Hedef tarih bugünden önce olmamalı.';
  }
  if (step === 4) {
    if (draft.name.trim().length < 2) errors.name = 'Sana nasıl hitap edelim?';
    if (!z.email().safeParse(draft.email.trim()).success) errors.email = 'Geçerli bir e-posta adresi yazabilir misin?';
    if (draft.phone && !/^[+\d\s()\-\.]{6,35}$/.test(draft.phone)) errors.phone = 'Telefon numarasını kontrol edebilir misin?';
  }
  return errors;
}

export const briefSchema = draftSchema.superRefine((draft, ctx) => {
  for (let step = 0; step < 5; step++) {
    for (const [key, message] of Object.entries(validateStep(draft, step))) ctx.addIssue({ code: 'custom', path: [key], message });
  }
  if (draft.types.includes('unsure') && draft.types.length > 1) ctx.addIssue({ code: 'custom', path: ['types'], message: '“Birlikte bulalım” seçeneğini tek başına seçebilirsin.' });
  if (draft.featuresUnsure && draft.features.length) ctx.addIssue({ code: 'custom', path: ['features'], message: 'Öncelik seçimi ile birlikte netleştirme tercihini kontrol edelim.' });
  const allowed = availableFeatures(draft.types).map(f => f.id);
  if (draft.features.some(f => !allowed.includes(f))) ctx.addIssue({ code: 'custom', path: ['features'], message: 'Seçtiğin ürün türüne uygun öncelikleri yeniden seçelim.' });
}).transform(normalizeDraft);

export function optionLabel(options: readonly { id: string; label: string }[], id: string) { return options.find(o => o.id === id)?.label || id; }
export const audienceLabels = { customers: 'Müşteriler / kullanıcılar', team: 'Kendi ekibimiz', both: 'Her ikisi', unsure: 'Birlikte netleştirelim' };
export const platformLabels = { both: 'iOS ve Android', ios: 'iOS', android: 'Android', unsure: 'Birlikte netleştirelim' };
export const userLabels = { under10: '10 kişiden az', '10to100': '10–100 kişi', '100to1000': '100–1.000 kişi', '1000plus': '1.000+ kişi', unsure: 'Henüz belli değil' };

export function openQuestions(draft: BriefDraft) {
  const questions: string[] = [];
  if (draft.types.includes('unsure')) questions.push('Ürünün en uygun platformu');
  if (draft.featuresUnsure || !draft.features.length) questions.push('İlk sürümün öncelikli işlevleri');
  if (draft.audience === 'unsure') questions.push('Hedef kullanıcı grubu');
  if (draft.types.includes('mobile') && draft.platform === 'unsure') questions.push('Mobil platform seçimi');
  if (draft.features.includes('integrations') && !draft.integrations.trim()) questions.push('Bağlanılacak sistemler ve API erişimi');
  if (draft.features.includes('migration')) questions.push('Taşınacak verinin biçimi ve hacmi');
  if (draft.features.includes('roles')) questions.push('Kullanıcı rollerinin yetki sınırları');
  if (draft.types.includes('existing') && !draft.existingUrl) questions.push('Mevcut ürün ve kaynak koda erişim');
  if (draft.timing === 'flexible') questions.push('İlk sürüm için hedef takvim');
  return questions;
}

export function briefMarkdown(draft: BriefDraft, reference?: string) {
  const d = normalizeDraft(draft);
  const lines = [
    '# Projenin ilk sayfası', 'Decent Devs — Good enough.', ...(reference ? [`Referans: ${reference}`] : []), '',
    '## Fikir', d.goal, '',
    '## Kapsam', `- Ürün: ${d.types.map(t => optionLabel(projectTypes, t)).join(', ') || 'Henüz seçilmedi'}`,
    `- Kullanıcılar: ${audienceLabels[d.audience]}`, `- Tahmini kullanıcı sayısı: ${userLabels[d.users]}`,
    ...(d.types.includes('mobile') ? [`- Mobil platform: ${platformLabels[d.platform]}`] : []),
    `- İlk sürüm öncelikleri: ${d.features.map(f => optionLabel(features, f)).join(', ') || 'Birlikte netleştirilecek'}`,
    ...(d.features.includes('integrations') ? [`- Bağlantılar: ${d.integrations || 'Birlikte netleştirilecek'}`] : []), '',
    '## Başlangıç noktası', `- Hazır materyaller: ${d.assets.map(a => optionLabel(assetOptions, a)).join(', ') || 'Henüz belirtilmedi'}`,
    ...(d.existingUrl ? [`- Mevcut ürün: ${d.existingUrl}`] : []),
    ...(d.references ? ['', 'Referans bağlantıları:', ...d.references.split('\n').filter(Boolean).map(r => `- ${r.trim()}`)] : []),
    ...(d.notes ? ['', 'Ek not:', d.notes] : []), '',
    '## Takvim',
    `- Takvim: ${optionLabel(timingOptions, d.timing)}`, ...(d.timing === 'fixed' ? [`- Hedef tarih: ${d.launchDate}`, ...(d.deadlineReason ? [`- Tarihin nedeni: ${d.deadlineReason}`] : [])] : []), '',
    '## Birlikte netleştirilecekler', ...(openQuestions(d).length ? openQuestions(d).map(q => `- ${q}`) : ['Kapsam ve efor değerlendirmesi.']), '',
    '## İletişim', `- İsim: ${d.name || 'Henüz belirtilmedi'}`, `- E-posta: ${d.email || 'Henüz belirtilmedi'}`,
    ...(d.company ? [`- Şirket: ${d.company}`] : []), ...(d.phone ? [`- Telefon: ${d.phone}`] : []), `- Slack tercihi: ${d.slack ? 'Slack üzerinden devam etmek istiyor' : 'E-posta'}`, '',
    'Bu özet, müşterinin paylaştığı ihtiyaçları içerir. Kapsam, efor ve teslim koşulları teklif aşamasında netleştirilir.',
  ];
  return lines.join('\n');
}
