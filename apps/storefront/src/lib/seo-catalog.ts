import 'server-only';
import { notFound } from 'next/navigation';
import { getCatalogPage } from './catalog/service';
import { parseCatalogParams, type CatalogParams } from './catalog/params';
import { catalogMetadata } from './seo';

export async function listingMetadata(
  path: string,
  title: string,
  params: CatalogParams,
  category?: string,
) {
  const parsed = parseCatalogParams(params, category);
  // Detect missing pages before metadata is sent, so crawlers receive a 404
  // rather than a streamed empty listing with HTTP 200.
  if (parsed.success && parsed.data.page > 1) {
    const { catalog } = await getCatalogPage(parsed.data);
    if (catalog.page > catalog.totalPages) notFound();
  }
  return catalogMetadata(path, title, params, category);
}
