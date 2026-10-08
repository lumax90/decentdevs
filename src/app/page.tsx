import { Code2, Heart, Sparkles } from 'lucide-react';
import { Playground } from '@/components/playground';
import { Services } from '@/components/services';
import { FilmCard } from '@/components/film';
import { ContactBanner } from '@/components/contact-banner';
import OrbitDeliveryHero from '@/components/ui/orbit-delivery-hero';

export default function Home() {
  return <>
    <OrbitDeliveryHero />
    <div className="container"><Playground /><Services />
      <section className="approach-section section-space" id="yaklasim" data-reveal>
        <div className="section-heading"><div><span className="eyebrow">ARAÇLAR İYİ. KARARLAR DA ÖYLE OLMALI.</span><h2>AI var.<br />Bir de işin incelikleri.</h2></div><p>Hızlı başlamak güzel.<br /><span>İyi bir yere varmak daha güzel.</span></p></div>
        <FilmCard />
        <div className="approach-points"><article><span className="point-icon lavender"><Sparkles size={20} /></span><h3>Önce doğru sorular.</h3><p>İhtiyacı anlar, kapsamı netleştiririz. İyi bir prompt da iyi bir ürün de doğru bağlamla başlar.</p></article><article><span className="point-icon mint"><Code2 size={20} /></span><h3>Hızın yanında muhakeme.</h3><p>AI ile üretir, kodu inceler, gerektiğinde elle düzeltiriz. Mimari, entegrasyon ve zor kısımlar bizde.</p></article><article><span className="point-icon peach"><Heart size={20} /></span><h3>Son piksele. Son teste.</h3><p>Gerçek kullanım, hata durumları, testler ve yayın. Güzel başlayan fikrin arkasını da getiririz.</p></article></div>
      </section>
      <section className="studio-note" data-reveal><span className="studio-note-asterisk" aria-hidden="true">✳</span><div><p>Meraklı insanlarız. Bir butonun hissine de,<br className="desktop-break" /> arkasında çalışan sisteme de takılırız.</p><span>BİRAZ BİZİ ANLATIYOR.</span></div><span className="studio-note-signature">decent, by choice.</span></section>
      <ContactBanner />
    </div>
  </>;
}
