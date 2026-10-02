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
    expect(result.items.map((p) => p.id)).toEqual(['date-500']);
    expect(result.total).toBe(1);
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
    const pages = [page(1), page(2), page(3)];
    expect(pages.every((p) => p.total === 6 && p.totalPages === 3)).toBe(true);
    const all = pages.flatMap((p) => p.items);
    expect(new Set(all.map((p) => p.id)).size).toBe(6);
    expect(all.map((p) => p.price)).toEqual([185000, 220000, 245000, 245000, 275000, 480000]);
    expect(page(4).items).toEqual([]);
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
