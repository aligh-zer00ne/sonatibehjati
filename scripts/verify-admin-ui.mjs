import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile, unlink } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
const sharp = createRequire(new URL('../apps/api/package.json', import.meta.url))('sharp');
import { startAPI, startStorefront, origin, adminOrigin, db } from './auth-harness.mjs';
import {
  createAdmin,
  createCustomer,
  createOrderFixture,
  startAdmin,
  products,
  cleanupAdmin,
} from './admin-harness.mjs';
let browser;
const uploadedFiles = [];
try {
  await startAPI();
  await startAdmin();
  await startStorefront();
  const admin = await createAdmin();
  const customer = await createCustomer();
  const category = await db.category.findFirstOrThrow();
  const product = await db.product.create({
    data: {
      title: 'عنوان تاریخی آزمون',
      slug: `ui-admin-${randomBytes(8).toString('hex')}`,
      categoryId: category.id,
      price: 100000,
      weight: '۵۰۰ گرم',
      shortDescription: '',
      description: '',
      images: { create: { url: '/images/test.png', alt: 'آزمون' } },
    },
  });
  products.add(product.id);
  const order = await createOrderFixture(customer, product);
  const missing = await createOrderFixture(customer, product, {
    snapshot: { ...customer.snapshot, latitude: null, longitude: null },
  });
  await db.address.update({ where: { id: customer.address.id }, data: { city: 'تهران' } });
  await db.product.update({ where: { id: product.id }, data: { title: 'عنوان تغییرکرده آزمون' } });
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9HcAAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  await context.route('https://assets.example.test/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9HcAAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const goto = (path) => page.goto(adminOrigin + path, { waitUntil: 'networkidle' });
  for (const path of [
    '/admin',
    '/admin/products',
    '/admin/orders',
    '/admin/orders/map',
    '/admin/users',
    '/admin/reports',
    `/admin/orders/${order.id}`,
  ]) {
    await goto(path);
    await expect(page).toHaveURL(adminOrigin + '/login');
    await expect(page.getByRole('heading', { name: 'ورود مدیر' })).toBeVisible();
  }
  await goto('/admin');
  await page.getByLabel('ایمیل مدیر', { exact: true }).fill(admin.email);
  await page.getByLabel('رمز ورود', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(page.locator('[role="alert"]')).toBeVisible();
  await page.getByLabel('رمز ورود', { exact: true }).fill(admin.password);
  await page.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(page).toHaveURL(adminOrigin + '/admin');
  await expect(page.getByRole('heading', { name: 'داشبورد مدیریت' })).toBeVisible();
  await expect(page.locator('.recharts-surface').first()).toBeVisible();
  const cookies = await context.cookies();
  assert.equal(cookies.filter((cookie) => cookie.name === 'behjati_admin_refresh').length, 1);
  assert.ok(cookies.find((cookie) => cookie.name === 'behjati_admin_refresh').httpOnly);
  assert.ok(!cookies.some((cookie) => cookie.name.startsWith('behjati_user_')));
  assert.deepEqual(
    await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    })),
    { local: [], session: [] },
  );
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'داشبورد مدیریت' })).toBeVisible();
  await page.screenshot({ path: '/tmp/behjati-phase8-dashboard-desktop.png', fullPage: true });
  await goto('/admin/products');
  await page.getByRole('button', { name: 'محصول جدید', exact: true }).click();
  const dialog = page.locator('main');
  await expect(page).toHaveURL(adminOrigin + '/admin/products/new');
  const title = 'محصول ایجادشده در مرورگر';
  const slug = `ui-create-${randomBytes(8).toString('hex')}`;
  await dialog.getByLabel('عنوان محصول', { exact: true }).fill(title);
  await dialog.getByLabel('نامک انگلیسی', { exact: true }).fill(slug);
  await dialog.getByLabel('قیمت (تومان)', { exact: true }).fill('150000');
  await expect(dialog.getByLabel('قیمت (تومان)', { exact: true })).toHaveValue('150٬000');
  await expect(dialog.getByText('صد و پنجاه هزار تومان', { exact: true })).toBeVisible();
  await dialog.getByLabel('وزن یا حجم', { exact: true }).fill('۵۰۰ گرم');
  await dialog.getByLabel('دسته‌بندی', { exact: true }).click();
  await page.locator('.ant-select-item-option').filter({ hasText: category.title }).last().click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.reload({ waitUntil: 'networkidle' });
  await expect(dialog.getByLabel('عنوان محصول', { exact: true })).toHaveValue(title);
  await expect(dialog.getByLabel('قیمت (تومان)', { exact: true })).toHaveValue('150٬000');
  await page.getByRole('tab', { name: 'آپلود تصویر', exact: true }).click();
  const uploadResponse = page.waitForResponse((response) =>
    response.url().endsWith('/api/admin/uploads'),
  );
  await page.getByLabel('آپلود تصویر 1', { exact: true }).setInputFiles({
    name: 'halva.png',
    mimeType: 'image/png',
    buffer: await sharp({ create: { width: 128, height: 128, channels: 3, background: '#af8053' } })
      .png()
      .toBuffer(),
  });
  const uploadResult = await uploadResponse;
  assert.equal(uploadResult.status(), 201, await uploadResult.text());
  const uploaded = (await uploadResult.json()).url;
  uploadedFiles.push('apps/api' + uploaded);
  await dialog.getByLabel('توضیح تصویر', { exact: true }).fill('حلوا سنتی');
  await dialog.getByRole('button', { name: 'ذخیره محصول', exact: true }).click();
  await expect(page).toHaveURL(adminOrigin + '/admin/products');
  const created = await db.product.findUniqueOrThrow({ where: { slug } });
  products.add(created.id);
  const uploadedDelivery = await context.request.get(origin + uploaded);
  assert.equal(uploadedDelivery.status(), 200);
  const shop = await context.newPage();
  shop.on('pageerror', (error) => errors.push(error.message));
  await shop.goto(origin + '/product/' + slug, { waitUntil: 'networkidle' });
  await expect(shop.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await expect
    .poll(() =>
      shop
        .getByAltText('حلوا سنتی', { exact: true })
        .first()
        .evaluate((img) => img.naturalWidth > 0),
    )
    .toBe(true);
  console.log('Product page creation, draft recovery, amount words and upload delivery passed.');
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: `ویرایش ${title}`, exact: true }).click();
  await dialog.getByLabel('قیمت (تومان)', { exact: true }).fill('180000');
  await dialog.getByRole('button', { name: 'ذخیره محصول', exact: true }).click();
  await expect(page).toHaveURL(adminOrigin + '/admin/products');
  await expect
    .poll(async () => (await db.product.findUniqueOrThrow({ where: { id: created.id } })).price)
    .toBe(180000);
  await page.getByRole('button', { name: `غیرفعال کردن ${title}`, exact: true }).click();
  await expect(page.getByRole('button', { name: `فعال کردن ${title}`, exact: true })).toBeVisible();
  const inactive = await shop.reload({ waitUntil: 'networkidle' });
  assert.equal(inactive.status(), 404);
  await shop.close();
  await page.getByRole('button', { name: `حذف ${title}`, exact: true }).click();
  await page.getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect(page.getByText(title, { exact: true })).not.toBeVisible();
  assert.equal(await db.product.findUnique({ where: { id: created.id } }), null);
  await goto(`/admin/orders?userId=${customer.user.id}`);
  await expect(page.locator(`a[href="/admin/orders/${order.id}"]`)).toBeVisible();
  await page.locator(`a[href="/admin/orders/${order.id}"]`).click();
  await expect(page.getByText('عنوان تاریخی آزمون', { exact: true })).toBeVisible();
  await expect(page.getByText('یزد، اردکان، خیابان آزمون، پلاک ۱۰', { exact: true })).toBeVisible();
  await page.getByLabel('وضعیت جدید سفارش', { exact: true }).click();
  await page.locator('.ant-select-item-option').filter({ hasText: 'در حال آماده‌سازی' }).click();
  await page.getByRole('button', { name: 'ثبت وضعیت', exact: true }).click();
  await page.getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect(page.getByText(admin.email, { exact: true })).toHaveCount(1);
  assert.equal(
    (await db.order.findUniqueOrThrow({ where: { id: order.id } })).status,
    'PROCESSING',
  );
  await goto(`/admin/orders/map?userId=${customer.user.id}`);
  await expect(page.getByRole('region', { name: 'نقشه سفارش‌ها', exact: true })).toBeVisible();
  await expect(page.locator('.leaflet-container')).toHaveCSS('direction', 'rtl');
  await expect(page.locator('.leaflet-container')).toHaveCSS('font-family', /Vazirmatn/);
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(1);
  await page.locator('.leaflet-marker-icon').click();
  await expect(page.locator('.leaflet-popup-content')).toContainText('اردکان');
  await page.locator('.leaflet-popup-content button').click();
  await expect(page).toHaveURL(adminOrigin + `/admin/orders/${order.id}`);
  await goto('/admin/users');
  await page.getByLabel('جستجوی کاربر').fill(customer.user.phone);
  await page.getByLabel('جستجوی کاربر').press('Enter');
  await expect(page.locator('tbody tr.ant-table-row')).toHaveCount(1);
  await goto('/admin/reports');
  await expect(page.getByRole('button', { name: 'خروجی CSV', exact: true })).toBeEnabled();
  const reportTo = await page.locator('#report-to').inputValue();
  assert.match(reportTo, /^۱۴۰[۰-۹]\//);
  await page.locator('#report-to').click();
  await expect(page.locator('.rmdp-calendar')).toBeVisible();
  await page.locator('.rmdp-day.rmdp-selected span.sd').click();
  await page.getByRole('heading', { name: 'گزارش سفارش‌ها' }).click();
  await expect(page.locator('#report-to')).toHaveValue(reportTo);
  const dailyFirst = await page
    .locator('.ant-table-tbody tr.ant-table-row')
    .first()
    .locator('td')
    .first()
    .innerText();
  const todayLabel = new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    month: 'short',
    day: 'numeric',
  }).format(new Date());
  assert.equal(dailyFirst, todayLabel);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'خروجی CSV', exact: true }).click();
  const download = await downloadPromise;
  const csv = await readFile(await download.path(), 'utf8');
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('درآمد تأییدشده'));
  assert.ok(csv.split('\r\n').length === 31);
  await page.screenshot({ path: '/tmp/behjati-phase8-reports-desktop.png', fullPage: true });
  let fail = true;
  const failingRoute = (route) => {
    if (fail && route.request().postDataJSON().query.includes('query AdminProducts')) {
      fail = false;
      return route.abort('failed');
    }
    return route.continue();
  };
  await page.route('**/api/admin', failingRoute);
  await goto('/admin/products');
  await expect(page.getByRole('button', { name: 'تلاش دوباره', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'تلاش دوباره', exact: true }).click();
  await expect(page.getByRole('button', { name: 'محصول جدید', exact: true })).toBeEnabled();
  await page.unroute('**/api/admin', failingRoute);
  for (const path of [
    '/admin',
    '/admin/products',
    `/admin/orders/${order.id}`,
    '/admin/orders/map',
    '/admin/users',
    '/admin/reports',
  ]) {
    await goto(path);
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await goto('/admin');
  await page.screenshot({ path: '/tmp/behjati-phase8-dashboard-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await goto(`/admin/orders/${order.id}`);
  await page.getByRole('button', { name: 'چاپ فاکتور / PDF' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('[data-invoice]')).toContainText('عنوان تاریخی آزمون');
  await page.evaluate(() => {
    window.print = () => {
      window.__printed = true;
    };
  });
  await page.getByRole('button', { name: 'چاپ / ذخیره PDF', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__printed)).toBe(true);
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('button', { name: 'خروج از مدیریت' })).not.toBeVisible();
  await expect(page.getByText('فاکتور در اندازه A5', { exact: false })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'چاپ / ذخیره PDF' })).not.toBeVisible();
  await page.pdf({
    path: '/tmp/behjati-phase8-invoice.pdf',
    preferCSSPageSize: true,
    printBackground: true,
  });
  const info = execFileSync('pdfinfo', ['/tmp/behjati-phase8-invoice.pdf'], { encoding: 'utf8' });
  const size = info.match(/Page size:\s+([\d.]+) x ([\d.]+) pts \(A5\)/);
  assert.ok(
    size && Math.abs(Number(size[1]) - 419.53) < 1 && Math.abs(Number(size[2]) - 595.28) < 1,
  );
  await page.emulateMedia({ media: 'screen' });
  await page.screenshot({ path: '/tmp/behjati-phase8-invoice.png', fullPage: true });
  await db.orderItem.createMany({
    data: Array.from({ length: 35 }, (_, index) => ({
      orderId: order.id,
      productId: product.id,
      productTitle: 'ردیف طولانی فاکتور ' + index,
      productWeight: '۵۰۰ گرم',
      unitPrice: 100000,
      quantity: 2,
      lineTotal: 200000,
    })),
  });
  await db.order.update({ where: { id: order.id }, data: { subtotal: 7200000, total: 7250000 } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'چاپ فاکتور / PDF' }).click();
  await expect(page.locator('[data-invoice] tbody tr')).toHaveCount(36);
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: '/tmp/behjati-phase8-invoice-long.pdf',
    preferCSSPageSize: true,
    printBackground: true,
  });
  const longInfo = execFileSync('pdfinfo', ['/tmp/behjati-phase8-invoice-long.pdf'], {
    encoding: 'utf8',
  });
  assert.ok(Number(longInfo.match(/Pages:\s+(\d+)/)[1]) > 1);
  const longText = execFileSync(
    'pdftotext',
    ['-layout', '/tmp/behjati-phase8-invoice-long.pdf', '-'],
    { encoding: 'utf8' },
  );
  assert.ok(longText.includes('۷٬۲۵۰٬۰۰۰'));
  assert.ok(!longText.includes('خروج از مدیریت'));
  assert.ok(!longText.includes(admin.email));
  await page.emulateMedia({ media: 'screen' });
  await page.locator('.ant-modal-close').click();
  await unlink('apps/api' + uploaded).catch(() => {});
  const tab = await context.newPage();
  tab.on('pageerror', (error) => errors.push(error.message));
  await tab.goto(adminOrigin + '/admin', { waitUntil: 'networkidle' });
  await expect(tab.getByRole('heading', { name: 'داشبورد مدیریت' })).toBeVisible();
  await page.getByRole('button', { name: 'خروج از مدیریت', exact: true }).click();
  await expect(page).toHaveURL(adminOrigin + '/login');
  await expect(tab).toHaveURL(adminOrigin + '/login');
  assert.deepEqual(errors, []);
  assert.ok(missing.id);
  console.log(
    'Admin UI passed: private routes/login return, wrong credentials, memory-only access/HttpOnly refresh, reload, dashboard/charts, product create/edit/activation/deletion, immutable order snapshots/audited status, map marker/detail, users/search, CSV, API error/retry, responsive layouts, live storefront/HTTPS images, single/multiple-page Persian A5 PDF and multi-tab logout without runtime errors.',
  );
} finally {
  await browser?.close();
  await cleanupAdmin();
  await Promise.all(uploadedFiles.map((file) => unlink(file).catch(() => {})));
}
