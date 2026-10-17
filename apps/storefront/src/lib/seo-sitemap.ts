import type { MetadataRoute } from 'next';
import type { CatalogPageQuery } from '../generated/graphql';
import { absoluteUrl, categoryPath, productPath } from './seo';

type CatalogLoader = (input: { pageSize: number; page: number }) => Promise<CatalogPageQuery>;

export async function buildSitemap(load: CatalogLoader): Promise<MetadataRoute.Sitemap> {
  const first = await load({ pageSize: 24, page: 1 });
  const entries: MetadataRoute.Sitemap = ['/', '/shop', '/about', '/faq'].map((path) => ({
    url: absoluteUrl(path),
  }));
  entries.push(
    ...first.categories.map((category) => ({ url: absoluteUrl(categoryPath(category.slug)) })),
  );
  // The homepage query is limited to 100 products; paginate the full public catalog.
  let catalog = first.catalog;
  for (let page = 1; page <= first.catalog.totalPages; page++) {
    if (page > 1) catalog = (await load({ pageSize: 24, page })).catalog;
    entries.push(
      ...catalog.items
        .filter((product) => product.isActive)
        .map((product) => ({
          url: absoluteUrl(productPath(product.slug)),
          ...(Number.isFinite(Date.parse(product.updatedAt))
            ? { lastModified: new Date(product.updatedAt) }
            : {}),
        })),
    );
  }
  return entries;
}
