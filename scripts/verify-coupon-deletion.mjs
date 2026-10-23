import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import { startAPI, db, adminOrigin, errorCode } from './auth-harness.mjs';
import {
  createAdmin,
  loginAdmin,
  createCustomer,
  createOrderFixture,
  adminGql,
  startAdmin,
  cleanupAdmin,
  admins,
} from './admin-harness.mjs';
let browser;
const ids = [];
const deletion =
  'mutation($id:ID!,$version:String!){deleteAdminCoupon(id:$id,expectedUpdatedAt:$version)}';
try {
  await startAPI();
  await startAdmin();
  const owner = await createAdmin(),
    session = await loginAdmin(owner),
    customer = await createCustomer();
  const product = await db.product.findFirstOrThrow();
  const input = {
    type: 'PERCENT',
    value: 10,
    minOrderAmount: 0,
    startsAt: new Date(Date.now() - 60000),
    expiresAt: new Date(Date.now() + 86400000),
    isActive: true,
  };
  const unused = await db.discountCode.create({
    data: { ...input, code: 'DELETE-' + randomUUID().slice(0, 8) },
  });
  ids.push(unused.id);
  const used = await db.discountCode.create({
    data: { ...input, code: 'USED-' + randomUUID().slice(0, 8), usageCount: 1 },
  });
  ids.push(used.id);
  const order = await createOrderFixture(customer, product);
  await db.order.update({ where: { id: order.id }, data: { discountCodeId: used.id } });
  const original = await db.order.findUniqueOrThrow({ where: { id: order.id } });
  const staff = await db.admin.create({
    data: {
      email: `coupon-${randomUUID()}@example.test`,
      passwordHash: owner.passwordHash,
      role: 'STAFF',
      permissions: ['PRODUCTS'],
    },
  });
  admins.push(staff);
  const staffSession = await loginAdmin({ ...staff, password: owner.password });
  const variables = { id: unused.id, version: unused.updatedAt.toISOString() };
  errorCode(await adminGql(deletion, variables), 'UNAUTHENTICATED');
  errorCode(await adminGql(deletion, variables, staffSession.cookies), 'FORBIDDEN');
  errorCode(
    await adminGql(deletion, variables, session.cookies, '192.0.2.1', 'https://foreign.test'),
    'FORBIDDEN',
  );
  errorCode(
    await adminGql(deletion, { ...variables, version: new Date(0).toISOString() }, session.cookies),
    'REQUEST_CONFLICT',
  );
  assert.equal((await adminGql(deletion, variables, session.cookies)).data.deleteAdminCoupon, true);
  assert.equal((await adminGql(deletion, variables, session.cookies)).data.deleteAdminCoupon, true);
  const gone = await db.discountCode.findUniqueOrThrow({ where: { id: unused.id } });
  assert.ok(gone.deletedAt);
  assert.equal(gone.isActive, false);
  const listed = await adminGql('{adminCoupons{id}}', {}, session.cookies);
  assert.ok(!listed.data.adminCoupons.some((c) => c.id === unused.id));
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(adminOrigin + '/login');
  await page.getByLabel('ایمیل مدیر', { exact: true }).fill(owner.email);
  await page.getByLabel('رمز ورود', { exact: true }).fill(owner.password);
  await page.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(page).toHaveURL(adminOrigin + '/admin');
  await page.goto(adminOrigin + '/admin/coupons');
  await page.getByRole('button', { name: `حذف کد ${used.code}`, exact: true }).click();
  await page.getByRole('button', { name: 'انصراف', exact: true }).click();
  await expect(
    page.getByRole('button', { name: `حذف کد ${used.code}`, exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: `حذف کد ${used.code}`, exact: true }).click();
  await page.getByRole('button', { name: 'حذف کد', exact: true }).click();
  await expect(page.getByRole('button', { name: `حذف کد ${used.code}`, exact: true })).toHaveCount(
    0,
  );
  const archived = await db.discountCode.findUniqueOrThrow({ where: { id: used.id } });
  assert.ok(archived.deletedAt);
  assert.equal(archived.isActive, false);
  assert.equal(archived.usageCount, 1);
  assert.deepEqual(await db.order.findUniqueOrThrow({ where: { id: order.id } }), original);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  console.info(
    'Coupon deletion passes: origin/permissions/CAS, idempotent retry, actual mobile delete/cancel, hidden inactive code, preserved historical discount/reference/usage.',
  );
} finally {
  await browser?.close();
  await db.order.updateMany({
    where: { discountCodeId: { in: ids } },
    data: { discountCodeId: null },
  });
  await db.discountCode.deleteMany({ where: { id: { in: ids } } });
  await cleanupAdmin();
}
