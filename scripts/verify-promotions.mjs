import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { chromium, expect } from '@playwright/test';
import { mockCatalog } from '../apps/storefront/src/lib/catalog/mock.ts';
import { formatPrice } from '@behjati/shared';
const require = createRequire(import.meta.url);
const now = Date.now();
let enabled = false;
const baseProduct = mockCatalog.products.find(
  (product) => product.slug === 'traditional-halva-500',
);
const promotion = {
  title: 'جشنوارهٔ آزمون',
  percent: 20,
  amount: baseProduct.price / 5,
  originalPrice: baseProduct.price,
  price: baseProduct.price * 0.8,
  startsAt: new Date(now - 1000).toISOString(),
  endsAt: new Date(now + 3600000).toISOString(),
};
const fixture = createServer(async (request, response) => {
  let body = '';
  for await (const chunk of request) body += chunk;
  const { query, variables = {} } = JSON.parse(body);
  const products = mockCatalog.products.map((product) =>
    product.id === baseProduct.id && enabled ? { ...product, promotion } : product,
  );
  const data = query.includes('SelectedProducts')
    ? { productsByIds: products.filter((product) => variables.ids.includes(product.id)) }
    : {
        ...mockCatalog,
        products,
        promotionalProducts: enabled ? products.filter((product) => product.promotion) : [],
      };
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ data }));
});
await new Promise((resolve) => fixture.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:3007';
const server = spawn(
  process.execPath,
  [require.resolve('next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', '3007'],
  {
    cwd: 'apps/storefront',
    stdio: 'ignore',
    env: {
      ...process.env,
      CATALOG_SOURCE: 'api',
      API_URL: `http://127.0.0.1:${fixture.address().port}/graphql`,
    },
  },
);
let browser;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base + '/robots.txt')).ok) {
        ready = true;
        break;
      }
    } catch {
      /* Local startup. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready);
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  await page.route('https://trustseal.enamad.ir/**', (route) => route.abort());
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.clock.install({ time: now });
  await page.goto(base, { waitUntil: 'networkidle' });
  await expect(page.locator('#promotions')).toHaveCount(0);
  enabled = true;
  await page.reload({ waitUntil: 'networkidle' });
  const strip = page.locator('#promotions');
  await expect(strip.locator('article')).toHaveCount(1);
  await expect(strip.locator('del')).toHaveText(formatPrice(baseProduct.price));
  await expect(strip.locator('[aria-label="قیمت فعلی"]')).toHaveText(formatPrice(promotion.price));
  await expect(strip).toContainText('۲۰٪ تخفیف');
  await expect(strip).not.toContainText(formatPrice(promotion.amount) + ' تخفیف');
  await expect(strip).not.toContainText(promotion.title);
  const countdown = await strip.locator('[aria-label="زمان باقی‌مانده تخفیف"]').textContent();
  assert.ok(!/[0-9]/.test(countdown) && /[۰-۹]{2}:[۰-۹]{2}:[۰-۹]{2}/.test(countdown));
  assert.ok(
    await page.evaluate(
      () =>
        document
          .querySelector('#promotions')
          .compareDocumentPosition(document.querySelector('#products')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ),
  );
  await strip
    .getByRole('button', { name: `افزودن ${baseProduct.title} به سبد خرید`, exact: true })
    .click();
  await page.goto(base + '/cart', { waitUntil: 'networkidle' });
  const cart = page.locator(`[data-cart-product="${baseProduct.slug}"]`);
  await expect(cart).toContainText(formatPrice(promotion.price));
  await expect(
    page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByRole('heading', { name: 'خلاصهٔ سبد خرید', exact: true }) }),
  ).toContainText(formatPrice(promotion.price));
  await page.clock.fastForward(3601000);
  await expect(cart).toContainText(formatPrice(baseProduct.price));
  await expect(
    page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByRole('heading', { name: 'خلاصهٔ سبد خرید', exact: true }) }),
  ).toContainText(formatPrice(baseProduct.price));
  await expect(
    page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByRole('heading', { name: 'خلاصهٔ سبد خرید', exact: true }) }),
  ).not.toContainText(formatPrice(promotion.price));
  await page.goto(base, { waitUntil: 'networkidle' });
  await expect(page.locator('#promotions')).toHaveCount(0);
  assert.deepEqual(errors, []);
  console.log(
    'Promotions verified: conditional strip before bestsellers, Persian countdown above the card, hidden campaign details and old/new prices, discounted cart subtotal, automatic expiry and subtotal recalculation, no runtime errors. Isolated fixture; no database writes.',
  );
} finally {
  await browser?.close();
  server.kill('SIGTERM');
  fixture.close();
}
