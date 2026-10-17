import { afterEach, describe, expect, it, vi } from 'vitest';
import { indexingEnabled, catalogMetadata, serializeJsonLd, SITE_URL } from './seo';
import { productSchema } from './structured-data';
import { buildSitemap } from './seo-sitemap';
import { mockCatalog } from './catalog/mock';
import { filterMockCatalog } from './catalog/filter';
import { catalogFilterSchema } from '@behjati/shared';

afterEach(() => vi.unstubAllEnvs());

describe('search indexing and canonical URLs', () => {
  it('opens only production using the real catalog, with an explicit staging opt-out', () => {
    expect(indexingEnabled({ NODE_ENV: 'development', CATALOG_SOURCE: 'api' })).toBe(false);
    expect(indexingEnabled({ NODE_ENV: 'production', CATALOG_SOURCE: 'mock' })).toBe(false);
    expect(indexingEnabled({ NODE_ENV: 'production', CATALOG_SOURCE: 'api' })).toBe(true);
    expect(
      indexingEnabled({
        NODE_ENV: 'production',
        CATALOG_SOURCE: 'api',
        SEO_INDEXING_ENABLED: 'false',
      }),
    ).toBe(false);
  });

  it('gives pagination its own canonical while excluding faceted/invalid URLs', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CATALOG_SOURCE', 'api');
    const second = catalogMetadata('/shop', 'فروشگاه', { page: '۲', utm_source: 'newsletter' });
    expect(second.alternates?.canonical).toBe(SITE_URL + '/shop?page=2');
    expect(second.robots).toMatchObject({ index: true });
    expect(second.title).toEqual({ absolute: expect.stringContaining('سنتی بهجتی') });
    for (const params of [
      { sort: 'PRICE_ASC' },
      { q: 'ارده' },
      { min: '100' },
      { size: '24' },
      { page: 'bad' },
      { category: 'oil' },
    ]) {
      const meta = catalogMetadata('/shop', 'فروشگاه', params);
      expect(meta.robots).toMatchObject({ index: false });
      expect(meta.alternates?.canonical).toBe(SITE_URL + '/shop');
    }
  });
});

describe('truthful product markup', () => {
  it('uses IRR and only the currently valid promotion without invented availability or ratings', () => {
    const product = {
      ...mockCatalog.products[0]!,
      price: 250000,
      promotion: {
        title: 'تخفیف',
        percent: 20,
        amount: 50000,
        originalPrice: 250000,
        price: 200000,
        startsAt: '2026-10-01T00:00:00Z',
        endsAt: '2026-10-10T12:00:00Z',
      },
    };
    const active = productSchema(product, Date.parse('2026-10-05T00:00:00Z'));
    expect(active.offers).toMatchObject({
      priceCurrency: 'IRR',
      price: 2000000,
      priceValidUntil: '2026-10-10',
    });
    for (const date of ['2026-09-30T00:00:00Z', product.promotion.endsAt]) {
      const offer = productSchema(product, Date.parse(date)).offers;
      expect(offer.price).toBe(2500000);
      expect(offer).not.toHaveProperty('priceValidUntil');
    }
    expect(active.offers).not.toHaveProperty('availability');
    expect(active).not.toHaveProperty('aggregateRating');
    expect(active.image.every((url) => url.startsWith(SITE_URL + '/'))).toBe(true);
  });

  it('cannot close the JSON-LD script through content entered in the admin', () => {
    const data = { name: '</script><script>alert(1)</script>', description: 'ارده & کنجد' };
    const output = serializeJsonLd(data);
    expect(output).not.toContain('<');
    expect(JSON.parse(output)).toEqual(data);
  });
});

it('includes products beyond the homepage limit and excludes inactive/private URLs without fabricated dates', async () => {
  const products = Array.from({ length: 121 }, (_, i) => ({
    ...mockCatalog.products[0]!,
    id: String(i),
    slug: 'product-' + i,
    isActive: i !== 120,
    updatedAt: i === 0 ? 'invalid' : '2026-10-01T00:00:00Z',
  }));
  const calls: number[] = [];
  const entries = await buildSitemap(async (input) => {
    calls.push(input.page);
    return {
      categories: mockCatalog.categories,
      catalog: filterMockCatalog(products, catalogFilterSchema.parse(input)),
    };
  });
  expect(calls).toEqual([1, 2, 3, 4, 5]);
  const urls = entries.map((entry) => entry.url);
  expect(urls).toContain(SITE_URL + '/product/product-119');
  expect(urls).not.toContain(SITE_URL + '/product/product-120');
  expect(new Set(urls).size).toBe(urls.length);
  expect(urls.every((url) => !/account|checkout|payment|support|login|search|QR/.test(url))).toBe(
    true,
  );
  expect(entries.find((entry) => entry.url.endsWith('/product-0'))).not.toHaveProperty(
    'lastModified',
  );
  expect(entries.find((entry) => entry.url === SITE_URL + '/')).not.toHaveProperty('lastModified');
});
