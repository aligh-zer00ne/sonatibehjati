import assert from 'node:assert/strict';
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
const fields = 'name phone address postalCode isConfigured updatedAt';
const query = `{adminStoreInformation{${fields}}}`;
const save = `mutation($input:StoreInformationInput!,$expectedUpdatedAt:String){saveAdminStoreInformation(input:$input,expectedUpdatedAt:$expectedUpdatedAt){${fields}}}`;
let browser, page, backup;
try {
  assert.ok(
    ['localhost', '127.0.0.1', '[::1]'].includes(new URL(process.env.DATABASE_URL).hostname),
    'Only the local verification database',
  );
  backup = await db.storeInformation.findUnique({ where: { id: 'store' } });
  await startAPI();
  await startAdmin();
  const owner = await createAdmin(),
    session = await loginAdmin(owner);
  const manager = await createAdmin(),
    printer = await createAdmin();
  await db.admin.update({
    where: { id: manager.id },
    data: { role: 'STAFF', permissions: ['STORE_INFO'] },
  });
  await db.admin.update({
    where: { id: printer.id },
    data: { role: 'STAFF', permissions: ['ORDERS'] },
  });
  const managerSession = await loginAdmin(manager),
    printerSession = await loginAdmin(printer);
  assert.equal((await adminGql(query)).errors[0].extensions.code, 'UNAUTHENTICATED');
  assert.equal(
    (await adminGql(query, {}, printerSession.cookies)).errors[0].extensions.code,
    'FORBIDDEN',
  );
  assert.ok((await adminGql(query, {}, managerSession.cookies)).data.adminStoreInformation);
  await db.storeInformation.deleteMany({ where: { id: 'store' } });
  const empty = (await adminGql(query, {}, session.cookies)).data.adminStoreInformation;
  assert.equal(empty.updatedAt, null);
  assert.equal(empty.isConfigured, false);
  assert.equal(await db.storeInformation.count(), 0, 'Reading defaults has no side effects');
  const input = {
    name: 'سنتی بهجتی STORE-INFO',
    phone: '۰۹۱۳۱۵۶۴۸۷۶',
    address: 'اردکان، خیابان آزمون فروشگاه، پلاک ۱۲ STORE-ADDRESS',
    postalCode: '۸۹۵۱۸۱۲۳۴۵',
  };
  for (const patch of [
    { postalCode: '123' },
    { phone: '-------' },
    { address: '' },
    { name: ' ' },
  ]) {
    const invalid = await adminGql(
      save,
      { input: { ...input, ...patch }, expectedUpdatedAt: null },
      session.cookies,
    );
    assert.equal(invalid.errors[0].extensions.code, 'BAD_USER_INPUT');
  }
  assert.equal(
    (await adminGql(save, { input }, printerSession.cookies)).errors[0].extensions.code,
    'FORBIDDEN',
  );
  assert.equal(
    (await adminGql(save, { input }, session.cookies, '192.0.2.1', 'https://invalid.example'))
      .errors[0].extensions.code,
    'FORBIDDEN',
  );
  const concurrent = await Promise.all([
    adminGql(save, { input, expectedUpdatedAt: null }, session.cookies),
    adminGql(
      save,
      { input: { ...input, name: 'رقیب هم‌زمان' }, expectedUpdatedAt: null },
      managerSession.cookies,
    ),
  ]);
  assert.equal(
    concurrent.filter((r) => r.data?.saveAdminStoreInformation).length,
    1,
    'Only one first save wins',
  );
  assert.equal(concurrent.find((r) => r.errors)?.errors[0].extensions.code, 'REQUEST_CONFLICT');
  let current = (await adminGql(query, {}, session.cookies)).data.adminStoreInformation;
  const normalized = await adminGql(
    save,
    { input, expectedUpdatedAt: current.updatedAt },
    managerSession.cookies,
  );
  assert.equal(normalized.errors, undefined);
  current = normalized.data.saveAdminStoreInformation;
  assert.equal(current.phone, '09131564876');
  assert.equal(current.postalCode, '8951812345');
  assert.equal(current.isConfigured, true);
  const customer = await createCustomer(),
    product = await db.product.findFirstOrThrow({ where: { isActive: true } }),
    order = await createOrderFixture(customer, product);
  const orderSnapshot = await db.order.findUniqueOrThrow({
    where: { id: order.id },
    include: { items: true },
  });
  const printable = await adminGql(
    `query($id:ID!){adminOrder(id:$id){storeInformation{${fields}}}}`,
    { id: order.id },
    printerSession.cookies,
  );
  assert.deepEqual(
    printable.data.adminOrder.storeInformation,
    current,
    'Order staff can print without editing management settings',
  );
  assert.equal(
    (
      await adminGql(
        'query($id:ID!){adminOrder(id:$id){id}}',
        { id: order.id },
        managerSession.cookies,
      )
    ).errors[0].extensions.code,
    'FORBIDDEN',
  );
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const cookies = (cookie) =>
    cookie.split('; ').map((v) => {
      const i = v.indexOf('=');
      return { name: v.slice(0, i), value: v.slice(i + 1), url: adminOrigin };
    });
  await context.addCookies(cookies(session.cookies));
  page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(adminOrigin + '/admin/sections/settings');
  await page.getByRole('link', { name: /اطلاعات فروشگاه/ }).click();
  await expect(page).toHaveURL(/\/admin\/store-information$/);
  await expect(page.getByLabel('نام فروشگاه', { exact: true })).toHaveValue(input.name);
  await page.getByLabel('نام فروشگاه', { exact: true }).fill('سنتی بهجتی نسخه جدید STORE-NEW');
  await page.getByLabel('کد پستی فروشگاه', { exact: true }).fill('123');
  await page.getByRole('button', { name: 'ذخیره اطلاعات فروشگاه', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('کد پستی باید ده رقم باشد');
  assert.equal(
    (
      await db.storeInformation.findUniqueOrThrow({ where: { id: 'store' } })
    ).updatedAt.toISOString(),
    current.updatedAt,
  );
  await page.getByLabel('کد پستی فروشگاه', { exact: true }).fill('۸۹۵۱۸۱۲۳۴۵');
  await expect(page.locator('[data-store-preview]')).toContainText('STORE-NEW');
  // External concurrent edit must preserve this browser's draft and report conflict.
  const other = await adminGql(
    save,
    { input: { ...input, name: 'تغییر مدیر دیگر' }, expectedUpdatedAt: current.updatedAt },
    managerSession.cookies,
  );
  assert.equal(other.errors, undefined);
  await page.getByRole('button', { name: 'ذخیره اطلاعات فروشگاه', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('مدیر دیگری');
  await expect(page.getByLabel('نام فروشگاه', { exact: true })).toHaveValue(/STORE-NEW/);
  await page.getByRole('button', { name: 'دریافت اطلاعات جدید', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'دریافت اطلاعات جدید', exact: true })
    .click();
  await expect(page.getByLabel('نام فروشگاه', { exact: true })).toHaveValue('تغییر مدیر دیگر');
  await page.getByLabel('نام فروشگاه', { exact: true }).fill('سنتی بهجتی STORE-NEW');
  await page
    .getByLabel('نشانی کامل فروشگاه', { exact: true })
    .fill('اردکان، خیابان جدید فروشگاه، پلاک ۲۴ STORE-NEW-ADDRESS');
  await page.getByRole('button', { name: 'ذخیره اطلاعات فروشگاه', exact: true }).click();
  await expect(
    page.getByText('اطلاعات فروشگاه ذخیره شد و در فاکتور و لیبل استفاده می‌شود.', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('نام فروشگاه', { exact: true })).toHaveValue('سنتی بهجتی STORE-NEW');
  await expect(page.getByLabel('کد پستی فروشگاه', { exact: true })).toHaveValue('8951812345');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page
        .locator('form')
        .evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft) >= 20),
      'Form retains readable padding',
    );
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `Settings fit ${width}px`,
    );
    if (width === 390) {
      await expect(page.locator('[data-store-preview]')).toBeHidden();
      await page.getByRole('button', { name: 'پیش‌نمایش اطلاعات روی چاپ', exact: true }).click();
      await expect(page.locator('[data-store-preview]')).toBeVisible();
      await page.getByRole('button', { name: 'بستن پیش‌نمایش چاپ', exact: true }).click();
    }
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `/tmp/behjati-store-information-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      });
  }
  await page.goto(`${adminOrigin}/admin/orders/${order.id}`);
  await page.getByRole('button', { name: 'لیبل پستی / چاپ', exact: true }).click();
  const label = page.locator('[data-label-workspace] [data-label-sheet]');
  await expect(label).toContainText('STORE-NEW-ADDRESS');
  await expect(label).toContainText(customer.snapshot.recipientName);
  await expect(page.locator('[data-label-workspace] input')).toHaveCount(0);
  await page.getByRole('button', { name: 'بستن پیش‌نمایش چاپ', exact: true }).click();
  await page.getByRole('button', { name: 'چاپ فاکتور / PDF', exact: true }).click();
  for (const format of ['فاکتور A4', 'فاکتور A5', 'رسید ۸ سانتی']) {
    await page.getByRole('button', { name: format, exact: true }).click();
    const seller = page.locator('[data-invoice-workspace] [data-invoice-seller]');
    await expect(seller).toContainText('STORE-NEW');
    await expect(seller).toContainText('STORE-NEW-ADDRESS');
    await expect(seller).toContainText('۸۹۵۱۸۱۲۳۴۵');
  }
  await page.getByRole('button', { name: 'بستن پیش‌نمایش چاپ', exact: true }).click();
  assert.deepEqual(
    await db.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true } }),
    orderSnapshot,
    'Store settings never change invoices or recipient snapshots',
  );
  const staffContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await staffContext.addCookies(cookies(managerSession.cookies));
  const staffPage = await staffContext.newPage();
  await staffPage.goto(adminOrigin + '/admin/store-information');
  await expect(
    staffPage.getByRole('heading', { name: 'اطلاعات فروشگاه', exact: true }),
  ).toBeVisible();
  await staffPage.goto(adminOrigin + '/admin/products');
  await expect(staffPage).toHaveURL(/\/admin\/store-information$/);
  await staffContext.close();
  const printerContext = await browser.newContext();
  await printerContext.addCookies(cookies(printerSession.cookies));
  const printerPage = await printerContext.newPage();
  await printerPage.goto(adminOrigin + '/admin/store-information');
  await expect(printerPage).toHaveURL(/\/admin\/orders$/);
  await printerContext.close();
  assert.deepEqual(errors, []);
  console.log(
    'Store information passed: first-save concurrency, normalized data, validation/origin/permissions, persistent management page and live preview, stale-update draft retention, owner/staff navigation, 320–1440px fit, automatic order-label sender and unchanged invoices. Original settings restored; no SMS/bank call.',
  );
} catch (e) {
  await page?.screenshot({ path: '/tmp/behjati-store-information-failure.png', fullPage: true });
  throw e;
} finally {
  await browser?.close();
  if (backup !== undefined) {
    if (backup)
      await db.storeInformation.upsert({
        where: { id: 'store' },
        create: backup,
        update: {
          data: backup.data,
          isConfigured: backup.isConfigured,
          updatedAt: backup.updatedAt,
        },
      });
    else await db.storeInformation.deleteMany({ where: { id: 'store' } });
  }
  await cleanupAdmin();
}
