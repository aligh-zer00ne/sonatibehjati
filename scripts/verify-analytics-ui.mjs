import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import { startAPI, db, adminOrigin } from './auth-harness.mjs';
import {
  createAdmin,
  loginAdmin,
  adminGql,
  createCustomer,
  createOrderFixture,
  startAdmin,
  cleanupAdmin,
} from './admin-harness.mjs';

let browser, page;
const good = (r) => {
  assert.equal(r.errors, undefined, JSON.stringify(r.errors));
  return r.data;
};
const price = (v) => new Intl.NumberFormat('fa-IR').format(v * 10) + ' ریال';
try {
  await startAPI();
  await startAdmin();
  const admin = await createAdmin(),
    session = await loginAdmin(admin),
    customer = await createCustomer();
  const product = await db.product.findFirstOrThrow({ where: { isActive: true } });
  const invoice = await createOrderFixture(customer, product, { total: 100000 });
  await db.order.update({
    where: { id: invoice.id },
    data: { salesChannel: 'IN_PERSON', status: 'DELIVERED' },
  });
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true,
  });
  await context.addCookies(
    session.cookies.split('; ').map((v) => {
      const n = v.indexOf('=');
      return { name: v.slice(0, n), value: v.slice(n + 1), url: adminOrigin };
    }),
  );
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [],
    requests = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let failNext = false,
    holdNext = false,
    release;
  await page.route('**/api/admin', async (route) => {
    const body = route.request().postDataJSON();
    if (!/query AdminReport\b/.test(body.query)) return route.continue();
    requests.push(body.variables.input);
    if (failNext) {
      failNext = false;
      return route.fulfill({
        status: 200,
        json: {
          errors: [{ message: 'fixture unavailable', extensions: { code: 'SERVICE_UNAVAILABLE' } }],
        },
      });
    }
    if (holdNext) {
      holdNext = false;
      await new Promise((resolve) => {
        release = resolve;
      });
    }
    return route.continue();
  });
  await page.clock.install();
  await page.goto(adminOrigin + '/admin/reports');
  const metric = page.locator('[data-analytics-metric="خالص دریافتی"]');
  await expect(metric).toBeVisible();
  const reportQuery = 'query($input:AdminReportInput!){adminReport(input:$input){revenue}}';
  const baseline = good(await adminGql(reportQuery, { input: requests.at(-1) }, session.cookies))
    .adminReport.revenue;
  await expect(metric).toContainText(price(baseline));
  const receipt =
    'mutation($input:AdminAccountEntryInput!){recordAdminAccountEntry(input:$input){balance}}';
  good(
    await adminGql(
      receipt,
      {
        input: {
          customerId: customer.user.id,
          direction: 'RECEIPT',
          amount: 20000,
          method: 'CASH',
          requestId: randomUUID(),
        },
      },
      session.cookies,
    ),
  );
  holdNext = true;
  await page.clock.fastForward(31000);
  await expect.poll(() => typeof release).toBe('function');
  await expect(metric).toContainText(price(baseline));
  await expect(page.getByText('در حال دریافت اطلاعات…', { exact: true })).toBeVisible();
  release();
  await expect(metric).toContainText(price(baseline + 20000));
  failNext = true;
  await page.getByRole('button', { name: 'به‌روزرسانی', exact: true }).click();
  await expect(
    page.getByText('به‌روزرسانی انجام نشد؛ آخرین اطلاعات نمایش داده می‌شود.', { exact: true }),
  ).toBeVisible();
  await expect(metric).toContainText(price(baseline + 20000));
  await page.getByRole('button', { name: 'به‌روزرسانی', exact: true }).click();
  await expect(page.getByText(/آخرین دریافت/)).toBeVisible();
  const beforeHidden = requests.length;
  await page.evaluate(() =>
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }),
  );
  await page.clock.fastForward(31000);
  assert.equal(requests.length, beforeHidden, 'Hidden tabs must not poll');
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => requests.length).toBeGreaterThan(beforeHidden);
  await page.getByRole('button', { name: 'تعداد', exact: true }).click();
  await expect(page.locator('[data-report-chart="count"]')).toBeVisible();
  await page.getByRole('button', { name: 'مبالغ', exact: true }).click();
  await expect(page.locator('[data-report-chart="money"]')).toBeVisible();
  await page.getByRole('button', { name: 'امروز', exact: true }).click();
  await expect.poll(() => requests.at(-1).from === requests.at(-1).to).toBe(true);
  await expect(metric).toBeVisible();
  await page.getByRole('button', { name: '۳۰ روز اخیر', exact: true }).click();
  await expect(page.getByRole('button', { name: '۳۰ روز اخیر', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('switch', { name: 'فقط روزهای دارای فعالیت', exact: true }).click();
  await expect(page.locator('[data-report-day]')).toHaveCount(10);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'خروجی CSV', exact: true }).click();
  const download = await downloadPromise;
  const csv = await readFile(await download.path(), 'utf8');
  assert.ok(csv.includes('خالص دریافتی (ریال)'));
  assert.ok(csv.includes('ارزش فاکتورها (ریال)'));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
    if (width === 390 || width === 1440)
      await page.screenshot({ path: `/tmp/behjati-reports-new-${width}.png`, fullPage: true });
  }
  await page.goto(adminOrigin + '/admin');
  await expect(page.getByRole('heading', { name: 'داشبورد مدیریت', exact: true })).toBeVisible();
  await expect(page.locator('[data-analytics-metric="خالص دریافتی"]')).toBeVisible();
  const orderToggle = page.getByRole('button', {
    name: `جزئیات سفارش ${new Intl.NumberFormat('fa-IR').format(invoice.number)}`,
    exact: true,
  });
  await orderToggle.click();
  await expect(page.getByRole('tab', { name: 'محصولات', exact: true })).toBeVisible();
  await expect(page).toHaveURL(adminOrigin + '/admin');
  await page.getByRole('button', { name: 'بستن جزئیات سفارش', exact: true }).click();
  await expect(orderToggle).toBeFocused();
  await page.getByRole('button', { name: '۳۰ روز', exact: true }).click();
  await expect(page.getByRole('button', { name: '۳۰ روز', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'دریافتی', exact: true }).click();
  await expect(page.locator('[data-dashboard-chart="revenue"]')).toBeVisible();
  await page.getByRole('button', { name: 'نمایش آمار خرید از حضوری', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'نمایش آمار خرید از حضوری', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-analytics-metric="خالص دریافتی"]')).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
    if (width === 390 || width === 1440)
      await page.screenshot({ path: `/tmp/behjati-dashboard-new-${width}.png`, fullPage: true });
  }
  await db.admin.update({
    where: { id: admin.id },
    data: { role: 'STAFF', permissions: ['DASHBOARD'] },
  });
  await page.reload();
  await expect(page.locator('[data-admin-dashboard]')).toBeVisible();
  await expect(page.getByRole('link', { name: 'دریافت و پرداخت', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'گزارش فروش', exact: true })).toHaveCount(0);
  assert.deepEqual(errors, []);
  console.log(
    'Analytics browser passed: real receipt changes reflected by timed refresh, retained data during refresh/failure, hidden-tab pause/resume, daily chart modes/range presets/activity/CSV, dashboard metrics/channel/chart controls, permissions and 320–1440px bounds. Temporary fixtures cleaned; no real SMS or bank request.',
  );
} catch (e) {
  await page?.screenshot({ path: '/tmp/behjati-analytics-failure.png', fullPage: true });
  throw e;
} finally {
  await browser?.close();
  await cleanupAdmin();
}
