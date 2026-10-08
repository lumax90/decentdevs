import type { MetadataRoute } from 'next';
import { services, experiments } from '@/lib/content';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, priority: 1, changeFrequency: 'monthly' },
    ...services.map(s => ({ url: `${site.url}/hizmetler/${s.slug}`, priority: 0.8, changeFrequency: 'monthly' as const })),
    ...experiments.map(p => ({ url: `${site.url}/laboratuvar/${p.slug}`, priority: 0.7, changeFrequency: 'monthly' as const })),
  ];
}
