import { describe, expect, it } from 'vitest';
import { catalogFilterSchema } from '@behjati/shared';
import { mockCatalog } from './mock';
import { filterMockCatalog } from './filter';
import { parseCatalogParams, catalogURL } from './params';
describe('catalog selection', () => {
  it('combines category, text, price and exclusion before pagination', () => {
    const result = filterMockCatalog(
      mockCatalog.products,
      catalogFilterSchema.parse({
        category: 'tahini',
        search: 'ارده',
        minPrice: 200000,
        maxPrice: 500000,
        excludeSlug: 'premium-tahini-1000',
      }),
    );
    expect(result.items.map((p) => p.id)).toEqual([
      'chocolate-tahini-350',
      'hazelnut-tahini-350',
      'tahini-cream-350',
    ]);
    expect(result.total).toBe(3);
  });
  it('paginates sorted results without duplicates and omits inactive products', () => {
    const products = [
      ...mockCatalog.products,
      { ...mockCatalog.products[0]!, id: 'inactive', isActive: false, price: 0 },
    ];
    const page = (number: number) =>
      filterMockCatalog(
        products,
        catalogFilterSchema.parse({ sort: 'PRICE_ASC', pageSize: 2, page: number }),
      );
    const pages = [page(1), page(2), page(3), page(4), page(5), page(6)];
    expect(pages.every((p) => p.total === 12 && p.totalPages === 6)).toBe(true);
    const all = pages.flatMap((p) => p.items);
    expect(new Set(all.map((p) => p.id)).size).toBe(12);
    expect(all.map((p) => p.price)).toEqual([
      185000, 190000, 220000, 225000, 230000, 245000, 250000, 280000, 350000, 480000, 690000,
      1280000,
    ]);
    expect(page(7).items).toEqual([]);
  });
  it('accepts Persian URL digits, rejects malformed amounts and retains unrelated filters', () => {
    const parsed = parseCatalogParams({ min: '۱۸۵۰۰۰', max: '۲۲۰۰۰۰', page: '۲' });
    expect(parsed.success && parsed.data).toMatchObject({
      minPrice: 185000,
      maxPrice: 220000,
      page: 2,
    });
    expect(parseCatalogParams({ min: '10oops' }).success).toBe(false);
    expect(
      catalogURL(
        '/shop',
        { q: 'ارده', category: 'oil', page: '3' },
        { sort: 'PRICE_ASC', page: undefined },
      ),
    ).toBe('/shop?q=%D8%A7%D8%B1%D8%AF%D9%87&category=oil&sort=PRICE_ASC');
  });
});
