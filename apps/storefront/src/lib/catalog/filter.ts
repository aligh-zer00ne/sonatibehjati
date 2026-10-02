import { normalizeSearch, type CatalogFilter } from '@behjati/shared';
import type { CatalogProductFragment, CatalogPageQuery } from '@/generated/graphql';
export function filterMockCatalog(
  products: readonly CatalogProductFragment[],
  filter: CatalogFilter,
): CatalogPageQuery['catalog'] {
  const items = products.filter(
    (product) =>
      product.isActive &&
      (!filter.category || product.category.slug === filter.category) &&
      (!filter.excludeSlug || product.slug !== filter.excludeSlug) &&
      (!filter.search ||
        normalizeSearch(`${product.title} ${product.shortDescription}`).includes(filter.search)) &&
      (filter.minPrice === undefined || product.price >= filter.minPrice) &&
      (filter.maxPrice === undefined || product.price <= filter.maxPrice),
  );
  items.sort((a, b) => {
    let order = 0;
    if (filter.sort === 'PRICE_ASC') order = a.price - b.price;
    else if (filter.sort === 'PRICE_DESC') order = b.price - a.price;
    else if (filter.sort === 'NAME_ASC') order = a.title.localeCompare(b.title, 'fa');
    else {
      if (filter.sort === 'FEATURED') order = Number(Boolean(b.badge)) - Number(Boolean(a.badge));
      if (!order) order = Date.parse(b.createdAt) - Date.parse(a.createdAt);
    }
    return order || a.id.localeCompare(b.id);
  });
  return {
    items: items.slice((filter.page - 1) * filter.pageSize, filter.page * filter.pageSize),
    total: items.length,
    page: filter.page,
    pageSize: filter.pageSize,
    totalPages: Math.ceil(items.length / filter.pageSize),
  };
}
