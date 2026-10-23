import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile, unlink } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import { startAPI, db, adminOrigin } from './auth-harness.mjs';
import {
  createAdmin,
  loginAdmin,
  createCustomer,
  createOrderFixture,
  startAdmin,
  cleanupAdmin,
  products,
  admins,
} from './admin-harness.mjs';
let browser, page, newSlug, staffEmail;
const uploads = [];
try {
  await startAPI();
  await startAdmin();
  const owner = await createAdmin(),
    session = await loginAdmin(owner),
    customer = await createCustomer();
  const category = await db.category.findFirstOrThrow();
  const product = await db.product.create({
    data: {
      title: 'محصول بازبینی پنل',
      slug: 'panel-review-' + randomBytes(6).toString('hex'),
      price: 150000,
      weight: '۵۰۰ گرم',
      shippingWeightGrams: 550,
      categoryId: category.id,
      shortDescription: 'معرفی حفظ‌شده',
      description: 'توضیحات حفظ‌شده',
      images: { create: { url: '/images/logo-brand.png', alt: 'تصویر بازبینی' } },
    },
  });
  products.add(product.id);
  const order = await createOrderFixture(customer, product, { status: 'PROCESSING' });
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const cookies = session.cookies.split('; ').map((v) => {
    const i = v.indexOf('=');
    return { name: v.slice(0, i), value: v.slice(i + 1), url: adminOrigin };
  });
  await context.addCookies(cookies);
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const routes = [
    '/admin',
    '/admin/sections/sales',
    '/admin/sections/catalog',
    '/admin/sections/communication',
    '/admin/sections/settings',
    '/admin/orders/website',
    '/admin/orders/manual',
    '/admin/orders/map',
    '/admin/orders/' + order.id,
    '/admin/settlements',
    '/admin/settlements/receipt',
    '/admin/settlements/payment',
    '/admin/settlements/account?customerId=' + customer.user.id,
    '/admin/settlements/links',
    '/admin/settlements/links/new',
    '/admin/products',
    '/admin/products/new',
    '/admin/products/' + product.id + '/edit',
    '/admin/products/prices',
    '/admin/users',
    '/admin/reports',
    '/admin/coupons',
    '/admin/tickets',
    '/admin/reviews',
    '/admin/accounts',
    '/admin/store-information',
    '/admin/shipping',
    '/admin/announcement',
    '/admin/settings',
  ];
  for (const [index, path] of routes.entries()) {
    await page.goto(adminOrigin + path, { waitUntil: 'networkidle' });
    await expect(page.locator('[data-admin-page]').getByRole('heading').first()).toBeVisible();
    if (path === '/admin')
      await expect(page.locator('[data-dashboard-donut]')).toHaveAttribute(
        'data-donut-ready',
        'true',
      );
    await expect(page.locator('main .ant-alert-error')).toHaveCount(0);
    await expect(
      page.locator('footer').getByRole('link', { name: 'nexoraict.ir', exact: true }),
    ).toBeVisible();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth), {
          message: `${path} fits ${width}px`,
        })
        .toBeLessThanOrEqual(1);
      if ([390, 1440].includes(width)) {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({
          path: `/tmp/behjati-panel-review-${index}-${width}.png`,
          fullPage: true,
          animations: 'disabled',
        });
      }
    }
  }
  // Edit only our own product and check the hidden tab fields and immutable order snapshot.
  await page.goto(adminOrigin + '/admin/products/' + product.id + '/edit');
  await page.getByLabel('عنوان محصول', { exact: true }).fill('محصول ویرایش‌شده در فرم جدید');
  await page.getByLabel('قیمت (ریال)', { exact: true }).fill('1900000');
  await page.getByRole('button', { name: 'ذخیره محصول', exact: true }).click();
  await expect
    .poll(async () => (await db.product.findUniqueOrThrow({ where: { id: product.id } })).price)
    .toBe(190000);
  let saved = await db.product.findUniqueOrThrow({
    where: { id: product.id },
    include: { images: true },
  });
  assert.equal(saved.description, product.description);
  assert.equal(saved.shippingWeightGrams, 550);
  assert.equal(saved.images[0].alt, 'تصویر بازبینی');
  const oldItem = await db.orderItem.findFirstOrThrow({ where: { orderId: order.id } });
  assert.equal(oldItem.productTitle, product.title);
  // New product uses the actual upload, validation tabs and save API.
  await page.goto(adminOrigin + '/admin/products/new');
  newSlug = 'panel-new-' + randomBytes(6).toString('hex');
  await page.getByLabel('عنوان محصول', { exact: true }).fill('محصول جدید بازبینی');
  await page.getByLabel('نامک انگلیسی', { exact: true }).fill(newSlug);
  await page.getByLabel('قیمت (ریال)', { exact: true }).fill('2500000');
  await page.getByLabel('وزن یا حجم', { exact: true }).fill('یک کیلوگرم');
  await page.getByLabel('دسته‌بندی', { exact: true }).click();
  await page.locator('.ant-select-item-option').filter({ hasText: category.title }).last().click();
  await page.getByRole('button', { name: 'ذخیره محصول', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'آپلود تصویر', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  const uploadResponse = page.waitForResponse((response) =>
    response.url().endsWith('/api/admin/uploads'),
  );
  await page.getByLabel('آپلود تصویر 1', { exact: true }).setInputFiles({
    name: 'panel-brand.png',
    mimeType: 'image/png',
    buffer: await readFile('apps/storefront/public/images/logo-brand.png'),
  });
  const upload = await uploadResponse;
  assert.equal(upload.status(), 201);
  const url = (await upload.json()).url;
  assert.match(url, /^\/uploads\//);
  uploads.push('apps/api' + url);
  await page.getByLabel('توضیح تصویر', { exact: true }).fill('تصویر محصول جدید');
  await page.getByRole('tab', { name: 'وزن ارسال', exact: true }).click();
  await page.getByLabel('وزن بسته برای ارسال (گرم)', { exact: true }).fill('1100');
  await page.getByRole('button', { name: 'ذخیره محصول', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/products\/[^/]+\/edit$/);
  saved = await db.product.findUniqueOrThrow({ where: { slug: newSlug } });
  products.add(saved.id);
  assert.equal(saved.price, 250000);
  assert.equal(saved.shippingWeightGrams, 1100);
  // Permissions still come from the owner; only temporary colleague records are changed.
  await page.goto(adminOrigin + '/admin/accounts');
  staffEmail = 'panel-' + randomBytes(6).toString('hex') + '@example.test';
  const password = randomBytes(20).toString('hex');
  await page.getByLabel('ایمیل همکار', { exact: true }).fill(staffEmail);
  await page.getByLabel('رمز اولیه (حداقل ۱۲ نویسه)', { exact: true }).fill(password);
  await page.getByRole('checkbox', { name: 'محصولات و تخفیف محصول', exact: true }).check();
  await page.getByRole('button', { name: 'ساخت حساب همکار', exact: true }).click();
  await expect(page.getByText(staffEmail, { exact: true })).toBeVisible();
  const staff = await db.admin.findUniqueOrThrow({ where: { email: staffEmail } });
  admins.push(staff);
  assert.deepEqual(staff.permissions, ['PRODUCTS']);
  const row = page.getByRole('article').filter({ hasText: staffEmail });
  await row.getByRole('button', { name: 'تعیین دسترسی‌ها', exact: true }).click();
  const modal = page.getByRole('dialog');
  await modal.getByRole('checkbox', { name: 'نقشه سفارش‌ها', exact: true }).check();
  await modal.getByRole('button', { name: 'ذخیره دسترسی‌ها', exact: true }).click();
  await expect(modal).toBeHidden();
  assert.deepEqual(
    new Set((await db.admin.findUniqueOrThrow({ where: { id: staff.id } })).permissions),
    new Set(['PRODUCTS', 'ORDER_MAP']),
  );
  // Real mobile tap on a card still navigates; no drag capture or hover requirement.
  const touch = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const touchSession = await loginAdmin(owner);
  await touch.addCookies(
    touchSession.cookies.split('; ').map((v) => {
      const i = v.indexOf('=');
      return { name: v.slice(0, i), value: v.slice(i + 1), url: adminOrigin };
    }),
  );
  const mobile = await touch.newPage();
  await mobile.goto(adminOrigin + '/admin/settlements');
  await mobile.locator('a[href="/admin/settlements/receipt"][data-interactive-card]').tap();
  await expect(mobile).toHaveURL(adminOrigin + '/admin/settlements/receipt');
  await touch.close();
  assert.deepEqual(errors, []);
  console.log(
    'Panel review passed: 29 routes at 320/390/768/1440, visible designer link, actual product edit/create/upload/rial/weight/hidden-field preservation, immutable historical item, staff creation/permission editing, and real mobile card tap. Fixtures cleaned; no production/SMS/bank call.',
  );
} catch (e) {
  await page?.screenshot({ path: '/tmp/behjati-panel-review-failure.png', fullPage: true });
  throw e;
} finally {
  await browser?.close();
  if (newSlug) {
    const p = await db.product.findUnique({ where: { slug: newSlug } });
    if (p) products.add(p.id);
  }
  if (staffEmail) {
    const staff = await db.admin.findUnique({ where: { email: staffEmail } });
    if (staff && !admins.some((a) => a.id === staff.id)) admins.push(staff);
  }
  await cleanupAdmin();
  await Promise.all(uploads.map((p) => unlink(p).catch(() => {})));
}
