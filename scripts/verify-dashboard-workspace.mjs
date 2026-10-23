import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { startAPI, db, adminOrigin } from './auth-harness.mjs';
import { verifySurfaceMotion } from './surface-motion-checks.mjs';
import { verifyTopNavigation } from './top-navigation-checks.mjs';
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
const labels = {
  PROCESSING: 'در حال آماده‌سازی',
  PENDING_PAYMENT: 'در انتظار پرداخت',
  DELIVERED: 'تحویل‌شده',
};
try {
  await startAPI();
  await startAdmin();
  const admin = await createAdmin(),
    session = await loginAdmin(admin),
    customer = await createCustomer();
  const product = await db.product.findFirstOrThrow({ where: { isActive: true } });
  const fixtures = [];
  for (const [status, salesChannel, days] of [
    ['PROCESSING', 'WEBSITE', 0],
    ['PROCESSING', 'WEBSITE', 40],
    ['DELIVERED', 'IN_PERSON', 0],
    ...Array.from({ length: 12 }, () => ['PENDING_PAYMENT', 'WEBSITE', 0]),
  ]) {
    const order = await createOrderFixture(customer, product, {
      status,
      date: new Date(Date.now() - days * 86400000),
    });
    await db.order.update({ where: { id: order.id }, data: { salesChannel } });
    fixtures.push(order);
  }
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addCookies(
    session.cookies.split('; ').map((v) => {
      const i = v.indexOf('=');
      return { name: v.slice(0, i), value: v.slice(i + 1), url: adminOrigin };
    }),
  );
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [],
    inputs = [],
    reports = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (request) => {
    if (!request.url().endsWith('/api/admin') || request.method() !== 'POST') return;
    const body = request.postDataJSON();
    if (/query AdminOrders\b/.test(body.query)) inputs.push(body.variables.input);
  });
  page.on('response', async (response) => {
    if (!response.url().endsWith('/api/admin') || response.request().method() !== 'POST') return;
    const body = response.request().postDataJSON();
    if (/query AdminDashboard\b/.test(body.query)) {
      const r = await response.json();
      if (r.data) reports.push(r.data.adminDashboard.report);
    }
  });
  const listQuery =
    'query($input:AdminOrdersInput!){adminOrders(input:$input){items{id status salesChannel createdAt} total}}';
  async function verifyExplorer(status) {
    const modal = page.getByRole('dialog', { name: `سفارش‌های ${labels[status]}`, exact: true });
    await expect(modal).toBeVisible();
    await expect(modal.locator('[data-order-id]').first()).toBeVisible();
    const input = inputs.at(-1),
      expected = good(await adminGql(listQuery, { input }, session.cookies)).adminOrders;
    assert.equal(input.status, status);
    assert.equal(input.from, reports.at(-1).from);
    assert.equal(input.to, reports.at(-1).to);
    assert.ok(expected.items.every((o) => o.status === status));
    const ids = await modal
      .locator('[data-order-id]')
      .evaluateAll((elements) => elements.map((el) => el.getAttribute('data-order-id')));
    assert.deepEqual(
      ids,
      expected.items.map((o) => o.id),
    );
    await expect(
      modal.getByText(`${new Intl.NumberFormat('fa-IR').format(expected.total)} سفارش منطبق`, {
        exact: true,
      }),
    ).toBeVisible();
    return { modal, input, expected };
  }
  await page.goto(adminOrigin + '/admin');
  await expect(page.locator('[data-admin-dashboard]')).toBeVisible();
  await verifyTopNavigation(page);
  const hero = page.locator('[data-admin-dashboard] > header');
  await verifySurfaceMotion(page, hero, { ambient: true });
  await verifySurfaceMotion(page, page.locator('[data-analytics-metric]').first(), { tilt: true });
  await verifySurfaceMotion(page, page.locator('[data-order-id]').first(), { tilt: true });
  await expect(hero.locator('[data-ambient-backdrop]')).toHaveAttribute(
    'data-network-state',
    'paused',
  );

  const sector = page.locator('[data-dashboard-status="PROCESSING"]');
  await sector.scrollIntoViewIfNeeded();
  await expect(sector).toHaveAttribute('role', 'button');
  const point = await sector.evaluate((el) => {
    const box = el.getBBox();
    for (let x = 0.2; x < 0.9; x += 0.1)
      for (let y = 0.2; y < 0.9; y += 0.1) {
        const p = new DOMPoint(box.x + box.width * x, box.y + box.height * y);
        if (el.isPointInFill(p)) {
          const screen = p.matrixTransform(el.getScreenCTM());
          return { x: screen.x, y: screen.y };
        }
      }
    return null;
  });
  assert.ok(point, 'A clickable point inside the actual SVG pie sector exists');
  await page.mouse.click(point.x, point.y);
  let explored = await verifyExplorer('PROCESSING');
  assert.ok(explored.expected.items.some((o) => o.id === fixtures[0].id));
  assert.ok(
    !explored.expected.items.some((o) => o.id === fixtures[1].id),
    'Forty-day-old orders must not enter the thirty-day slice',
  );
  await explored.modal.locator('.ant-modal-close').click();
  const pending = page.getByRole('button', {
    name: 'نمایش سفارش‌های در انتظار پرداخت',
    exact: true,
  });
  await pending.focus();
  await pending.press('Enter');
  explored = await verifyExplorer('PENDING_PAYMENT');
  assert.ok(explored.expected.total > 10);
  await explored.modal.locator('.ant-pagination-item-2').click();
  await expect.poll(() => inputs.at(-1).page).toBe(2);
  await verifyExplorer('PENDING_PAYMENT');
  await page.keyboard.press('Escape');
  await expect(pending).toBeFocused();
  await page.getByRole('button', { name: 'نمایش آمار خرید از حضوری', exact: true }).click();
  const delivered = page.getByRole('button', { name: 'نمایش سفارش‌های تحویل‌شده', exact: true });
  await delivered.click();
  explored = await verifyExplorer('DELIVERED');
  assert.equal(explored.input.salesChannel, 'IN_PERSON');
  assert.ok(explored.expected.items.every((o) => o.salesChannel === 'IN_PERSON'));
  await explored.modal.screenshot({ path: '/tmp/behjati-dashboard-order-explorer.png' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
    assert.ok((await explored.modal.boundingBox()).width <= width);
    if (width === 390)
      await explored.modal.screenshot({ path: '/tmp/behjati-dashboard-order-explorer-mobile.png' });
  }
  await explored.modal.locator('.ant-modal-close').click();
  await page.getByRole('button', { name: 'نمایش سفارش‌های امروز', exact: true }).click();
  const today = page.getByRole('dialog', { name: 'سفارش‌های امروز', exact: true });
  await expect(today.locator('[data-order-id]').first()).toBeVisible();
  assert.equal(inputs.at(-1).from, inputs.at(-1).to);
  assert.equal(inputs.at(-1).salesChannel, 'IN_PERSON');
  await today.locator('.ant-modal-close').click();
  const dayButtons = page.getByLabel('سفارش‌های روزهای فعال', { exact: true }).getByRole('button');
  if (await dayButtons.count()) {
    await dayButtons.last().click();
    await expect(page.getByRole('dialog').locator('[data-order-id]').first()).toBeVisible();
    assert.equal(inputs.at(-1).from, inputs.at(-1).to);
    await page.getByRole('dialog').locator('.ant-modal-close').click();
  }
  await page.getByRole('button', { name: 'باز کردن گزارش دریافتی', exact: true }).click();
  await expect(page).toHaveURL(/reports\?salesChannel=IN_PERSON/);
  await expect(page.locator('[data-admin-reports]')).toBeVisible();
  await page.getByRole('button', { name: 'محل خرید', exact: true }).hover();
  await expect(
    page
      .getByRole('group', { name: 'محل خرید گزارش', exact: true })
      .getByRole('button', { name: 'حضوری', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.goto(adminOrigin + '/admin/orders/website');
  await expect(page.locator('[data-order-summary]').first()).toBeVisible();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
    const height = (await page.locator('[data-order-summary]').first().boundingBox()).height;
    assert.ok(
      height > 180 && height < 340,
      `Orders remain compact cards at ${width}px: ${height}px`,
    );
    const columns = await page
      .locator('[data-order-grid]')
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    assert.equal(columns, width >= 1280 ? 3 : width >= 768 ? 2 : 1);
    if (width === 1440 || width === 390)
      await page.screenshot({ path: `/tmp/behjati-orders-dense-${width}.png`, fullPage: false });
  }
  const record = page.locator('[data-admin-record]').first();
  await record.getByRole('button', { name: /چاپ فاکتور سفارش/ }).click();
  await expect(page.getByRole('dialog').getByText(/فاکتور سفارش شماره/)).toBeVisible();
  await page.getByRole('button', { name: 'بستن پیش‌نمایش چاپ', exact: true }).click();
  await record.getByRole('button', { name: /چاپ لیبل سفارش/ }).click();
  await expect(page.getByRole('dialog').locator('[data-label-sheet]')).toBeVisible();
  await page.getByRole('dialog').locator('.ant-modal-close').click();
  await record.getByRole('button', { name: /جزئیات سفارش/ }).click();
  await expect(record.getByRole('tab', { name: 'محصولات', exact: true })).toBeVisible();
  await expect(record.getByText('تغییر وضعیت سفارش', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(adminOrigin + '/admin');
  await page.getByRole('button', { name: 'ثبت فروش دستی', exact: true }).click();
  const manual = page.getByRole('dialog', { name: 'ثبت سفارش حضوری / اینستاگرام', exact: true });
  await expect(manual.locator('[data-invoice-header]')).toHaveCount(0);
  await expect(manual).toBeVisible();
  await manual.screenshot({
    path: '/tmp/behjati-invoice-empty-workspace.png',
    animations: 'disabled',
  });
  await manual.locator('.ant-modal-close').click();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `/tmp/behjati-dashboard-workspace-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  }
  await db.admin.update({
    where: { id: admin.id },
    data: { role: 'STAFF', permissions: ['DASHBOARD'] },
  });
  await page.reload();
  await expect(page.locator('[data-admin-dashboard]')).toBeVisible();
  await expect(page.locator('[data-dashboard-status][role="button"]')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'نمایش سفارش‌های امروز', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'ثبت فروش دستی', exact: true })).toHaveCount(0);
  const countBefore = inputs.length;
  await page.locator('[data-dashboard-status]').first().click({ force: true });
  assert.equal(inputs.length, countBefore);
  const limitedNav = page.locator('#admin-desktop-navigation');
  await expect(limitedNav.getByRole('link', { name: 'فروش و مشتریان', exact: true })).toHaveCount(
    0,
  );
  await limitedNav.getByRole('link', { name: 'تنظیمات مدیریت', exact: true }).click();
  await expect(page.locator('[data-admin-section] [data-admin-navigation-card]')).toHaveCount(1);
  await expect(
    page.locator('[data-admin-section]').getByRole('link', { name: 'تنظیمات حساب', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'خروج از مدیریت', exact: true }).click();
  await expect(page).toHaveURL(adminOrigin + '/login');
  await expect(page.getByLabel('ایمیل مدیر', { exact: true })).toBeVisible();
  await page.goto(adminOrigin + '/admin');
  await expect(page).toHaveURL(adminOrigin + '/login');
  assert.deepEqual(errors, []);
  console.log(
    'Accounting workspace passed: actual pie-sector mouse click and keyboard legend, exact status/date/channel order lists, pagination, old-order exclusion, mobile explorer, today/day drilldowns, report source link, three-column compact cards, quick invoice/label and website details, empty invoice and limited-role controls. Temporary fixtures cleaned; no real SMS/bank request.',
  );
} catch (e) {
  await page?.screenshot({ path: '/tmp/behjati-workspace-failure.png', fullPage: true });
  throw e;
} finally {
  await browser?.close();
  await cleanupAdmin();
}
