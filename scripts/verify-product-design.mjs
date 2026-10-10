import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import { mockCatalog } from '../apps/storefront/src/lib/catalog/mock.ts';
import { filterMockCatalog } from '../apps/storefront/src/lib/catalog/filter.ts';
import { catalogFilterSchema } from '@behjati/shared';
const require = createRequire(import.meta.url);
const repo = fileURLToPath(new URL('../', import.meta.url));
const sharp = require('sharp');
const categoryIcons = {
  tahini: '/images/categories/tahini-icon.png',
  halva: '/images/categories/halva-icon.png',
  oil: '/images/categories/oil-icon.png',
  'traditional-sweets': '/images/categories/sweets-icon.png',
  sesame: '/images/categories/sesame-icon.png',
};
for (const image of Object.values(categoryIcons)) {
  const metadata = await sharp(repo + '/apps/storefront/public' + image).metadata();
  assert.equal(metadata.hasAlpha, true, `Category illustration lost transparency: ${image}`);
}
for (const product of mockCatalog.products) {
  assert.equal(product.images.length, 4);
  assert.equal(new Set(product.images.map((image) => image.url)).size, 4);
  for (const image of product.images) {
    assert.ok(image.url.endsWith('.webp'));
    const metadata = await sharp(repo + '/apps/storefront/public' + image.url).metadata();
    assert.equal(metadata.hasAlpha, false, `Transparent product photo: ${image.url}`);
    assert.ok(metadata.width >= 600 && metadata.height >= 600, `Undersized photo: ${image.url}`);
  }
}
// Isolated fixture: no database writes or SMS/customer authentication.
const fixture = createServer(async (request, response) => {
  let body = '';
  for await (const chunk of request) body += chunk;
  const { query, variables = {} } = JSON.parse(body);
  const data = query.includes('ProductDetail')
    ? { product: mockCatalog.products.find((item) => item.slug === variables.slug) ?? null }
    : query.includes('SelectedProducts')
      ? { productsByIds: mockCatalog.products.filter((item) => variables.ids.includes(item.id)) }
      : query.includes('CatalogPage')
        ? {
            categories: mockCatalog.categories,
            catalog: filterMockCatalog(
              mockCatalog.products,
              catalogFilterSchema.parse(variables.input),
            ),
          }
        : mockCatalog;
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ data }));
});
await new Promise((resolve) => fixture.listen(0, '127.0.0.1', resolve));
const port = Number(process.env.PRODUCT_VERIFY_PORT ?? 3006);
const base = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  [
    require.resolve('next/dist/bin/next'),
    'start',
    '--hostname',
    '127.0.0.1',
    '--port',
    String(port),
  ],
  {
    cwd: repo + '/apps/storefront',
    stdio: 'ignore',
    env: { ...process.env, API_URL: `http://127.0.0.1:${fixture.address().port}/graphql` },
  },
);
let browser;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base + '/robots.txt', { signal: AbortSignal.timeout(1000) })).ok) {
        ready = true;
        break;
      }
    } catch {
      /* Await local server. */
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  assert.ok(ready, 'Built storefront did not start');
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  await page.route('https://trustseal.enamad.ir/**', (route) =>
    route.fulfill({ status: 403, body: '' }),
  );
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const goto = (path) => page.goto(base + path, { waitUntil: 'networkidle' });
  const loadImages = () =>
    page.evaluate(async () => {
      for (const image of document.querySelectorAll('main img')) image.loading = 'eager';
      await Promise.all(
        Array.from(document.querySelectorAll('main img'), (image) => image.decode()),
      );
    });
  await goto('/');
  await expect(page.locator('#categories h3')).toHaveText([
    'ارده',
    'حلواارده',
    'روغن های خوراکی',
    'شیرینی و محصولات سنتی',
    'سایر محصولات',
  ]);
  await expect(page.locator('#categories [data-category-symbol]')).toHaveCount(5);
  for (const image of await page.locator('[data-category-symbol]').all()) {
    const source = new URL(await image.getAttribute('src'), base);
    assert.equal(
      source.searchParams.get('url') ?? source.pathname,
      categoryIcons[await image.getAttribute('data-category-symbol')],
    );
  }
  await loadImages();
  await page.locator('#categories').screenshot({ path: '/tmp/behjati-categories-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#categories').screenshot({ path: '/tmp/behjati-categories-mobile.png' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await goto('/shop');
  await expect(page.locator('main article[data-product-slug]')).toHaveCount(12);
  await expect(page.locator('article[data-product-slug] [data-decoration]')).toHaveCount(0);
  await expect(page.locator('[data-category-symbol]')).toHaveCount(5);
  await loadImages();
  await page.screenshot({ path: '/tmp/behjati-product-v3-shop-desktop.png', fullPage: true });
  for (const product of mockCatalog.products) {
    await goto('/product/' + product.slug);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(product.title);
    await expect(page.getByText('انتخاب تا سفارش', { exact: true })).toHaveCount(0);
    await expect(page.locator('[aria-label="مزایای خرید"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^نمایش تصویر [۱-۴]$/ })).toHaveCount(4);
    for (let index = 0; index < 4; index++) {
      const name = `نمایش تصویر ${new Intl.NumberFormat('fa-IR').format(index + 1)}`;
      await page.getByRole('button', { name, exact: true }).click();
      await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await loadImages();
      assert.ok(
        (
          await page.locator('[data-product-gallery] .group\\/gallery img').getAttribute('src')
        ).includes(encodeURIComponent(product.images[index].url)),
      );
    }
    await page.getByRole('button', { name: 'تصویر بعدی', exact: true }).click();
    await expect(page.getByRole('button', { name: 'نمایش تصویر ۱', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByRole('button', { name: 'تصویر قبلی', exact: true }).click();
    await expect(page.getByRole('button', { name: 'نمایش تصویر ۴', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  }
  await goto('/product/chocolate-tahini-350');
  await loadImages();
  const gallery = await page.locator('[data-product-gallery]').boundingBox();
  const heading = await page.getByRole('heading', { level: 1 }).boundingBox();
  assert.ok(
    gallery.x + gallery.width < heading.x,
    'Desktop gallery must be left of purchase information',
  );
  const rects = await Promise.all(
    (await page.getByRole('button', { name: /^نمایش تصویر [۱-۴]$/ }).all()).map((thumb) =>
      thumb.boundingBox(),
    ),
  );
  assert.ok(rects.every((rect) => Math.abs(rect.x - rects[0].x) < 1));
  await page.screenshot({ path: '/tmp/behjati-product-v3-detail-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'بزرگ‌نمایی تصویر محصول' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'بزرگ‌نمایی تصویر محصول' })).toBeFocused();
  await page.getByRole('tab', { name: 'توضیحات' }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'مشخصات' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('۳۵۰ گرم');
  await page
    .getByRole('button', { name: 'افزودن به علاقه‌مندی‌ها: ارده شکلاتی', exact: true })
    .click();
  await page.getByRole('button', { name: 'افزایش تعداد انتخابی' }).click();
  await page.getByRole('button', { name: 'افزودن ارده شکلاتی به سبد خرید', exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText('محصول به سبد اضافه شد');
  await page.getByRole('link', { name: 'مشاهده سبد خرید', exact: true }).click();
  const cartRow = page.locator('[data-cart-product="chocolate-tahini-350"]');
  await expect(cartRow.locator('output')).toHaveText('۲');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(cartRow.locator('output')).toHaveText('۲');
  await goto('/favorites');
  await expect(
    page.locator('main article[data-product-slug="chocolate-tahini-350"]'),
  ).toBeVisible();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/shop', '/product/chocolate-tahini-350']) {
      await goto(path);
      await loadImages();
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Horizontal overflow: ${width}${path}`,
      );
    }
    if (width === 390)
      await page.screenshot({ path: '/tmp/behjati-product-v3-detail-mobile.png', fullPage: true });
  }
  const staticContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(base + '/product/chocolate-tahini-350');
  await expect(staticPage.getByRole('heading', { level: 1 })).toHaveText('ارده شکلاتی');
  await staticContext.close();
  assert.deepEqual(errors, []);
  console.log(
    'Product design verified: the same 5 categories with supplied transparent illustrations, plain product cards, 12 products × 4 gallery states, wraparound, zoom/focus, keyboard tabs, cart/favorites persistence, desktop RTL placement, responsive 320–1440 and SSR. Isolated fixture; authentication unchanged.',
  );
} finally {
  await browser?.close();
  server.kill('SIGTERM');
  fixture.close();
}
