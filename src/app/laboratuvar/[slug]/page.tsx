import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, MousePointer2 } from 'lucide-react';
import { experiments } from '@/lib/content';
import { OrbitDemo, SakinDemo, LumaDemo } from '@/components/demos';
import { ContactBanner } from '@/components/contact-banner';
import { jsonLd, site } from '@/lib/site';

export function generateStaticParams() { return experiments.map(p => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = experiments.find(p => p.slug === slug);
  if (!p) return {};
  return { title: `${p.name} — Etkileşimli ${p.category.toLocaleLowerCase('tr')} konsepti`, description: p.description, alternates: { canonical: `/laboratuvar/${slug}` }, openGraph: { title: `${p.name} — Decent Devs oyun alanı`, description: p.description, url: `/laboratuvar/${slug}`, images: ['/og.png'] } };
}

export default async function ExperimentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = experiments.find(p => p.slug === slug);
  if (!p) notFound();
  const next = experiments[(experiments.indexOf(p) + 1) % experiments.length];
  return <div className="container detail-page lab-page">
    <Link href="/#oyun-alani" className="back-link"><ArrowLeft size={15} /> Oyun alanına dön</Link>
    <header className="lab-heading"><div className="lab-meta"><span className="eyebrow">{p.name.toUpperCase()} / {p.category}</span><span className="lab-concept">Konsept çalışma</span></div><h1>{p.tagline}</h1><p>{p.description}</p></header>
    <section className={`lab-stage lab-${p.slug}`} aria-label={`${p.name} etkileşimli demo`}><h2 className="sr-only">{p.name} deneyimi</h2><span className="lab-stage-label"><MousePointer2 size={14} /> Kurcalamak serbest.</span><div className={`lab-demo lab-demo-${p.slug}`}>{p.slug === 'orbit' ? <OrbitDemo expanded /> : p.slug === 'sakin' ? <SakinDemo /> : <LumaDemo />}</div><span className="lab-stage-caption">STÜDYO DENEMESİ / ÖRNEK VERİLER</span></section>
    <div className="lab-story"><section><span className="eyebrow">ÇIKIŞ NOKTASI</span><h2>Biraz merakla başladı.</h2><p>{p.problem}</p><p>{p.lesson}</p></section><section><span className="eyebrow">DÜŞÜNDÜĞÜMÜZ DETAYLAR</span><ol>{p.decisions.map((decision, i) => <li key={decision}><span>0{i + 1}</span>{decision}</li>)}</ol></section></div>
    <p className="lab-provenance">{p.name}, tasarım ve geliştirme yaklaşımımızı paylaşmak için hazırladığımız bir stüdyo konsepti. Etkileşimler bu tarayıcı oturumunda, örnek verilerle çalışır.</p>
    <Link className="next-experiment" href={`/laboratuvar/${next.slug}`}><span className="eyebrow">BİR DE ŞUNA BAK</span><span>{next.name} <ArrowUpRight size={30} /></span></Link>
    <ContactBanner />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@type': 'CreativeWork', name: `${p.name} — konsept çalışma`, description: p.description, creator: { '@type': 'Organization', '@id': `${site.url}/#organization`, name: site.name }, inLanguage: 'tr', url: `${site.url}/laboratuvar/${p.slug}`, genre: 'Etkileşimli arayüz prototipi' }) }} />
  </div>;
}
