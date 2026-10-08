export const site = {
  name: 'Decent Devs',
  slogan: 'Good enough.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://decentdevs.com').replace(/\/$/, ''),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  description: 'İyi görünen, iyi çalışan web siteleri ve uygulamalar. Decent Devs; web, mobil ve özel yazılım geliştiren bağımsız bir dijital stüdyo.',
};

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
