import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const baseURL = 'http://localhost:3003';
const server = spawn(
  process.execPath,
  [require.resolve('next/dist/bin/next'), 'start', '--port', '3003'],
  { cwd: 'apps/storefront', stdio: 'ignore' },
);
let browser;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${baseURL}/shop`)).ok) {
        ready = true;
        break;
      }
    } catch {
      /* Await local server. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Storefront did not start');
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const cards = page.locator('main article[data-product-slug]');
  const goto = (path) => page.goto(`${baseURL}${path}`, { waitUntil: 'networkidle' });
  async function noOverflow(label) {
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `${label}: horizontal overflow`,
    );
  }
  async function screenshot(name) {
    await page.mouse.move(0, 0);
    await page.evaluate(async () => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      for (const image of document.images) image.loading = 'eager';
      await Promise.all(Array.from(document.images, (image) => image.decode().catch(() => {})));
    });
    await page.waitForTimeout(350);
    await page.evaluate(async () => {
      await Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => {})),
      );
    });
    await page.screenshot({ path: `/tmp/behjati-phase4-${name}.png`, fullPage: true });
  }
  await goto('/shop');
  await expect(cards).toHaveCount(6);
  await expect(
    page.getByRole('navigation', { name: 'ناوبری موبایل' }).locator('[aria-current="page"]'),
  ).toHaveText('فروشگاه');
  await noOverflow('mobile shop');
  await screenshot('shop-mobile');
  await page.getByLabel('مرتب‌سازی').selectOption('PRICE_ASC');
  await expect(cards.first()).toHaveAttribute('data-product-slug', 'sesame-tahini-350');
  await expect(page).toHaveURL(/sort=PRICE_ASC/);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(cards.first()).toHaveAttribute('data-product-slug', 'sesame-tahini-350');
  await page.getByRole('button', { name: 'فیلتر محصولات', exact: true }).click();
  await page.getByLabel('حداقل قیمت (تومان)').fill('۱۸۵۰۰۰');
  await page.getByLabel('حداکثر قیمت (تومان)').fill('۲۲۰۰۰۰');
  await page.getByRole('button', { name: 'اعمال فیلتر' }).click();
  await expect(cards).toHaveCount(2);
  await goto('/shop?min=300000&max=100000');
  await expect(page.getByText('فیلتر معتبر نیست', { exact: true })).toBeVisible();
  await goto('/shop?sort=PRICE_ASC&size=2');
  await expect(cards).toHaveCount(2);
  const firstIds = await cards.evaluateAll((nodes) =>
    nodes.map((node) => node.dataset.productSlug),
  );
  await page.getByRole('link', { name: 'صفحهٔ بعد' }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(cards.first()).toHaveAttribute('data-product-slug', 'date-tahini-500');
  const secondIds = await cards.evaluateAll((nodes) =>
    nodes.map((node) => node.dataset.productSlug),
  );
  assert.equal(new Set([...firstIds, ...secondIds]).size, 4);
  await page.goBack({ waitUntil: 'networkidle' });
  await expect(cards.first()).toHaveAttribute('data-product-slug', 'sesame-tahini-350');
  await goto('/search?q=ارده كنجدي');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toHaveAttribute('data-product-slug', 'sesame-tahini-350');
  await page.getByLabel('جستجوی محصولات').fill('ناموجود');
  await page.getByRole('button', { name: 'جستجو', exact: true }).click();
  await expect(page.getByText('محصولی پیدا نشد', { exact: true })).toBeVisible();
  await goto('/category/oil');
  await expect(cards).toHaveCount(1);
  await expect(
    page.getByRole('navigation', { name: 'ناوبری موبایل' }).locator('[aria-current="page"]'),
  ).toHaveText('فروشگاه');
  await cards.first().getByRole('link', { name: 'مشاهده روغن ارده' }).click();
  await expect(page).toHaveURL(`${baseURL}/product/sesame-oil-250`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('روغن ارده');
  await page.getByRole('button', { name: 'بزرگ‌نمایی تصویر محصول' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await expect(page.getByRole('button', { name: 'بزرگ‌نمایی تصویر محصول' })).toBeFocused();
  await page.getByRole('tab', { name: 'توضیحات' }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'مشخصات' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('۲۵۰ میلی‌لیتر');
  await page.getByRole('tab', { name: 'توضیحات' }).click();
  await page.getByRole('button', { name: 'افزودن به علاقه‌مندی‌ها: روغن ارده' }).click();
  await page.getByRole('button', { name: 'افزایش تعداد انتخابی' }).click();
  await page.getByRole('button', { name: 'افزودن روغن ارده به سبد خرید' }).click();
  await expect(page.locator('p[role="status"]')).toContainText('محصول به سبد اضافه شد');
  await noOverflow('mobile product');
  await screenshot('product-mobile');
  await page.getByRole('link', { name: 'مشاهده سبد خرید', exact: true }).click();
  const row = page.locator('[data-cart-product="sesame-oil-250"]');
  await expect(
    page.getByRole('navigation', { name: 'ناوبری موبایل' }).locator('[aria-current="page"]'),
  ).toContainText('سبد خرید');
  await expect(row.locator('output')).toHaveText('۲');
  await expect(page.getByText('۴۴۰٬۰۰۰ تومان').first()).toBeVisible();
  await screenshot('cart-mobile');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(row.locator('output')).toHaveText('۲');
  await row.getByRole('button', { name: 'افزایش تعداد روغن ارده' }).click();
  await expect(row.locator('output')).toHaveText('۳');
  await expect(page.getByText('۶۶۰٬۰۰۰ تومان').first()).toBeVisible();
  await row.getByRole('button', { name: 'کاهش تعداد روغن ارده' }).click();
  await expect(row.locator('output')).toHaveText('۲');
  await goto('/favorites');
  await expect(cards).toHaveCount(1);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(cards).toHaveCount(1);
  await page.getByRole('button', { name: 'حذف از علاقه‌مندی‌ها: روغن ارده' }).click();
  await expect(page.getByText('هنوز محصولی انتخاب نکرده‌اید', { exact: true })).toBeVisible();
  await page.route(
    '**/api/catalog/selection',
    (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
    { times: 1 },
  );
  await goto('/cart');
  await expect(page.getByText('سبد دریافت نشد', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'تلاش دوباره' }).click();
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'حذف روغن ارده' }).click();
  await expect(page.getByText('سبد خرید شما خالی است', { exact: true })).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem(
      'behjati-guest-cart-v1',
      JSON.stringify({
        state: { items: { missing: 2, 'oil-250': 1, bad: -1 }, favorites: [] },
        version: 0,
      }),
    ),
  );
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText('برخی محصولات دیگر در دسترس نیستند', { exact: true })).toBeVisible();
  await expect(row).toBeVisible();
  await page.getByRole('button', { name: 'حذف محصول ناموجود 1' }).click();
  await expect(page.getByText('برخی محصولات دیگر در دسترس نیستند', { exact: true })).toHaveCount(0);
  const oversized = await page.request.post(`${baseURL}/api/catalog/selection`, {
    data: { ids: Array(201).fill('oil-250') },
  });
  assert.equal(oversized.status(), 400);
  assert.equal(
    (await page.request.post(`${baseURL}/api/catalog/selection`, { data: { ids: [''] } })).status(),
    400,
  );
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['/shop', '/product/traditional-halva-500', '/cart']) {
      await goto(path);
      await noOverflow(`${width} ${path}`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [path, name] of [
    ['/shop', 'shop-desktop'],
    ['/product/traditional-halva-500', 'product-desktop'],
    ['/cart', 'cart-desktop'],
  ]) {
    await goto(path);
    if (path === '/shop')
      await expect(
        page.getByRole('navigation', { name: 'ناوبری اصلی' }).locator('[aria-current="page"]'),
      ).toHaveText('محصولات');
    await screenshot(name);
  }
  await goto('/product/not-a-product');
  await expect(page.getByRole('heading', { name: 'صفحه پیدا نشد' })).toBeVisible();
  await goto('/category/not-a-category');
  await expect(page.getByRole('heading', { name: 'صفحه پیدا نشد' })).toBeVisible();
  const noJS = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  const staticPage = await noJS.newPage();
  for (const path of ['/shop', '/product/traditional-halva-500']) {
    await staticPage.goto(`${baseURL}${path}`, { waitUntil: 'networkidle' });
    await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible();
  }
  await staticPage.goto(`${baseURL}/shop`, { waitUntil: 'networkidle' });
  await staticPage.getByLabel('جستجوی محصولات').fill('شکلاتی');
  await staticPage.getByRole('button', { name: 'جستجو', exact: true }).click();
  await expect(staticPage.locator('main article[data-product-slug]')).toHaveCount(1);
  await noJS.close();
  assert.deepEqual(errors, [], errors.join('\n'));
  console.log(
    'Commerce checks passed: URL filters/sorting/pagination/history, normalized Persian search, category and product navigation, gallery, keyboard tabs, persisted favorites/cart, quantities/totals, unavailable products, retry, bounded requests, responsive 320/390/768/1440, SSR without JavaScript, no runtime errors.',
  );
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
