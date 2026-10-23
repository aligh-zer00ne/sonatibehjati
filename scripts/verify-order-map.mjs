import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { startAPI, db, adminOrigin } from './auth-harness.mjs';
import {
  createAdmin,
  loginAdmin,
  adminGql,
  createCustomer,
  createOrderFixture,
  cleanupAdmin,
  startAdmin,
} from './admin-harness.mjs';
const query = `query($input:AdminOrdersInput!,$province:String){adminOrdersMap(input:$input,province:$province){total locatedCount unknownCount page pageSize pageTotal totalPages provinces{code name count locatedCount latitude longitude} items{id number total salesChannel status address{province city postalAddress latitude longitude}}}}`;
const list = 'query($input:AdminOrdersInput!){adminOrders(input:$input){total}}';
let browser, page;
try {
  await startAPI();
  const owner = await createAdmin(),
    session = await loginAdmin(owner),
    staff = await createAdmin(),
    denied = await createAdmin();
  await db.admin.update({
    where: { id: staff.id },
    data: { role: 'STAFF', permissions: ['ORDER_MAP'] },
  });
  await db.admin.update({
    where: { id: denied.id },
    data: { role: 'STAFF', permissions: ['ORDERS'] },
  });
  const staffSession = await loginAdmin(staff),
    deniedSession = await loginAdmin(denied);
  const customer = await createCustomer(),
    product = await db.product.findFirstOrThrow({ where: { isActive: true } });
  const fixtures = [];
  for (let i = 0; i < 61; i++) {
    const province =
      i < 27
        ? i % 2
          ? ' استان يزد '
          : 'یزد'
        : i < 52
          ? 'تهران'
          : i < 57
            ? 'استان نامعتبر'
            : 'آذربايجان شرقی';
    const missing = i % 4 === 0;
    const snapshot = {
      ...customer.snapshot,
      province,
      city: i % 2 ? 'شهر اول' : 'شهر دوم',
      recipientName: 'مقصد نقشه',
      latitude: missing ? null : i < 27 ? 32.31 : 35.7,
      longitude: missing ? null : i < 27 ? 54.01 : 51.4,
    };
    const order = await createOrderFixture(customer, product, {
      snapshot,
      total: 200000 + i,
      status: i % 3 ? 'PROCESSING' : 'CANCELED',
      date: new Date(i === 60 ? '2026-01-01T10:00:00Z' : Date.now() - i * 60000),
    });
    await db.order.update({
      where: { id: order.id },
      data: {
        salesChannel: i % 2 ? 'WEBSITE' : 'INSTAGRAM',
        shippingMethod: i % 2 ? 'POST' : 'TIPAX',
      },
    });
    fixtures.push({
      id: order.id,
      province: i < 27 ? 'IR-25' : i < 52 ? 'IR-07' : i < 57 ? 'unknown' : 'IR-01',
      missing,
    });
  }
  const base = { userId: customer.user.id, pageSize: 25 };
  assert.equal(
    (await adminGql(query, { input: base })).errors[0].extensions.code,
    'UNAUTHENTICATED',
  );
  assert.equal(
    (await adminGql(query, { input: base }, deniedSession.cookies)).errors[0].extensions.code,
    'FORBIDDEN',
  );
  assert.equal(
    (await adminGql(query, { input: base, province: 'bad' }, session.cookies)).errors[0].extensions
      .code,
    'BAD_USER_INPUT',
  );
  const result = await adminGql(query, { input: base }, staffSession.cookies);
  assert.equal(result.errors, undefined);
  const data = result.data.adminOrdersMap;
  assert.equal(data.total, 61);
  assert.equal(data.items.length, 25);
  assert.equal(data.provinces.length, 32);
  assert.equal(data.unknownCount, 5);
  assert.equal(data.locatedCount, fixtures.filter((o) => !o.missing).length);
  for (const code of ['IR-25', 'IR-07', 'unknown', 'IR-01']) {
    const expected = fixtures.filter((o) => o.province === code),
      summary = data.provinces.find((p) => p.code === code);
    assert.equal(summary.count, expected.length);
    assert.equal(summary.locatedCount, expected.filter((o) => !o.missing).length);
    const ids = [];
    for (let page = 1; page <= Math.ceil(expected.length / 25); page++) {
      const selected = await adminGql(
        query,
        { input: { ...base, page }, province: code },
        session.cookies,
      );
      assert.equal(selected.errors, undefined);
      assert.equal(selected.data.adminOrdersMap.total, 61);
      assert.equal(selected.data.adminOrdersMap.pageTotal, expected.length);
      ids.push(...selected.data.adminOrdersMap.items.map((o) => o.id));
    }
    assert.deepEqual(
      new Set(ids),
      new Set(expected.map((o) => o.id)),
      'Province drilldown contains every matching snapshot including aliases/missing GPS',
    );
  }
  assert.ok(Math.abs(data.provinces.find((p) => p.code === 'IR-25').latitude - 32.31) < 0.00001);
  for (const patch of [
    { status: 'PROCESSING' },
    { salesChannel: 'INSTAGRAM' },
    { manualOnly: true },
    { shippingMethod: 'POST' },
    { city: 'شهر اول' },
    { from: '2026-10-01', to: '2026-10-31' },
    { number: data.items[0].number },
    { search: 'مقصد نقشه' },
    { search: customer.user.phone },
    { search: "x' OR 1=1 --" },
    { search: '%' },
  ]) {
    const input = { ...base, ...patch };
    const a = await adminGql(query, { input }, session.cookies),
      b = await adminGql(list, { input }, session.cookies);
    assert.equal(a.errors, undefined);
    assert.equal(b.errors, undefined);
    assert.equal(
      a.data.adminOrdersMap.total,
      b.data.adminOrders.total,
      `Map/list filter equivalence ${JSON.stringify(patch)}`,
    );
  }
  const sorted = await adminGql(query, { input: { ...base, sort: 'TOTAL_DESC' } }, session.cookies);
  const totals = sorted.data.adminOrdersMap.items.map((o) => o.total);
  assert.deepEqual(
    totals,
    [...totals].sort((a, b) => b - a),
  );
  await startAdmin();
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
  let externalMapCalls = 0;
  await context.route(/https:\/\/([^/]+\.)?neshan\.(org|ir)\//, (route) => {
    externalMapCalls++;
    return route.abort();
  });
  page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => {
    errors.push(e.message);
    console.error('Browser error:', e.message);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') console.error('Browser console:', message.text());
  });
  await page.goto(`${adminOrigin}/admin/orders/map?userId=${customer.user.id}`);
  const map = page.locator('[data-order-province-map]');
  await expect(map).toBeVisible();
  await expect(map.getByRole('button')).toHaveCount(31);
  await expect(page.locator('[data-map-metric="orders"]')).toHaveText('۶۱');
  assert.equal(externalMapCalls, 0, 'Province map is self-contained');
  await expect(page.getByRole('button', { name: 'نقشه نشان', exact: true })).toHaveCount(0);
  const yazd = map.locator('[data-province-code="IR-25"]');
  await yazd.focus();
  await page.keyboard.press('Enter');
  await expect(yazd).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'سفارش‌های یزد', exact: true })).toBeVisible();
  await expect(page.getByRole('list', { name: 'سفارش‌های نقشه' }).getByRole('button')).toHaveCount(
    25,
  );
  await page.getByRole('button', { name: 'حذف انتخاب استان یزد', exact: true }).click();
  const first = page.getByRole('list', { name: 'سفارش‌های نقشه' }).getByRole('button').first();
  await first.click();
  await expect(page.locator('[data-selected-order]')).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(map).toBeVisible();
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `Map fits ${width}px`,
    );
    if (width === 390 || width === 1440)
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `/tmp/behjati-order-map-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      });
  }
  await page.getByRole('button', { name: 'فیلتر استان استان نامشخص', exact: true }).click();
  await expect(page.getByRole('list', { name: 'سفارش‌های نقشه' }).getByRole('button')).toHaveCount(
    5,
  );
  assert.equal(externalMapCalls, 0, 'No external map API/key is required');
  assert.deepEqual(errors, []);
  console.log(
    'Order map passed: full 61-order province aggregation beyond pagination, aliases/unknown/GPS counts, exact province drilldown, all filter equivalence, sorting/auth/permissions, keyboard province SVG, self-contained map without a key or external map requests, selection and 320–1440px bounds. No live Neshan key/tile, SMS or bank call.',
  );
} catch (e) {
  await page?.screenshot({ path: '/tmp/behjati-order-map-failure.png', fullPage: true });
  throw e;
} finally {
  await browser?.close();
  await cleanupAdmin();
}
