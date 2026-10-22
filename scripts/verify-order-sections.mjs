import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { startAPI, db, adminOrigin } from './auth-harness.mjs';
import {
  createAdmin,
  createCustomer,
  createOrderFixture,
  loginAdmin,
  adminGql,
  startAdmin,
  cleanupAdmin,
} from './admin-harness.mjs';

let browser;
const query =
  'query($input:AdminOrdersInput!){adminOrders(input:$input){items{id salesChannel} total totalPages page}}';
try {
  await startAPI();
  await startAdmin();
  const admin = await createAdmin();
  const customer = await createCustomer();
  const product = await db.product.findFirstOrThrow();
  const website = await createOrderFixture(customer, product);
  const manual = [];
  for (const salesChannel of ['INSTAGRAM', 'IN_PERSON']) {
    const order = await createOrderFixture(customer, product);
    await db.order.update({ where: { id: order.id }, data: { salesChannel } });
    manual.push(order.id);
  }
  const session = await loginAdmin(admin);
  const list = async (input, cookie = session.cookies) => {
    const result = await adminGql(query, { input: { userId: customer.user.id, ...input } }, cookie);
    assert.equal(result.errors, undefined, JSON.stringify(result.errors));
    return result.data.adminOrders;
  };
  assert.equal((await list({})).total, 3, 'Existing all-order links retain their behavior');
  const pages = await Promise.all(
    [1, 2].map((page) => list({ manualOnly: true, pageSize: 1, page })),
  );
  for (const page of pages) {
    assert.equal(page.total, 2);
    assert.equal(page.totalPages, 2);
    assert.equal(page.items.length, 1);
    assert.notEqual(page.items[0].salesChannel, 'WEBSITE');
  }
  assert.deepEqual(new Set(pages.flatMap((p) => p.items.map((o) => o.id))), new Set(manual));
  assert.equal((await list({ salesChannel: 'WEBSITE' })).items[0].id, website.id);
  assert.equal((await list({ manualOnly: true, salesChannel: 'INSTAGRAM' })).total, 1);
  assert.equal((await list({ manualOnly: true, salesChannel: 'IN_PERSON' })).total, 1);
  assert.equal((await list({ manualOnly: true, salesChannel: 'WEBSITE' })).total, 0);
  await db.admin.update({
    where: { id: admin.id },
    data: { role: 'STAFF', permissions: ['ORDERS'] },
  });
  const staffSession = await loginAdmin(admin);
  assert.equal((await list({ manualOnly: true }, staffSession.cookies)).total, 2);

  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    hasTouch: true,
  });
  await context.addCookies(
    staffSession.cookies.split('; ').map((value) => {
      const index = value.indexOf('=');
      return { name: value.slice(0, index), value: value.slice(index + 1), url: adminOrigin };
    }),
  );
  const page = await context.newPage();
  const errors = [],
    inputs = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (request.url().endsWith('/api/admin') && request.method() === 'POST') {
      const body = request.postDataJSON();
      if (/query AdminOrders\b/.test(body.query)) inputs.push(body.variables.input);
    }
  });
  await page.goto(`${adminOrigin}/admin/orders/manual?userId=${customer.user.id}&status=CANCELED`);
  await expect(page.getByRole('heading', { name: 'سایر سفارش‌ها', exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/behjati-order-sections-desktop.png' });
  await expect(page.locator('article[data-admin-record]')).toHaveCount(2);
  assert.equal(inputs.at(-1).status, undefined, 'Manual invoices ignore old fulfillment filters');
  await expect(page.getByRole('button', { name: 'وضعیت سفارش', exact: true })).toHaveCount(0);
  const nav = page.locator('#admin-desktop-navigation');
  await expect(nav.getByRole('link', { name: 'دریافت و پرداخت', exact: true })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'سفارش‌ها', exact: true })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(nav.getByRole('link', { name: 'سایر سفارش‌ها', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByRole('button', { name: 'ثبت سفارش دستی', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'محل خرید', exact: true }).hover();
  const channel = page.getByRole('region', { name: 'محل خرید', exact: true });
  await expect(channel.getByRole('button', { name: 'سایت', exact: true })).toHaveCount(0);
  await channel.getByRole('button', { name: 'اینستاگرام', exact: true }).click();
  await expect(page.locator('article[data-admin-record]')).toHaveCount(1);
  assert.equal(inputs.at(-1).manualOnly, true);
  await page.getByRole('button', { name: 'پاک کردن فیلترها', exact: true }).click();
  await expect.poll(() => inputs.at(-1).manualOnly).toBe(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'سایر سفارش‌ها', exact: true })).toBeVisible();
  await expect.poll(() => inputs.at(-1).manualOnly).toBe(true);
  await page.goto(
    `${adminOrigin}/admin/orders/website?userId=${customer.user.id}&salesChannel=INSTAGRAM`,
  );
  await expect(page.getByRole('heading', { name: 'سفارش‌های وبسایت', exact: true })).toBeVisible();
  await expect(page.locator('article[data-admin-record]')).toHaveCount(1);
  assert.equal(inputs.at(-1).salesChannel, 'WEBSITE');
  await expect(page.getByRole('button', { name: 'وضعیت سفارش', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ثبت سفارش دستی', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'محل خرید', exact: true })).toHaveCount(0);
  await nav.getByRole('link', { name: 'سایر سفارش‌ها', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'سایر سفارش‌ها', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'جمع کردن منوی مدیریت', exact: true }).click();
  await nav.getByRole('button', { name: 'فروش و مشتریان', exact: true }).click();
  await page.getByRole('menu').getByText('سفارش‌ها', { exact: true }).hover();
  await page.getByRole('link', { name: 'سفارش‌های وبسایت', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'سفارش‌های وبسایت', exact: true })).toBeVisible();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(adminOrigin + '/admin/orders/website');
    await expect(
      page.getByRole('heading', { name: 'سفارش‌های وبسایت', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'باز کردن منوی مدیریت', exact: true }).tap();
    const mobile = page.locator('#admin-mobile-navigation');
    await expect(mobile.getByRole('button', { name: 'سفارش‌ها', exact: true })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(
      mobile.getByRole('link', { name: 'سفارش‌های وبسایت', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    for (const link of await mobile
      .getByRole('link', { name: /سفارش‌های وبسایت|سایر سفارش‌ها/ })
      .all()) {
      await expect
        .poll(async () => {
          const box = await link.boundingBox();
          return !!box && box.x >= -1 && box.x + box.width <= width + 1;
        })
        .toBe(true);
      assert.ok(await link.evaluate((el) => el.scrollWidth <= el.clientWidth));
    }
    if (width === 390) await page.screenshot({ path: '/tmp/behjati-order-sections-mobile.png' });
    await mobile.getByRole('link', { name: 'سایر سفارش‌ها', exact: true }).tap();
    await expect(page.getByRole('heading', { name: 'سایر سفارش‌ها', exact: true })).toBeVisible();
    await expect(mobile).toBeHidden();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
  }
  assert.deepEqual(errors, []);
  await db.admin.update({ where: { id: admin.id }, data: { permissions: ['PRODUCTS'] } });
  await page.goto(adminOrigin + '/admin/orders/manual');
  await expect(page).toHaveURL(/\/admin\/products$/);
  await page.getByRole('button', { name: 'باز کردن منوی مدیریت', exact: true }).click();
  await expect(
    page.locator('#admin-mobile-navigation').getByRole('button', { name: 'سفارش‌ها', exact: true }),
  ).toHaveCount(0);
  console.log(
    'Order sections passed: real API source separation, intersection filters, totals/pagination, old links, sales-only permissions, reset/reload, sidebar/collapsed/mobile nested menus and no clipped labels. Temporary fixtures only; no SMS or bank request.',
  );
} finally {
  await browser?.close();
  await cleanupAdmin();
}
