import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { BrandMark } from './brand';

export function ContactBanner() {
  return <section className="contact-banner" data-reveal><div><span className="eyebrow">İYİ FİKİRLERE YER VAR.</span><h2>Fikrinle başlayalım<span>.</span></h2><p>İster küçük bir fikir olsun, ister bir süredir aklından çıkmayan o proje.</p><Link className="button button-dark" href="/baslayalim" prefetch={false}>Fikrini anlat <ArrowUpRight size={18} /></Link><span className="contact-small">Birkaç iyi soru. Güzel bir başlangıç.</span></div><div className="contact-character" aria-hidden="true"><BrandMark /><span>say hello.</span></div></section>;
}
