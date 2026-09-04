import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * One page, so this is short — but it is what declares the canonical host to
 * a crawler, and it is where new routes go when there are any.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
