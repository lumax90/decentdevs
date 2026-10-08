'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Globe2, MousePointer2, Smartphone, Sparkles } from 'lucide-react';
import { LumaDemo, OrbitDemo, SakinDemo } from './demos';
import { experiments, type ExperimentId } from '@/lib/content';

export function Playground() {
  const [active, setActive] = useState<ExperimentId>('orbit');
  return <section className="playground-section" id="oyun-alani" aria-label="Etkileşimli stüdyo konseptleri">
    <h2 className="sr-only">Etkileşimli stüdyo çalışmaları</h2>
    <div className="playground-stage" data-active={active}>
      <div className="stage-halo" /><div className="stage-floor" />
      <span className="stage-sticker sticker-one" aria-hidden="true">✳</span>
      <span className="stage-sticker sticker-two" aria-hidden="true">hello,<br /><b>possibilities.</b></span>
      <div className="stage-window stage-orbit"><OrbitDemo /></div>
      <div className="stage-window stage-sakin"><SakinDemo /></div>
      <div className="stage-window stage-luma"><LumaDemo /></div>
      <span className="playground-hint"><MousePointer2 size={14} /> Evet, bunlarla oynayabilirsin.</span>
      <div className="playground-switch" aria-label="Öne çıkan konsepti seç">
        <button type="button" aria-pressed={active === 'orbit'} onClick={() => setActive('orbit')}><Globe2 size={14} /> Web</button>
        <button type="button" aria-pressed={active === 'sakin'} onClick={() => setActive('sakin')}><Smartphone size={14} /> Mobil</button>
        <button type="button" aria-pressed={active === 'luma'} onClick={() => setActive('luma')}><Sparkles size={14} /> Biraz tasarım</button>
      </div>
    </div>
    <div className="playground-caption"><span className="eyebrow"><span className="tiny-dot" /> STÜDYO OYUN ALANI</span><p>Meraktan doğan, örnek verilerle çalışan konseptler.</p></div>
    <div className="experiment-links">{experiments.map(p => <Link href={`/laboratuvar/${p.slug}`} key={p.slug} className={`experiment-link exp-${p.color}`}><div><span className="eyebrow">{p.category} <span className="concept-tag">KONSEPT</span></span><h2>{p.name}<ArrowUpRight size={20} /></h2><p>{p.tagline}</p></div><span className="experiment-mini-icon" aria-hidden="true">{p.slug === 'orbit' ? 'o' : p.slug === 'sakin' ? '✳' : 'l.'}</span></Link>)}</div>
  </section>;
}
