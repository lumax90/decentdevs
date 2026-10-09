'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Code2, Download, Gamepad2, Globe2, Layers, LoaderCircle, MessageSquare, Pencil, Plus, Smartphone, Sparkles, Wand2, X } from 'lucide-react';
import { BrandMark } from './brand';
import { assetOptions, audienceLabels, availableFeatures, briefSchema, draftSchema, emptyDraft, features, normalizeDraft, openQuestions, optionLabel, platformLabels, projectTypes, timingOptions, userLabels, validateStep, type BriefDraft, type ProjectType } from '@/lib/brief';

const steps = ['Fikir', 'İhtiyaçlar', 'Elimizdekiler', 'Takvim', 'Bir merhaba'];
const icons = [Globe2, Code2, Smartphone, Gamepad2, Layers, Wand2, Sparkles];
const STORAGE_KEY = 'decent-project-v1';
type Result = { reference: string; markdown: string; deliveryMode: 'local' | 'connected' };

function downloadBrief(markdown: string, reference = 'taslak') {
  const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `decent-devs-${reference}.md`;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function Field({ id, label, hint, error, optional = false, children }: { id: string; label: string; hint?: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return <div className={`form-field ${error ? 'field-error' : ''}`}><label htmlFor={id}>{label}{optional && <span>isteğe bağlı</span>}</label>{hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}{children}{error && <p className="field-error-text" id={`${id}-error`} role="alert">{error}</p>}</div>;
}

export function BriefWizard() {
  const [draft, setDraft] = useState<BriefDraft>(emptyDraft);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const key = useRef('');
  const heading = useRef<HTMLHeadingElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const didNavigate = useRef(false);

  useEffect(() => {
    let initial = emptyDraft;
    let initialStep = 0;
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      const parsed = draftSchema.safeParse(saved?.draft);
      if (parsed.success && typeof saved.savedAt === 'number' && Date.now() - saved.savedAt < 86400000) {
        initial = normalizeDraft(parsed.data);
        initialStep = Number.isInteger(saved.step) ? Math.max(0, Math.min(4, saved.step)) : 0;
        key.current = typeof saved.key === 'string' ? saved.key : '';
        setResumed(parsed.data.types.length > 0 || Boolean(parsed.data.goal));
      }
    } catch { /* Storage is optional; the form still works in a private/restricted browser. */ }
    const requested = new URLSearchParams(window.location.search).get('tur');
    const selected = projectTypes.find(type => type.id === requested)?.id;
    if (selected && !initial.types.includes(selected)) {
      initial = normalizeDraft({ ...initial, types: selected === 'unsure' ? ['unsure'] : [...initial.types.filter(type => type !== 'unsure'), selected] });
      initialStep = 0;
      key.current = '';
    }
    setDraft(initial);
    setStep(initialStep);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || result) return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, step, key: key.current, savedAt: Date.now() })); } catch { /* Optional draft persistence. */ }
  }, [draft, step, ready, result]);
  useEffect(() => {
    if (didNavigate.current) heading.current?.focus({ preventScroll: true });
  }, [step]);
  useEffect(() => {
    if (!result) return;
    successHeading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [result]);

  function update<K extends keyof BriefDraft>(field: K, value: BriefDraft[K]) {
    key.current = '';
    setDraft(d => normalizeDraft({ ...d, [field]: value }));
    setErrors(e => { const next = { ...e }; delete next[field]; return next; });
    setServerError('');
  }

  function chooseType(type: ProjectType) {
    const types = type === 'unsure' ? ['unsure' as const] : draft.types.includes(type) ? draft.types.filter(t => t !== type) : [...draft.types.filter(t => t !== 'unsure'), type];
    update('types', types);
  }

  function move(next: number) {
    setStep(next); setErrors({}); setServerError(''); didNavigate.current = true;
    document.getElementById('brief-form')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    if (next === 4) setSummaryOpen(true);
  }

  function next() {
    const problems = validateStep(draft, step);
    setErrors(problems);
    if (Object.keys(problems).length) {
      document.getElementById(Object.keys(problems)[0])?.focus();
      return;
    }
    move(step + 1);
  }

  async function submit() {
    const parsed = briefSchema.safeParse(draft);
    if (!parsed.success) {
      const problems = Object.fromEntries(parsed.error.issues.map(i => [String(i.path[0]), i.message]));
      const invalidStep = [0, 1, 2, 3, 4].find(s => Object.keys(validateStep(draft, s)).length);
      if (invalidStep !== undefined && invalidStep !== step) move(invalidStep);
      setErrors(problems); return;
    }
    setSending(true); setServerError('');
    try {
      key.current ||= crypto.randomUUID();
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, step, key: key.current, savedAt: Date.now() })); } catch { /* Optional storage. */ }
      const response = await fetch('/api/brief', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key.current }, body: JSON.stringify(parsed.data), signal: AbortSignal.timeout(20000) });
      const body = await response.json();
      if (!response.ok) {
        if (body.fields) setErrors(body.fields);
        throw new Error(body.error || 'Notunu şu anda gönderemedik. Bir kez daha deneyebilir misin?');
      }
      setResult({ reference: body.reference, markdown: body.markdown, deliveryMode: body.deliveryMode });
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* Optional storage. */ }
    } catch (error) {
      setServerError(error instanceof TypeError || error instanceof SyntaxError
        ? 'Bağlantıyı kontrol edip tekrar deneyebilir misin? Cevapların burada duruyor.'
        : error instanceof Error && !['TimeoutError', 'AbortError'].includes(error.name)
          ? error.message
          : 'Bağlantı biraz yavaş kaldı. Notların burada; tekrar deneyebilirsin.');
    } finally { setSending(false); }
  }

  if (result) return <div className="brief-success container"><BrandMark /><span className="eyebrow">GÜZEL BİR BAŞLANGIÇ</span><h1 ref={successHeading} tabIndex={-1}>Notunu aldık<span>.</span></h1><p>Fikrin artık derli toplu bir proje özeti.<br />Bir kopyası sende de kalsın.</p><span className="brief-reference">{result.reference}</span><div className="success-actions"><button type="button" className="button button-lime" onClick={() => downloadBrief(result.markdown, result.reference)}>Proje özetimi indir <Download size={17} /></button><Link className="button button-ghost" href="/">Stüdyoya dön <ArrowUpRight size={17} /></Link></div>{draft.slack && <p className="success-note">Slack üzerinden devam etme tercihini de not ettik.</p>}{result.deliveryMode === 'local' && <p className="local-mode-note">Bu önizlemede brief yerel olarak kaydedildi. E-posta ve Slack bildirimleri, bağlantılar yapılandırıldığında devreye girer.</p>}</div>;

  return <div className="brief-page container">
    <div className="brief-intro"><Link href="/" className="back-link"><ArrowLeft size={15} /> Stüdyoya dön</Link><span className="eyebrow">HER ŞEY BİR FİKİRLE BAŞLAR.</span><h1>Aklındakini<br />biraz açalım<span>.</span></h1><p>Birkaç iyi soru soracağız. Cevapların, projenin ilk sayfasına dönüşecek.</p></div>
    {resumed && <div className="draft-resumed"><span><Check size={15} /> Kaldığın yeri hatırladık.</span><button type="button" disabled={sending} onClick={() => { setDraft(emptyDraft); setStep(0); setResumed(false); setErrors({}); setServerError(''); setSummaryOpen(false); key.current = ''; }}>Yeni bir başlangıç</button><button type="button" aria-label="Taslak bildirimini kapat" onClick={() => setResumed(false)}><X size={15} /></button></div>}
    <div className="brief-layout">
      <div className="brief-form-column" id="brief-form">
        <nav className="brief-steps" aria-label="Proje formu adımları">{steps.map((label, i) => <button type="button" key={label} aria-current={step === i ? 'step' : undefined} disabled={i > step || sending} onClick={() => move(i)}><span>{i < step ? <Check size={12} /> : `0${i + 1}`}</span><span>{label}</span></button>)}</nav>
        <form className="brief-form" noValidate aria-busy={sending} onSubmit={e => { e.preventDefault(); if (!sending) { if (step < 4) next(); else void submit(); } }}>
          <fieldset className="form-step" key={step} disabled={sending}>
            <span className="step-kicker">{step + 1} / 5 · {['BAŞLANGIÇ NOKTASI', 'ÖNCELİKLER', 'MEVCUT DURUM', 'TAKVİM', 'SON BİR KONTROL'][step]}</span>
            <h2 ref={heading} tabIndex={-1}>{['Neyi hayata geçiriyoruz?', 'İlk sürümde neler olsun?', 'Elimizde neler var?', 'Aklındaki takvim nasıl?', 'Bir de tanışalım.'][step]}</h2>
            <p className="step-description">{['Birden fazla seçim yapabilirsin. Henüz adı konmamış bir fikir de olur.', 'En önemli olanları işaretle. Ayrıntıları birlikte netleştiririz.', 'Hazır olanlar, başlayacağımız yeri belirlememize yardımcı olur.', 'Kesin bir tarih gerekmiyor. Fikrinin hangi aşamada olduğunu bilmemiz yeterli.', 'Yandaki özet senin söylediklerinle oluştu. İstediğin bölümü düzenleyebilirsin.'][step]}</p>

            {step === 0 && <>
              <fieldset className="type-options" id="types" tabIndex={-1} aria-describedby={errors.types ? 'types-error' : undefined}><legend className="sr-only">Proje türü</legend>{projectTypes.map((type, i) => { const Icon = icons[i]; const checked = draft.types.includes(type.id); return <button type="button" key={type.id} className={`type-option ${checked ? 'selected' : ''}`} aria-pressed={checked} onClick={() => chooseType(type.id)}><Icon size={22} strokeWidth={1.5} /><span><strong>{type.label}</strong><small>{type.hint}</small></span><span className="choice-check">{checked ? <Check size={11} /> : <Plus size={11} />}</span></button>; })}</fieldset>
              {errors.types && <p id="types-error" className="field-error-text" role="alert">{errors.types}</p>}
              <Field id="goal" label="Bu fikir, neyi kolaylaştıracak?" hint={draft.types.includes('internal') ? 'Örneğin: Saha ekibi notları telefondan girsin, ofis tek panelden görsün.' : 'Kime, ne yapmak istediğini kendi kelimelerinle anlatman yeterli.'} error={errors.goal}><textarea id="goal" value={draft.goal} maxLength={1500} rows={4} placeholder="Aklımdaki şey şöyle…" aria-invalid={!!errors.goal} aria-describedby={errors.goal ? 'goal-error' : 'goal-hint'} onChange={e => update('goal', e.target.value)} /><span className="character-count">{draft.goal.length} / 1500</span></Field>
            </>}

            {step === 1 && <>
              <Field id="audience" label="Kim kullanacak?"><select id="audience" value={draft.audience} onChange={e => update('audience', e.target.value as BriefDraft['audience'])}>{Object.entries(audienceLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></Field>
              <fieldset className="feature-fieldset" id="features" tabIndex={-1} aria-describedby={errors.features ? 'features-error' : undefined}><legend>İlk akla gelen ihtiyaçlar</legend><div className="feature-options">{availableFeatures(draft.types).map(feature => <button type="button" key={feature.id} className="feature-chip" aria-pressed={draft.features.includes(feature.id)} onClick={() => { const values = draft.features.includes(feature.id) ? draft.features.filter(f => f !== feature.id) : [...draft.features, feature.id]; key.current = ''; setDraft(d => normalizeDraft({ ...d, features: values, featuresUnsure: false })); setErrors(e => ({ ...e, features: '' })); }}>{draft.features.includes(feature.id) ? <Check size={13} /> : <Plus size={13} />}{feature.label}</button>)}</div><button type="button" className="feature-unsure" aria-pressed={draft.featuresUnsure} onClick={() => { key.current = ''; setDraft(d => normalizeDraft({ ...d, featuresUnsure: !d.featuresUnsure, features: [] })); setErrors(e => ({ ...e, features: '' })); }}><span className="choice-check">{draft.featuresUnsure && <Check size={11} />}</span>Bunları birlikte netleştirelim.</button></fieldset>
              {errors.features && <p id="features-error" className="field-error-text" role="alert">{errors.features}</p>}
              {draft.types.includes('mobile') && <Field id="platform" label="Hangi telefonlarda olsun?"><select id="platform" value={draft.platform} onChange={e => update('platform', e.target.value as BriefDraft['platform'])}>{Object.entries(platformLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></Field>}
              {draft.features.includes('integrations') && <Field id="integrations" label="Hangi sistemlere bağlanacak?" optional hint="ERP, CRM, ödeme servisi… Bildiklerini yaz. Henüz net değilse boş bırakabilirsin."><input id="integrations" value={draft.integrations} maxLength={500} placeholder="Örn. Logo ERP, iyzico, mevcut API…" onChange={e => update('integrations', e.target.value)} /></Field>}
              {(draft.types.includes('internal') || draft.types.includes('webapp') || draft.types.includes('mobile')) && <Field id="users" label="İlk etapta yaklaşık kaç kullanıcı?"><select id="users" value={draft.users} onChange={e => update('users', e.target.value as BriefDraft['users'])}>{Object.entries(userLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></Field>}
            </>}

            {step === 2 && <>
              <fieldset className="feature-fieldset"><legend>Hazır olanları işaretle</legend><div className="asset-options">{assetOptions.map(asset => <button type="button" key={asset.id} aria-pressed={draft.assets.includes(asset.id)} onClick={() => update('assets', draft.assets.includes(asset.id) ? draft.assets.filter(a => a !== asset.id) : [...draft.assets, asset.id])}><span className="choice-check">{draft.assets.includes(asset.id) && <Check size={12} />}</span>{asset.label}</button>)}</div><p className="field-hint">Sıfırdan başlıyorsak seçim yapmadan ilerleyebilirsin.</p></fieldset>
              <Field id="existingUrl" label="Mevcut site veya ürün bağlantısı" optional error={errors.existingUrl}><input id="existingUrl" type="url" inputMode="url" placeholder="https://" value={draft.existingUrl} maxLength={500} aria-invalid={!!errors.existingUrl} aria-describedby={errors.existingUrl ? 'existingUrl-error' : undefined} onChange={e => update('existingUrl', e.target.value)} /></Field>
              <Field id="references" label="“Şunun hissini seviyorum” dediğin bir şey?" optional hint="Her satıra bir bağlantı. En fazla üç tane yeterli." error={errors.references}><textarea id="references" rows={3} placeholder="Bir site, uygulama veya tasarım bağlantısı…" value={draft.references} maxLength={1600} aria-invalid={!!errors.references} aria-describedby={errors.references ? 'references-error' : 'references-hint'} onChange={e => update('references', e.target.value)} /></Field>
              <Field id="notes" label="Bir de şunu bilin…" optional><textarea id="notes" rows={3} placeholder="Özel bir ihtiyaç, mevcut teknoloji, aklına takılan bir ayrıntı…" value={draft.notes} maxLength={1500} onChange={e => update('notes', e.target.value)} /></Field>
            </>}

            {step === 3 && <>
              <fieldset className="timing-fieldset"><legend>Ne zaman hayata geçsin?</legend>{timingOptions.map(t => <button type="button" key={t.id} aria-pressed={draft.timing === t.id} onClick={() => update('timing', t.id)}><span className="radio-dot" />{t.label}</button>)}</fieldset>
              {draft.timing === 'fixed' && <div className="conditional-fields"><Field id="launchDate" label="Hedef tarih" error={errors.launchDate}><input id="launchDate" type="date" min={new Date().toISOString().slice(0, 10)} value={draft.launchDate} aria-invalid={!!errors.launchDate} aria-describedby={errors.launchDate ? 'launchDate-error' : undefined} onChange={e => update('launchDate', e.target.value)} /></Field><Field id="deadlineReason" label="Bu tarihin özel bir nedeni var mı?" optional><input id="deadlineReason" maxLength={300} placeholder="Örn. Lansman, fuar, sezon başlangıcı…" value={draft.deadlineReason} onChange={e => update('deadlineReason', e.target.value)} /></Field></div>}
            </>}

            {step === 4 && <>
              <div className="field-row"><Field id="name" label="Adın" error={errors.name}><input id="name" name="name" autoComplete="name" value={draft.name} maxLength={90} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} onChange={e => update('name', e.target.value)} /></Field><Field id="email" label="E-posta adresin" error={errors.email}><input id="email" name="email" type="email" autoComplete="email" value={draft.email} maxLength={200} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} onChange={e => update('email', e.target.value)} /></Field></div>
              <div className="field-row"><Field id="company" label="Şirket / marka" optional><input id="company" autoComplete="organization" value={draft.company} maxLength={120} onChange={e => update('company', e.target.value)} /></Field><Field id="phone" label="Telefon" optional error={errors.phone}><input id="phone" type="tel" autoComplete="tel" value={draft.phone} maxLength={35} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} onChange={e => update('phone', e.target.value)} /></Field></div>
              <label className={`slack-choice ${draft.slack ? 'selected' : ''}`}><input type="checkbox" checked={draft.slack} onChange={e => update('slack', e.target.checked)} /><MessageSquare size={22} /><span><strong>Slack’te devam edelim.</strong><small>Proje için bize özel bir iletişim alanı iyi olur.</small></span><span className="choice-check">{draft.slack && <Check size={12} />}</span></label>
              <p className="privacy-note">Bilgilerini bu proje talebini değerlendirmek ve seninle iletişim kurmak için kullanırız. <Link href="/gizlilik" target="_blank">Gizlilik notumuz ↗</Link></p>
              <div className="honeypot" aria-hidden="true"><label htmlFor="fax">Fax<input id="fax" name="fax" tabIndex={-1} autoComplete="off" value={draft.fax} onChange={e => update('fax', e.target.value)} /></label></div>
            </>}
          </fieldset>
          {serverError && <div className="submit-error" role="alert">{serverError}</div>}
          <div className="form-navigation"><button type="button" className="form-back" disabled={step === 0 || sending} onClick={() => move(step - 1)}><ArrowLeft size={16} /> Geri</button><span>{step === 4 ? 'Güzel bir başlangıç olacak.' : 'Emin olmadığın şeyleri birlikte buluruz.'}</span><button type="submit" className="button button-lime" disabled={sending || !ready}>{sending ? <><LoaderCircle className="spin" size={17} /> Kaydediliyor</> : step === 4 ? <>Notumu gönder <ArrowUpRight size={17} /></> : <>Devam <ArrowRight size={17} /></>}</button></div>
        </form>
      </div>
      <aside className={`brief-summary ${summaryOpen ? 'summary-open' : ''}`}>
        <button type="button" className="summary-toggle" aria-expanded={summaryOpen} aria-controls="summary-paper" onClick={() => setSummaryOpen(!summaryOpen)}><span>Projenin ilk sayfası <small>Cevaplarınla şekilleniyor</small></span><ChevronDown size={19} /></button>
        <div className="summary-paper" id="summary-paper"><div className="paper-top"><BrandMark /><span>PROJE NOTU / TASLAK</span><span className="paper-dot" /></div><h2>Projenin<br />ilk sayfası<span>.</span></h2><p className="paper-subtitle">İyi bir başlangıç, net bir fikir.</p>
          <div className="paper-section"><span>NE YAPIYORUZ? <button type="button" disabled={sending} aria-label="Proje fikrini düzenle" onClick={() => move(0)}><Pencil size={11} /></button></span>{draft.types.length ? <strong>{draft.types.map(t => optionLabel(projectTypes, t)).join(' + ')}</strong> : <i className="paper-placeholder">Birazdan şekillenecek…</i>}{draft.goal && <p className="paper-goal">{draft.goal}</p>}</div>
          <div className="paper-section"><span>İLK SÜRÜM <button type="button" disabled={sending} aria-label="İhtiyaçları düzenle" onClick={() => move(Math.min(step, 1))}><Pencil size={11} /></button></span><div className="paper-tags">{draft.features.length ? draft.features.map(f => <span key={f}>{optionLabel(features, f)}</span>) : <i className="paper-placeholder">{draft.featuresUnsure ? 'Birlikte netleştireceğiz.' : 'Önceliklerini bekliyor.'}</i>}</div>{draft.types.includes('mobile') && <p className="paper-meta">{platformLabels[draft.platform]}</p>}</div>
          <div className="paper-section"><span>BAŞLANGIÇ NOKTASI <button type="button" disabled={sending} aria-label="Hazır materyalleri düzenle" onClick={() => move(Math.min(step, 2))}><Pencil size={11} /></button></span><p className="paper-meta">{draft.assets.length ? draft.assets.map(a => optionLabel(assetOptions, a)).join(', ') : 'Birlikte şekillenecek.'}</p></div>
          <div className="paper-section"><span>TAKVİM <button type="button" disabled={sending} aria-label="Takvimi düzenle" onClick={() => move(Math.min(step, 3))}><Pencil size={11} /></button></span><p className="paper-meta">{draft.timing === 'fixed' && draft.launchDate ? draft.launchDate : optionLabel(timingOptions, draft.timing)}</p></div>
          <div className="paper-bottom"><span className="paper-open-questions"><span className="tiny-dot" /> {openQuestions(draft).length} konu birlikte netleşecek.</span><span>good enough for a start.</span></div>
        </div>
        <p className="summary-footnote"><Check size={13} /> Göndermeden önce her şeyi düzenleyebilirsin.</p>
      </aside>
    </div>
  </div>;
}
