import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from './brand';
import { services } from '@/lib/content';
import { site } from '@/lib/site';

export function Footer() {
  return <footer className="site-footer container">
    <div className="footer-main">
      <div><Brand /><p>İyi şeyler yapmayı seven<br />bağımsız bir dijital stüdyo.</p></div>
      <div className="footer-links"><span className="eyebrow">NELER YAPIYORUZ?</span>{services.map(s => <Link key={s.slug} href={`/hizmetler/${s.slug}`}>{s.name}</Link>)}</div>
      <div className="footer-links"><span className="eyebrow">BİR MERHABA</span><Link href="/baslayalim" prefetch={false}>Aklındakini anlat <ArrowUpRight size={15} /></Link>{site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}<Link href="/#oyun-alani" prefetch={false}>Oyun alanına dön</Link><Link href="/gizlilik">Gizlilik</Link></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Decent Devs</span><span>Made with care. <span className="footer-wink">And a little overthinking.</span></span><span>Good enough.</span></div>
  </footer>;
}
