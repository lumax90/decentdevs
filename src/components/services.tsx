'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Check, Code2, Globe2, Layers, Smartphone } from 'lucide-react';
import { services } from '@/lib/content';

const icons = [Globe2, Code2, Smartphone, Layers];

export function Services() {
  const [selected, setSelected] = useState(0);
  const current = services[selected];
  const Icon = icons[selected];
  return <section className="services-section section-space" id="neler-yapiyoruz" data-reveal>
    <div className="section-heading"><div><span className="eyebrow">BİR FİKRE BİRDEN FAZLA YOL</span><h2>İnternette.<br />Cebinde. İşinin içinde.</h2></div><p>Güzel bir web sitesi de olur.<br />Aklındaki uygulama da.<br /><span>Doğru yerden başlayalım.</span></p></div>
    <div className="service-explorer"><div className="service-options" role="tablist" aria-label="Hizmetler" aria-orientation="vertical">{services.map((s, i) => <button type="button" role="tab" key={s.slug} id={`service-tab-${i}`} aria-controls="service-detail" aria-selected={selected === i} tabIndex={selected === i ? 0 : -1} onKeyDown={e => { if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? 3 : (i + (e.key === 'ArrowDown' ? 1 : -1) + 4) % 4; setSelected(next); document.getElementById(`service-tab-${next}`)?.focus(); } }} onClick={() => setSelected(i)}><span className="service-number">{s.number}</span><span><strong>{s.name}</strong><small>{s.short}</small></span><ArrowDownRight size={21} /></button>)}</div>
      <div className={`service-detail service-tone-${selected}`} role="tabpanel" id="service-detail" aria-labelledby={`service-tab-${selected}`} tabIndex={0}>
        <div className="service-visual" aria-hidden="true"><span className="service-orbit orbit-a" /><span className="service-orbit orbit-b" /><span className="service-object"><Icon size={48} strokeWidth={1.3} /></span><span className="service-little-check"><Check size={17} /></span><span className="service-code-tag">{['<hello world />', 'idea → product', 'made for your thumb', 'less busywork.'][selected]}</span></div>
        <div className="service-detail-copy" key={current.key}><h3>{current.title}</h3><p>{current.description}</p><div className="tag-list">{current.tags.map(t => <span key={t}>{t}</span>)}</div><Link className="text-link" href={`/hizmetler/${current.slug}`}>Biraz daha yakından <ArrowUpRight size={17} /></Link></div>
      </div>
    </div>
    <div className="tech-line"><span>Araç kutusunda neler var?</span><div>{['React', 'Vue', 'Nuxt', 'Rust', 'iOS native', 'Android native'].map(t => <span key={t}>{t}</span>)}</div><span className="tech-aside">İhtiyaca göre, kararında.</span></div>
  </section>;
}
