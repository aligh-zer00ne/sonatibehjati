import type { MetadataRoute } from 'next';
import { getCatalogPage } from '@/lib/catalog/service';
import { indexingEnabled } from '@/lib/seo';
import { buildSitemap } from '@/lib/seo-sitemap';

export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexingEnabled()) return [];
  return buildSitemap(getCatalogPage);
}
