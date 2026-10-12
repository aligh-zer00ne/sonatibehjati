import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import { startAPI, db, adminOrigin } from './auth-harness.mjs';
import {
  createAdmin,
  createCustomer,
  createOrderFixture,
  loginAdmin,
  adminGql,
  adminQueries,
  startAdmin,
  products,
  cleanupAdmin,
} from './admin-harness.mjs';
const labelMutation =
  'mutation($orderId:ID!,$input:AdminShippingLabelInput!,$expectedUpdatedAt:String){saveAdminShippingLabel(orderId:$orderId,input:$input,expectedUpdatedAt:$expectedUpdatedAt){recipientName recipientPhone recipientPostalCode note updatedAt}}';
const passwordMutation =
  'mutation($input:AdminPasswordChangeInput!){changeAdminPassword(input:$input)}';
let browser;
try {
  await startAPI();
  await startAdmin();
  const admin = await createAdmin();
  const other = await createAdmin();
  const customer = await createCustomer();
  const suffix = randomBytes(6).toString('hex');
  const category = await db.category.findFirstOrThrow();
  const product = await db.product.create({
    data: {
      title: `محصول پنل ${suffix}`,
      slug: `admin-upgrade-${suffix}`,
      price: 100000,
      weight: '۵۰۰ گرم',
      categoryId: category.id,
      shortDescription: '',
      description: '',
    },
  });
  products.add(product.id);
  const order = await createOrderFixture(customer, product);
  const untouched = await createOrderFixture(customer, product);
  const session = await loginAdmin(admin);
  const second = await loginAdmin(admin);
  const unrelated = await loginAdmin(other);
  for (const newPassword of ['short', admin.password]) {
    const rejected = await adminGql(
      passwordMutation,
      { input: { currentPassword: admin.password, newPassword } },
      session.cookies,
    );
    assert.equal(rejected.errors?.[0]?.extensions?.code, 'BAD_USER_INPUT');
  }
  const input = {
    senderName: 'سنتی بهجتی اردکان',
    senderPhone: '۰۹۱۲۳۴۵۶۷۸۹',
    senderAddress: 'نشانی فرستنده آزمون',
    senderPostalCode: '۱۲۳۴۵۶۷۸۹۰',
    recipientName: 'گیرنده لیبل آزمون',
    recipientPhone: customer.user.phone,
    recipientAddress: 'نشانی اختصاصی لیبل',
    recipientPostalCode: '۱۲۳۴۵۶۷۸۹۰',
    carrier: 'پست',
    trackingNumber: '',
    packageWeight: '۱ کیلوگرم',
    packageContent: 'دو محصول',
    note: 'شکستنی',
    paperSize: 'THERMAL',
  };
  assert.equal(
    (await adminGql(labelMutation, { orderId: order.id, input })).errors?.[0]?.extensions?.code,
    'UNAUTHENTICATED',
  );
  assert.equal(
    (
      await adminGql(
        labelMutation,
        { orderId: order.id, input },
        session.cookies,
        undefined,
        'https://other.example',
      )
    ).errors?.[0]?.extensions?.code,
    'FORBIDDEN',
  );
  assert.equal(
    (
      await adminGql(
        labelMutation,
        { orderId: order.id, input: { ...input, recipientPostalCode: '123' } },
        session.cookies,
      )
    ).errors?.[0]?.extensions?.code,
    'BAD_USER_INPUT',
  );
  const saved = await adminGql(labelMutation, { orderId: order.id, input }, session.cookies);
  assert.equal(saved.errors, undefined);
  const version = saved.data.saveAdminShippingLabel.updatedAt;
  assert.equal(saved.data.saveAdminShippingLabel.recipientPostalCode, '1234567890');
  const concurrent = await Promise.all(
    ['یک', 'دو'].map((note) =>
      adminGql(
        labelMutation,
        { orderId: order.id, input: { ...input, note }, expectedUpdatedAt: version },
        session.cookies,
      ),
    ),
  );
  assert.equal(concurrent.filter((r) => r.data?.saveAdminShippingLabel).length, 1);
  assert.equal(
    concurrent.filter((r) => r.errors?.[0]?.extensions?.code === 'REQUEST_CONFLICT').length,
    1,
  );
  assert.deepEqual(
    (await db.order.findUniqueOrThrow({ where: { id: order.id } })).addressSnapshot,
    order.addressSnapshot,
  );
  assert.equal(await db.orderShippingLabel.findUnique({ where: { orderId: untouched.id } }), null);
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 1536, height: 1024 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const goto = (path) => page.goto(adminOrigin + path, { waitUntil: 'networkidle' });
  await goto('/login');
  await page.getByLabel('ایمیل مدیر', { exact: true }).fill(admin.email);
  await page.getByLabel('رمز ورود', { exact: true }).fill(admin.password);
  await page.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(page.locator('[data-admin-dashboard]')).toBeVisible();
  await expect(page.getByRole('link', { name: 'تخفیف‌ها و جشنواره‌ها', exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByText('سلام مدیر عزیز', { exact: true })).toHaveCount(0);
  await expect(page.locator('header').getByText('مدیر فروشگاه', { exact: true })).toHaveCount(0);
  const selectedMenu = page.locator('[data-admin-sidebar] a[aria-current=page]');
  await expect(selectedMenu).toHaveCSS('background-color', 'rgb(177, 107, 102)');
  await page
    .locator('[data-admin-sidebar]')
    .getByRole('link', { name: 'محصولات', exact: true })
    .hover();
  await expect(
    page.locator('[data-admin-sidebar]').getByRole('link', { name: 'محصولات', exact: true }),
  ).toHaveCSS('background-color', 'rgb(173, 83, 96)');
  await page.screenshot({ path: '/tmp/behjati-admin-redesign-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'جمع کردن منوی مدیریت' }).click();
  await expect(page.locator('[data-admin-sidebar]')).toHaveCSS('width', '80px');
  await page.getByRole('button', { name: 'باز کردن منوی کناری' }).click();
  await page.getByLabel('جستجوی پنل مدیریت', { exact: true }).fill(suffix);
  await page.getByLabel('جستجوی پنل مدیریت', { exact: true }).press('Enter');
  await expect(page).toHaveURL(new RegExp('/admin/products\\?search=' + suffix));
  await expect(page.locator('tbody tr.ant-table-row')).toHaveCount(1);
  await goto(`/admin/orders/${order.id}`);
  await page.getByRole('button', { name: 'لیبل پستی / چاپ' }).click();
  await expect(page.getByLabel('نام گیرنده', { exact: true })).toHaveValue(input.recipientName);
  await page.getByLabel('نام گیرنده', { exact: true }).fill('گیرنده شخصی‌سازی شده');
  await page.getByLabel('یادداشت روی بسته (اختیاری)', { exact: true }).fill('لیبل قابل چاپ آزمون');
  await page.getByRole('button', { name: 'ذخیره لیبل سفارش' }).click();
  await expect(page.getByText('لیبل ذخیره شده', { exact: true })).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'لیبل پستی / چاپ' }).click();
  await expect(page.getByLabel('نام گیرنده', { exact: true })).toHaveValue('گیرنده شخصی‌سازی شده');
  await expect(page.locator('[data-shipping-label]')).toContainText('لیبل قابل چاپ آزمون');
  await expect(page.locator('[data-shipping-label] [data-brand-qr]')).toBeVisible();
  await page.evaluate(() => {
    window.print = () => {
      window.__printed = true;
    };
  });
  await page.getByRole('button', { name: 'چاپ لیبل / PDF' }).click();
  await expect.poll(() => page.evaluate(() => window.__printed)).toBe(true);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('#behjati-admin-print')).toBeVisible();
  await expect(page.getByRole('button', { name: 'ذخیره لیبل سفارش' })).not.toBeVisible();
  await expect(page.locator('[data-admin-sidebar]')).not.toBeVisible();
  await page.pdf({
    path: '/tmp/behjati-shipping-label.pdf',
    preferCSSPageSize: true,
    printBackground: true,
  });
  const labelPdf = await readFile('/tmp/behjati-shipping-label.pdf', 'latin1');
  assert.equal(
    [...labelPdf.matchAll(/\/Type\s*\/Page\b/g)].length,
    1,
    'The complete thermal label must fit on one page.',
  );
  await page.emulateMedia({ media: 'screen' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/admin',
      '/admin/products',
      '/admin/products/new',
      `/admin/products/${product.id}/edit`,
      '/admin/settings',
      `/admin/orders/${order.id}`,
    ]) {
      await goto(path);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
    }
    if (width === 390) {
      await goto('/admin');
      await page.screenshot({ path: '/tmp/behjati-admin-redesign-mobile.png', fullPage: true });
      await page.getByRole('button', { name: 'باز کردن منوی مدیریت' }).click();
      await expect(
        page.getByRole('dialog').getByRole('link', { name: 'تنظیمات حساب', exact: true }),
      ).toBeVisible();
      await page
        .getByRole('dialog')
        .getByRole('link', { name: 'تنظیمات حساب', exact: true })
        .click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await goto(`/admin/products/${product.id}/edit`);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('tab')).toHaveCount(3);
  await page.screenshot({ path: '/tmp/behjati-admin-product-editor-mobile.png', fullPage: true });
  await goto('/admin/settings');
  const newPassword = randomBytes(24).toString('base64url');
  await page.getByLabel('رمز فعلی', { exact: true }).fill('wrong-password');
  await page.getByLabel('رمز جدید', { exact: true }).fill(newPassword);
  await page.getByLabel('تکرار رمز جدید', { exact: true }).fill(newPassword);
  await page.getByRole('button', { name: 'تغییر رمز و خروج از نشست‌ها' }).click();
  await expect(page.locator('.ant-alert-error')).toContainText('رمز فعلی نادرست است.');
  await page.getByLabel('رمز فعلی', { exact: true }).fill(admin.password);
  await page.getByRole('button', { name: 'تغییر رمز و خروج از نشست‌ها' }).click();
  await expect(page).toHaveURL(adminOrigin + '/login');
  assert.equal(
    (
      await adminGql(
        passwordMutation,
        { input: { currentPassword: admin.password, newPassword } },
        second.cookies,
      )
    ).errors?.[0]?.extensions?.code,
    'UNAUTHENTICATED',
  );
  assert.equal(
    (await adminGql(adminQueries.refresh, {}, second.cookies)).errors?.[0]?.extensions?.code,
    'UNAUTHENTICATED',
  );
  assert.equal((await loginAdmin(admin)).errors?.[0]?.extensions?.code, 'INVALID_CREDENTIALS');
  assert.equal((await loginAdmin({ ...admin, password: newPassword })).errors, undefined);
  assert.equal((await adminGql(adminQueries.me, {}, unrelated.cookies)).data.adminMe.id, other.id);
  assert.equal(await db.adminSession.count({ where: { adminId: admin.id, revokedAt: null } }), 1);
  assert.deepEqual(errors, []);
  console.log(
    'Admin upgrade verified: reference layout at 320–1536px, navigation/search, label persistence and concurrent edit conflicts, immutable order addresses, print/PDF isolation, password confirmation and revocation of all old admin sessions; other admin unaffected. Temporary fixtures removed.',
  );
} finally {
  await browser?.close();
  await cleanupAdmin();
}
