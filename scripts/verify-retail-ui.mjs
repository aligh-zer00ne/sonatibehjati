import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import { startAPI, db } from './auth-harness.mjs';
import {
  createAdmin,
  createCustomer,
  startAdmin,
  cleanupAdmin,
  products,
} from './admin-harness.mjs';
const base = 'http://localhost:3005';
let browser, page;
async function fits(page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth), {
      timeout: 5000,
    })
    .toBeLessThanOrEqual(1);
}

try {
  await startAPI();
  await startAdmin();
  const admin = await createAdmin();
  const customer = await createCustomer();
  const category = await db.category.findFirstOrThrow();
  const product = await db.product.create({
    data: {
      title: `ارده فروش دستی ${randomUUID().slice(0, 8)}`,
      slug: `ui-retail-${randomUUID()}`,
      price: 100000,
      weight: '۵۰۰ گرم',
      shortDescription: 'محصول آزمون',
      description: 'شرح محصول آزمون',
      categoryId: category.id,
      shippingWeightGrams: 500,
      shippingBaseCost: 50000,
      shippingAdditionalKgCost: 10000,
      images: { create: { url: '/images/products/tahini-blue.webp', alt: 'ارده', position: 0 } },
    },
  });
  products.add(product.id);
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(20000);
  const replayInputs = { create: [], receipt: [] };
  await page.route('**/api/admin', async (route) => {
    const body = route.request().postDataJSON();
    const kind = body.query.includes('mutation CreateAdminManualOrder')
      ? 'create'
      : body.query.includes('mutation RecordAdminOfflinePayment')
        ? 'receipt'
        : null;
    if (!kind) return route.continue();
    replayInputs[kind].push(body.variables.input);
    if (replayInputs[kind].length === 1) {
      const response = await route.fetch();
      assert.equal(response.status(), 200);
      const data = await response.json();
      assert.equal(data.errors, undefined, JSON.stringify(data.errors));
      return route.abort('failed');
    }
    return route.continue();
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + '/login');
  await page.getByLabel('ایمیل مدیر', { exact: true }).fill(admin.email);
  await page.getByLabel('رمز ورود', { exact: true }).fill(admin.password);
  await page.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(page.locator('[data-admin-dashboard]')).toBeVisible();
  await page.goto(`${base}/admin/products/${product.id}/edit`);
  await page.getByRole('tab', { name: 'هزینه و وزن ارسال', exact: true }).click();
  await page.getByLabel('وزن بسته برای ارسال (گرم)', { exact: true }).fill('600');
  await page.getByLabel('هزینهٔ پایهٔ ارسال (تومان)', { exact: true }).fill('70000');
  await page.getByLabel('هزینهٔ هر کیلو اضافه (تومان)', { exact: true }).fill('20000');
  await page.getByRole('button', { name: 'ذخیره محصول', exact: true }).click();
  await expect(page.getByText('محصول ذخیره شد.', { exact: true })).toBeVisible();
  const saved = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  assert.equal(saved.shippingWeightGrams, 600);
  assert.equal(saved.shippingBaseCost, 70000);
  assert.equal(saved.shippingAdditionalKgCost, 20000);
  await page.goto(base + '/admin/orders');
  await page.getByRole('button', { name: 'ثبت سفارش دستی', exact: true }).click();
  let modal = page.getByRole('dialog', { name: 'ثبت سفارش حضوری / اینستاگرام', exact: true });
  await expect(modal).toBeVisible();
  await modal
    .getByRole('combobox', { name: 'مشتری سفارش دستی', exact: true })
    .fill(customer.user.phone);
  await page.locator('.ant-select-item-option').filter({ hasText: customer.user.phone }).click();
  await modal.getByRole('combobox', { name: 'محصول سفارش دستی', exact: true }).fill(product.title);
  await page.locator('.ant-select-item-option').filter({ hasText: product.title }).click();
  await modal.getByRole('spinbutton', { name: `تعداد ${product.title}`, exact: true }).fill('2');
  await modal.getByRole('spinbutton', { name: `تعداد ${product.title}`, exact: true }).press('Tab');
  await expect(modal.locator('[data-amount="200000"]').first()).toBeVisible();
  await modal.getByLabel('مبلغ دریافت‌شده (تومان)', { exact: true }).fill('50000');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await fits(page);
    assert.ok(await modal.evaluate((e) => e.getBoundingClientRect().width <= innerWidth));
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await modal.screenshot({ path: '/tmp/behjati-retail-manual-mobile.png' });
  await modal.getByRole('button', { name: 'ثبت نهایی سفارش', exact: true }).click();
  await expect(
    modal.getByRole('button', { name: 'تلاش دوباره برای ثبت همین سفارش', exact: true }),
  ).toBeVisible();
  await modal.getByRole('button', { name: 'تلاش دوباره برای ثبت همین سفارش', exact: true }).click();
  await expect(modal).toHaveCount(0);
  assert.deepEqual(replayInputs.create[0], replayInputs.create[1]);
  let order = await db.order.findFirstOrThrow({
    where: { userId: customer.user.id },
    orderBy: { createdAt: 'desc' },
  });
  assert.equal(order.salesChannel, 'IN_PERSON');
  assert.equal(order.offlinePaidAmount, 50000);
  assert.equal(order.total, 200000);
  await expect(page.getByRole('tab', { name: 'پرداخت‌ها', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'پرداخت‌ها', exact: true }).click();
  await page.getByRole('button', { name: 'ثبت دریافت مانده', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'ثبت دریافت خارج از سایت', exact: true })
    .getByRole('button', { name: 'ثبت دریافت', exact: true })
    .click();
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
  await page
    .getByRole('dialog', { name: 'ثبت دریافت خارج از سایت', exact: true })
    .getByRole('button', { name: 'ثبت دریافت', exact: true })
    .click();
  assert.deepEqual(replayInputs.receipt[0], replayInputs.receipt[1]);
  await expect(
    page.getByRole('dialog', { name: 'ثبت دریافت خارج از سایت', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'ثبت دریافت مانده', exact: true })).toHaveCount(0);
  order = await db.order.findUniqueOrThrow({ where: { id: order.id } });
  assert.equal(order.offlinePaidAmount, 200000);
  assert.equal(order.status, 'PROCESSING');
  assert.equal(order.paidAt, null);
  await page.getByRole('button', { name: 'چاپ فاکتور / PDF', exact: true }).click();
  await expect(page.getByRole('dialog').getByText(/دریافت ثبت‌شده در فروشگاه/)).toBeVisible();
  await expect(
    page.getByRole('dialog').getByRole('link', { name: 'nexoraict.ir', exact: true }),
  ).toBeVisible();
  await page.getByRole('dialog').locator('.ant-modal-close').click();
  // Filter buttons modify URL/backend results and remain usable on a small screen.
  await page.getByRole('button', { name: 'محل خرید', exact: true }).click();
  await page
    .getByRole('group', { name: 'محل خرید', exact: true })
    .getByRole('button', { name: 'حضوری', exact: true })
    .click();
  await expect(page).toHaveURL(/salesChannel=IN_PERSON/);

  await fits(page);
  await page.getByRole('button', { name: 'شیوه ارسال', exact: true }).click();
  await page
    .getByRole('group', { name: 'شیوه ارسال', exact: true })
    .getByRole('button', { name: 'تیپاکس', exact: true })
    .click();
  await expect(page).toHaveURL(/shippingMethod=TIPAX/);

  await page.goto(base + '/admin/users');
  await page.getByRole('button', { name: 'افزودن مشتری', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'افزودن مشتری', exact: true })).toBeVisible();
  await page.getByRole('dialog').locator('.ant-modal-close').click();
  await page.goto(base + '/admin/reports');
  await page.getByRole('button', { name: 'بازه گزارش', exact: true }).hover();
  await page.getByRole('button', { name: 'امروز', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByText('پرداخت موفق درگاه', { exact: true })).toBeVisible();
  await expect(page.getByText('دریافت ثبت‌شده توسط مدیر', { exact: true })).toBeVisible();
  await fits(page);
  await page.goto(base + '/admin');
  await expect(
    page.getByRole('region', { name: 'مشتریان به تفکیک محل خرید', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'محل خرید', exact: true }).hover();
  await page
    .getByRole('group', { name: 'محل خرید داشبورد', exact: true })
    .getByRole('button', { name: 'حضوری', exact: true })
    .click();
  await page.getByRole('button', { name: 'محل خرید', exact: true }).hover();
  await expect(
    page
      .getByRole('group', { name: 'محل خرید داشبورد' })
      .getByRole('button', { name: 'حضوری', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await fits(page);
  assert.deepEqual(errors, []);
  console.log(
    'Retail browser passed: shipping form persistence, real manual order and receipt ledger, bank separation, print credit, source/carrier/report/dashboard filters and 320–1440px modal fit. Fixture data cleaned; no real SMS or bank request.',
  );
} catch (error) {
  await page?.screenshot({ path: '/tmp/behjati-retail-failure.png', fullPage: true });
  console.error(await page?.locator('main').innerText());
  throw error;
} finally {
  await browser?.close();
  await cleanupAdmin();
}
