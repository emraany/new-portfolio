import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * The canonical production host is hardcoded on purpose.
 *
 * `VERCEL_URL` resolves to the per-deployment `*.vercel.app` hostname even in
 * production, so deriving the host from it would point crawlers at a preview
 * domain and an off-domain sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
