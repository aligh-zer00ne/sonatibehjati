import { describe, expect, it } from 'vitest';
import { catalogFilterSchema, normalizeSearch, selectionSchema } from './index.js';
describe('catalog input contract', () => {
  it('normalizes Arabic letters and whitespace without changing Persian text', () => {
    expect(normalizeSearch('  ارده\u200cكنجدي  ')).toBe('ارده کنجدی');
    expect(catalogFilterSchema.parse({ search: 'كنجدي' }).search).toBe('کنجدی');
  });
  it.each([
    { page: 0 },
    { pageSize: 25 },
    { minPrice: -1 },
    { minPrice: 300, maxPrice: 200 },
    { maxPrice: 0.5 },
    { sort: 'random' },
    { search: 'x'.repeat(101) },
    { category: '../admin' },
  ])('rejects invalid or unbounded filters %j', (input) => {
    expect(catalogFilterSchema.safeParse(input).success).toBe(false);
  });
  it('accepts a zero price and equal range endpoints', () => {
    expect(catalogFilterSchema.parse({ minPrice: 0, maxPrice: 0 }).minPrice).toBe(0);
  });
  it('bounds cart lookups and rejects malformed identifiers', () => {
    expect(selectionSchema.safeParse({ ids: Array(201).fill('product') }).success).toBe(false);
    expect(selectionSchema.safeParse({ ids: [''] }).success).toBe(false);
    expect(selectionSchema.safeParse({ ids: ['x'.repeat(101)] }).success).toBe(false);
  });
});
