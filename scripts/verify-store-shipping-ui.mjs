import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import { initialShippingSettings } from '@behjati/shared/shipping';
import { db, startAPI, startStorefront, origin, codes } from './auth-harness.mjs';
import {
  createAdmin,
  createCustomer,
  startAdmin,
  cleanupAdmin,
  shippingFixture,
  products,
} from './admin-harness.mjs';
let browser, page;
const base = 'http://localhost:3005';
const fits = async (p) =>
  expect
    .poll(() => p.evaluate(() => document.documentElement.scrollWidth - innerWidth))
    .toBeLessThanOrEqual(1);
try {
  await shippingFixture(initialShippingSettings(60000, 20000));
  await startAPI();
  await startAdmin();
  await startStorefront({ hostname: '127.0.0.1' });
  const owner = await createAdmin(),
    customer = await createCustomer();
  const category = await db.category.findFirstOrThrow();
  const product = await db.product.create({
    data: {
      title: 'محصول ارسال ' + randomUUID().slice(0, 6),
      slug: 'shipping-ui-' + randomUUID(),
      price: 100000,
      weight: '۵۰۰ گرم',
      shippingWeightGrams: 500,
      shippingBaseCost: 999999,
      shippingAdditionalKgCost: 999999,
      shortDescription: '',
      description: '',
      categoryId: category.id,
    },
  });
  products.add(product.id);
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + '/login');
  await page.getByLabel('ایمیل مدیر', { exact: true }).fill(owner.email);
  await page.getByLabel('رمز ورود', { exact: true }).fill(owner.password);
  await page.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(page).toHaveURL(base + '/admin');
  await page.goto(base + '/admin/shipping');
  await expect(page.getByRole('heading', { name: 'مدیریت ارسال', exact: true })).toBeVisible();
  const post = page.locator('[data-shipping-rule="POST"]'),
    tipax = page.locator('[data-shipping-rule="TIPAX"]');
  await post.getByLabel('هزینهٔ پایهٔ پست (ریال)', { exact: true }).fill('800000');
  await post.getByLabel('هر کیلو اضافهٔ پست (ریال)', { exact: true }).fill('150000');
  await expect(page.locator('[data-shipping-preview] [data-amount="110000"]')).toBeVisible();
  await page.getByRole('switch', { name: 'فعال‌سازی ارسال رایگان', exact: true }).click();
  await page.getByLabel('حداقل خرید برای ارسال رایگان (ریال)', { exact: true }).fill('5000000');
  await page.getByLabel('جمع محصولات پس از تخفیف (ریال)', { exact: false }).fill('5000000');
  await expect(
    page.locator('[data-shipping-preview]').getByText('رایگان', { exact: true }),
  ).toHaveCount(3);
  await tipax.getByLabel('مشمول شرط ارسال رایگان', { exact: true }).click();
  await page.getByRole('switch', { name: 'فعال‌سازی پیک', exact: true }).click();
  await page.getByRole('button', { name: 'ذخیرهٔ تنظیمات ارسال', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'ذخیرهٔ تنظیمات ارسال', exact: true }),
  ).toBeEnabled();
  await expect
    .poll(async () => {
      const row = await db.shippingSettings.findUnique({ where: { id: 'store' } });
      return row.data.freeShippingThreshold;
    })
    .toBe(500000);
  await page.reload();
  await expect(
    page.getByRole('switch', { name: 'فعال‌سازی ارسال رایگان', exact: true }),
  ).toBeChecked();
  await expect(page.getByRole('switch', { name: 'فعال‌سازی پیک', exact: true })).not.toBeChecked();
  await page.screenshot({
    path: '/tmp/behjati-store-shipping-desktop.png',
    animations: 'disabled',
    fullPage: true,
  });
  for (const width of [320, 390, 768, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await fits(page);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.screenshot({
    path: '/tmp/behjati-store-shipping-mobile.png',
    animations: 'disabled',
    fullPage: true,
  });
  // Only product weight remains editable; historical per-product fees are preserved in storage.
  await page.goto(base + `/admin/products/${product.id}/edit`);
  await page.getByRole('tab', { name: 'وزن ارسال', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('tab', { name: 'وزن ارسال', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByLabel('وزن بسته برای ارسال (گرم)', { exact: true })).toBeVisible();
  await expect(page.getByLabel('هزینهٔ پایهٔ ارسال (ریال)', { exact: true })).toHaveCount(0);
  const shop = await context.newPage();
  shop.on('pageerror', (e) => errors.push(e.message));
  await shop.goto(origin + '/login');
  await shop.getByLabel('شماره موبایل', { exact: true }).fill(customer.user.phone);
  await shop.getByRole('button', { name: 'دریافت کد ورود', exact: true }).click();
  await expect(shop.getByLabel('کد ورود', { exact: true })).toBeVisible();
  await shop.getByLabel('کد ورود', { exact: true }).fill(codes.get(customer.user.phone));
  await shop.getByRole('button', { name: 'تأیید و ورود', exact: true }).click();
  await expect(shop).not.toHaveURL(/\/verify/);
  async function cart(quantity) {
    await shop.evaluate(
      ({ id, quantity }) =>
        localStorage.setItem(
          'behjati-guest-cart-v1',
          JSON.stringify({ state: { items: { [id]: quantity }, favorites: [] }, version: 0 }),
        ),
      { id: product.id, quantity },
    );
    await shop.goto(origin + '/checkout');
  }
  await cart(3);
  await expect(shop.getByText('۲۰۰٬۰۰۰ تومان تا ارسال رایگان', { exact: true })).toBeVisible();
  await expect(shop.getByRole('radio', { name: 'پیک', exact: true })).toHaveCount(0);
  const submit = shop.getByRole('button', { name: 'ثبت سفارش', exact: true });
  await expect(submit).toBeEnabled();
  await shop.getByRole('radio', { name: 'تیپاکس', exact: true }).check();
  await expect(shop.getByRole('progressbar')).toHaveCount(0);
  await shop.getByRole('radio', { name: 'پست', exact: true }).check();
  await expect(
    shop.getByRole('progressbar', { name: 'پیشرفت تا ارسال رایگان', exact: true }),
  ).toBeVisible();
  // A manager disables the selected method while this checkout is already open.
  const policy = await db.shippingSettings.findUniqueOrThrow({ where: { id: 'store' } });
  await db.shippingSettings.update({
    where: { id: 'store' },
    data: {
      data: {
        ...policy.data,
        methods: policy.data.methods.map((m) => ({
          ...m,
          enabled: m.method === 'POST' ? false : m.enabled,
        })),
      },
      updatedAt: new Date(Date.now() + 1),
    },
  });
  await shop.getByRole('button', { name: 'اعمال', exact: true }).click();
  await expect(shop.getByRole('radio', { name: 'تیپاکس', exact: true })).toBeChecked();
  await expect(shop.getByRole('radio', { name: 'پست', exact: true })).toHaveCount(0);
  await db.shippingSettings.update({
    where: { id: 'store' },
    data: { data: policy.data, updatedAt: new Date(Date.now() + 2) },
  });
  for (const width of [320, 390, 768, 1440]) {
    await shop.setViewportSize({ width, height: 900 });
    await fits(shop);
  }
  await cart(5);
  await expect(shop.getByText('ارسال این سفارش رایگان است', { exact: true })).toBeVisible();
  await shop.setViewportSize({ width: 390, height: 900 });
  await shop.screenshot({
    path: '/tmp/behjati-free-shipping-checkout-mobile.png',
    animations: 'disabled',
    fullPage: true,
  });
  await shop.getByRole('button', { name: 'ثبت سفارش', exact: true }).click();
  await expect(shop).toHaveURL(/checkout\/order\//);
  const saved = await db.order.findUniqueOrThrow({ where: { id: shop.url().split('/').pop() } });
  assert.equal(saved.shipping, 0);
  assert.equal(saved.total, 500000);
  assert.equal(saved.shippingPolicySnapshot.freeShippingApplied, true);
  assert.deepEqual(errors, []);
  console.log(
    'Store shipping UI passed: persisted central rates/free threshold, live rial preview, method exclusion, weight-only product editor, real checkout progress/free order, 320–1440px fit. Settings/fixtures restored; no bank call or real SMS.',
  );
} catch (error) {
  await page?.screenshot({ path: '/tmp/behjati-shipping-ui-failure.png', fullPage: true });
  throw error;
} finally {
  await browser?.close();
  await cleanupAdmin();
}
