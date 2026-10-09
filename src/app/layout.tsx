import type { Metadata, Viewport } from 'next';
import './fonts.css';
import '@fontsource-variable/dm-sans/wght.css';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FilmProvider } from '@/components/film';
import { Enhancements } from '@/components/enhancements';
import { WhatsAppContact } from '@/components/whatsapp-contact';
import { jsonLd, site } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'Decent Devs — Good enough. Web & Mobil Uygulama Stüdyosu', template: '%s — Decent Devs' },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'tr_TR', siteName: site.name, title: 'Decent Devs — Good enough.', description: site.description, images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Decent Devs — Good enough.' }] },
  twitter: { card: 'summary_large_image', title: 'Decent Devs — Good enough.', description: site.description, images: ['/og.png'] },
  icons: { icon: '/icon.svg?v=04-1', apple: '/apple-icon.png?v=04-1' },
};

export const viewport: Viewport = { themeColor: '#111113', colorScheme: 'dark' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><head><link rel="preload" href="/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body><FilmProvider><Header /><main id="icerik">{children}</main><Footer />{site.whatsappHref && <WhatsAppContact href={site.whatsappHref} />}<Enhancements /></FilmProvider><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@type': 'Organization', '@id': `${site.url}/#organization`, name: site.name, url: site.url, description: site.description, logo: `${site.url}/icon.svg`, ...(site.email ? { email: site.email } : {}) }) }} /></body></html>;
}
