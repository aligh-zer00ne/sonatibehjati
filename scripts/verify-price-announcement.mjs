import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import { startAPI, db, adminOrigin, errorCode } from './auth-harness.mjs';
import {
  createAdmin,
  loginAdmin,
  adminGql,
  createCustomer,
  createOrderFixture,
  startAdmin,
  cleanupAdmin,
  products,
  admins,
} from './admin-harness.mjs';
const list = '{adminPriceList{id title weight price isActive updatedAt imageUrl categoryTitle}}';
const set =
  'mutation($items:[AdminPriceChangeInput!]!){setAdminPrices(items:$items){id price updatedAt}}';
const good = (r) => {
  assert.equal(r.errors, undefined, JSON.stringify(r.errors));
  return r.data;
};
let browser, page;
try {
  await startAPI();
  await startAdmin();
  const admin = await createAdmin(),
    session = await loginAdmin(admin),
    customer = await createCustomer();
  const category = await db.category.findFirstOrThrow();
  const prefix = 'price-' + randomUUID().slice(0, 8);
  await db.product.createMany({
    data: Array.from({ length: 55 }, (_, i) => ({
      slug: `${prefix}-${i}`,
      title: `اعلامیه آزمون ${prefix} ${i}`,
      price: 100000 + i * 1000,
      weight: '۵۰۰ گرم',
      categoryId: category.id,
      shortDescription: 'آزمون',
      description: 'آزمون',
      isActive: i !== 54,
    })),
  });
  const fixtures = await db.product.findMany({
    where: { slug: { startsWith: prefix } },
    orderBy: { id: 'asc' },
  });
  fixtures.forEach((p) => products.add(p.id));
  const [a, b] = fixtures;
  const historic = await createOrderFixture(customer, a);
  const orderSnapshot = await db.order.findUniqueOrThrow({
    where: { id: historic.id },
    include: { items: true },
  });
  const run = async (items, cookie = session.cookies) => adminGql(set, { items }, cookie);
  const change = (p, price) => ({ id: p.id, price, expectedUpdatedAt: p.updatedAt.toISOString() });
  errorCode(await adminGql(list), 'UNAUTHENTICATED');
  errorCode(await run([]), 'BAD_USER_INPUT');
  errorCode(await run([change(a, -1)]), 'BAD_USER_INPUT');
  assert.ok((await run([change(a, 2147483648)])).errors?.length);
  assert.ok((await run([change(a, 1.5)])).errors?.length);
  errorCode(await run([change(a, 10), change(a, 20)]), 'BAD_USER_INPUT');
  errorCode(
    await adminGql(
      set,
      { items: [change(a, 120000)] },
      session.cookies,
      '192.0.2.1',
      'https://foreign.example',
    ),
    'FORBIDDEN',
  );
  // A conflict on the second row must not partially update the first.
  await db.product.update({
    where: { id: b.id },
    data: { price: b.price + 1000, updatedAt: new Date(b.updatedAt.getTime() + 5000) },
  });
  errorCode(await run([change(a, 120000), change(b, 130000)]), 'REQUEST_CONFLICT');
  assert.equal((await db.product.findUniqueOrThrow({ where: { id: a.id } })).price, a.price);
  const freshB = await db.product.findUniqueOrThrow({ where: { id: b.id } });
  const targets = [change(a, 120000), change(freshB, 130000)];
  const result = good(await run(targets)).setAdminPrices;
  const beforeReplay = await db.product.findMany({
    where: { id: { in: [a.id, b.id] } },
    include: { images: true },
  });
  assert.equal(good(await run(targets)).setAdminPrices.length, 2);
  assert.deepEqual(
    await db.product.findMany({ where: { id: { in: [a.id, b.id] } }, include: { images: true } }),
    beforeReplay,
    'Replay changes no version or metadata',
  );
  for (const p of beforeReplay) {
    const old = fixtures.find((f) => f.id === p.id);
    const { price, updatedAt, images, ...rest } = p;
    const { price: oldPrice, updatedAt: oldUpdated, ...oldRest } = old;
    assert.deepEqual(rest, oldRest);
    assert.deepEqual(images, []);
    assert.ok(price !== oldPrice && updatedAt > oldUpdated);
  }
  const concurrent = result.map((p) => ({
    id: p.id,
    price: p.price + 100,
    expectedUpdatedAt: p.updatedAt,
  }));
  const replay = await Promise.all([run(concurrent), run([...concurrent].reverse())]);
  replay.forEach(good);
  assert.deepEqual(
    await db.order.findUniqueOrThrow({ where: { id: historic.id }, include: { items: true } }),
    orderSnapshot,
  );
  const all = good(await adminGql(list, {}, session.cookies)).adminPriceList;
  assert.ok(all.length > 50);
  assert.equal(all.filter((p) => p.title.includes(prefix)).length, 55);
  const limited = await db.admin.create({
    data: {
      email: `limited-${randomUUID()}@example.test`,
      passwordHash: admin.passwordHash,
      role: 'STAFF',
      permissions: ['ORDERS'],
    },
  });
  admins.push(limited);
  const limitedSession = await loginAdmin({ ...limited, password: admin.password });
  errorCode(await adminGql(list, {}, limitedSession.cookies), 'FORBIDDEN');
  errorCode(await run(concurrent, limitedSession.cookies), 'FORBIDDEN');
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
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(adminOrigin + '/admin/products');
  await page.getByRole('button', { name: 'اعلامیه قیمت', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/products\/prices$/);
  await expect(page.locator('[data-price-row]')).toHaveCount(all.length);
  const search = page.getByLabel('جستجوی اعلامیه قیمت', { exact: true });
  await search.fill(prefix);
  await expect(page.locator('[data-price-row]')).toHaveCount(55);
  const one = page.locator(`[data-price-row="${a.id}"]`),
    two = page.locator(`[data-price-row="${b.id}"]`);
  const priceOne = one.getByRole('spinbutton'),
    priceTwo = two.getByRole('spinbutton');
  await priceOne.fill('1600000');
  await priceTwo.fill('1800000');
  await page.getByRole('button', { name: /فقط تغییرکرده‌ها/ }).click();
  await expect(page.locator('[data-price-row]')).toHaveCount(2);
  // The response is lost after the real server commit. The same prices remain retryable.
  let lose = true,
    requests = 0;
  await context.route('**/api/admin', async (route) => {
    if (!/mutation SetAdminPrices\b/.test(route.request().postDataJSON()?.query ?? ''))
      return route.continue();
    requests++;
    if (lose) {
      lose = false;
      await route.fetch();
      return route.abort();
    }
    return route.continue();
  });
  await page.getByRole('button', { name: /ذخیرهٔ ۲ قیمت/ }).click();
  await expect(page.getByRole('alert')).toContainText('ارتباط برقرار نشد');
  const committed = await db.product.findMany({ where: { id: { in: [a.id, b.id] } } });
  assert.deepEqual(committed.map((p) => p.price).sort(), [160000, 180000]);
  await page.getByRole('button', { name: /ذخیرهٔ ۲ قیمت/ }).click();
  await expect(page.getByText('۰ تغییر آمادهٔ ذخیره', { exact: true })).toBeVisible();
  assert.equal(requests, 2);
  assert.deepEqual(await db.product.findMany({ where: { id: { in: [a.id, b.id] } } }), committed);
  await page.getByRole('button', { name: /فقط تغییرکرده‌ها/ }).click();
  await expect(page.locator('[data-price-row]')).toHaveCount(55);
  await priceOne.fill('999');
  await expect(page.getByRole('button', { name: /ذخیرهٔ ۱ قیمت/ })).toBeDisabled();
  await priceOne.fill('2000000');
  await page.getByRole('button', { name: /برگرداندن قیمت/ }).click();
  await expect(page.getByText('۰ تغییر آمادهٔ ذخیره', { exact: true })).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
    await expect(priceOne).toBeVisible();
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `/tmp/behjati-price-announcement-${width}.png`,
        fullPage: false,
        animations: 'disabled',
      });
  }
  await page.goto(adminOrigin + '/admin/settlements');
  await expect(page.getByRole('heading', { name: 'دریافت و پرداخت', exact: true })).toBeVisible();
  const icons = page.locator('[data-admin-page] svg.lucide');
  assert.ok((await icons.count()) > 4);
  for (const icon of await icons.all()) {
    const w = await icon.getAttribute('width'),
      h = await icon.getAttribute('height');
    assert.equal(w, h, 'Shared icons have square proportions');
    assert.equal(await icon.getAttribute('stroke-width'), '2');
  }
  assert.deepEqual(errors, []);
  console.log(
    'Price announcement passed: all 55 fixture products on one page, rial editing, filtering/undo/validation, atomic multi-price save/conflict rollback, duplicate/concurrent replay, response-loss retry without a second revision, metadata/historical invoice preservation, origin/auth/permission guards, shared square icons and 320–1440px bounds. Temporary fixtures cleaned; no SMS/bank call.',
  );
} catch (e) {
  await page?.screenshot({ path: '/tmp/behjati-prices-failure.png', fullPage: false });
  throw e;
} finally {
  await browser?.close();
  await cleanupAdmin();
}
