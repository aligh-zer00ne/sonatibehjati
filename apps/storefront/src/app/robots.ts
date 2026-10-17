import type { MetadataRoute } from 'next';
import { absoluteUrl, indexingEnabled } from '@/lib/seo';
export const dynamic = 'force-dynamic';
export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled()) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    // Covers search crawlers, including OAI-SearchBot. HTML pages carrying
    // noindex remain crawlable so that crawlers can actually read that directive.
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/payment/sep/callback/', '/payment/sep/status/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
