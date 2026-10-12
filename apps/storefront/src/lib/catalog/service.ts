import 'server-only';
import { executeGraphQL } from '@behjati/graphql';
import { defaultHomepage } from '@behjati/shared/homepage';
import { HomepageContentDocument, HomepageCatalogDocument } from '@/generated/graphql';
import {
  CatalogPageDocument,
  ProductDetailDocument,
  SelectedProductsDocument,
} from '@/generated/graphql';
import { catalogFilterSchema, selectionSchema, type CatalogFilter } from '@behjati/shared';
import { cache } from 'react';
import { filterMockCatalog } from './filter';
import { mockCatalog } from './mock';
export const getHomepageCatalog = cache(async () => {
  if (process.env.CATALOG_SOURCE === 'api')
    return executeGraphQL(
      process.env.API_URL ?? 'http://localhost:4000/graphql',
      HomepageCatalogDocument,
      {},
    );
  if (process.env.NODE_ENV === 'production' && process.env.CATALOG_SOURCE !== 'mock')
    throw new Error('Configure CATALOG_SOURCE explicitly as api or mock.');
  return mockCatalog;
});
const endpoint = () => process.env.API_URL ?? 'http://localhost:4000/graphql';
export async function getCatalogPage(input: Partial<CatalogFilter>) {
  const filter = catalogFilterSchema.parse(input);
  if (process.env.CATALOG_SOURCE === 'api')
    return executeGraphQL(endpoint(), CatalogPageDocument, { input: filter });
  const data = await getHomepageCatalog();
  return { categories: data.categories, catalog: filterMockCatalog(data.products, filter) };
}
export const getProduct = cache(async (slug: string) => {
  if (process.env.CATALOG_SOURCE === 'api')
    return (await executeGraphQL(endpoint(), ProductDetailDocument, { slug })).product;
  return (
    (await getHomepageCatalog()).products.find(
      (product) => product.slug === slug && product.isActive,
    ) ?? null
  );
});
export async function getSelectedProducts(ids: string[]) {
  const valid = selectionSchema.parse({ ids });
  if (!valid.ids.length) return [];
  if (process.env.CATALOG_SOURCE === 'api')
    return (await executeGraphQL(endpoint(), SelectedProductsDocument, { ids: valid.ids }))
      .productsByIds;
  return (await getHomepageCatalog()).products.filter(
    (product) => product.isActive && valid.ids.includes(product.id),
  );
}

export const getHomepageContent = cache(async () => {
  if (process.env.CATALOG_SOURCE !== 'api') return defaultHomepage;
  return (await executeGraphQL(endpoint(), HomepageContentDocument, {})).homepageContent;
});
