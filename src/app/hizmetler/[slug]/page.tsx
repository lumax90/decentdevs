import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Check, Code2, Globe2, Layers, Smartphone } from 'lucide-react';
import { services, experiments } from '@/lib/content';
import { jsonLd, site } from '@/lib/site';
import { ContactBanner } from '@/components/contact-banner';

export function generateStaticParams() { return services.map(s => ({ slug: s.slug })); }
const titles = ['Web Sitesi Geliştirme & Özgün Web Tasarımı', 'Web Uygulama Geliştirme', 'iOS & Android Mobil Uygulama Geliştirme', 'Kurumsal Yazılım & Sistem Entegrasyonları'];
const icons = [Globe2, Code2, Smartphone, Layers];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const index = services.findIndex(s => s.slug === slug);
  if (index === -1) return {};
  const service = services[index];
  return { title: titles[index], description: service.description, alternates: { canonical: `/hizmetler/${slug}` }, openGraph: { title: `${titles[index]} — Decent Devs`, description: service.description, url: `/hizmetler/${slug}`, images: ['/og.png'] } };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = services.findIndex(s => s.slug === slug);
  if (index === -1) notFound();
  const s = services[index];
  const Icon = icons[index];
  const example = experiments[[2, 0, 1, 0][index]];
  return <div className="container detail-page">
    <Link href="/#neler-yapiyoruz" className="back-link"><ArrowLeft size={15} /> Neler yapıyoruz?</Link>
    <header className={`service-page-hero service-page-tone-${index}`}><div><span className="eyebrow">{s.number} / {s.name.toLocaleUpperCase('tr')}</span><h1>{s.title}</h1><p>{s.description}</p><Link href="/baslayalim" className="button button-lime">Fikrimi konuşalım <ArrowUpRight size={18} /></Link></div><div className="service-hero-object" aria-hidden="true"><Icon size={91} strokeWidth={1.3} /><span>made with care.</span></div></header>
    <div className="service-body"><section><span className="eyebrow">İŞİN ÖZÜ</span><h2>{s.short}</h2><p>{s.intro}</p><h3>Nasıl ilerliyoruz?</h3><p>{s.process}</p><div className="service-fit"><span>Kimin için?</span><p>{s.fit}</p></div></section><aside className="outcomes-card"><span className="eyebrow">BİRLİKTE NE OLUŞTURURUZ?</span><ul>{s.outcomes.map(outcome => <li key={outcome}><Check size={17} />{outcome}</li>)}</ul><div className="tag-list">{s.tags.map(t => <span key={t}>{t}</span>)}</div></aside></div>
    <Link href={`/laboratuvar/${example.slug}`} className={`related-experiment exp-${example.color}`}><span className="experiment-mini-icon" aria-hidden="true">{example.slug === 'orbit' ? 'o' : example.slug === 'sakin' ? '✳' : 'l.'}</span><div><span className="eyebrow">OYUN ALANINDAN / KONSEPT ÇALIŞMA</span><h2>{example.name} <span>— {example.tagline}</span></h2><p>{example.description}</p></div><ArrowUpRight size={27} /></Link>
    <section className="faq-section"><div><span className="eyebrow">AKLINDA OLABİLİR</span><h2>Birkaç iyi soru.</h2></div><div className="faq-list">{s.questions.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
    <ContactBanner />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([{ '@context': 'https://schema.org', '@type': 'Service', name: titles[index], description: s.description, serviceType: s.name, provider: { '@type': 'Organization', '@id': `${site.url}/#organization`, name: site.name }, areaServed: { '@type': 'Country', name: 'Türkiye' }, url: `${site.url}/hizmetler/${slug}` }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Decent Devs', item: site.url }, { '@type': 'ListItem', position: 2, name: s.name, item: `${site.url}/hizmetler/${slug}` }] }]) }} />
  </div>;
}
