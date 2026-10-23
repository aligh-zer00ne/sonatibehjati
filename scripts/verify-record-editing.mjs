import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import { startAPI, db, adminOrigin, errorCode, phone } from './auth-harness.mjs';
import {
  createAdmin,
  loginAdmin,
  createCustomer,
  createOrderFixture,
  adminGql,
  startAdmin,
  cleanupAdmin,
  admins,
  products,
} from './admin-harness.mjs';
const customerRead =
  'query($id:ID!){adminUser(id:$id){id editRevision phone firstName lastName email defaultAddress{id title recipientName recipientPhone province city postalAddress postalCode latitude longitude isDefault}}}';
const customerEdit =
  'mutation($input:AdminCustomerEditInput!){editAdminCustomer(input:$input){id editRevision phone firstName defaultAddress{postalAddress latitude longitude}}}';
const edit =
  'mutation($input:AdminManualOrderEditInput!){editAdminManualOrder(input:$input){id updatedAt total offlinePaidAmount items{productId productTitle productWeight quantity unitPrice} address{recipientName postalAddress}}}';
const good = (r) => {
  assert.equal(r.errors, undefined, JSON.stringify(r.errors));
  return r.data;
};
let browser,
  ownedAdminIds = [];
try {
  await startAPI();
  await startAdmin();
  const owner = await createAdmin(),
    session = await loginAdmin(owner);
  ownedAdminIds.push(owner.id);
  const customer = await createCustomer(),
    other = await createCustomer();
  const category = await db.category.findFirstOrThrow();
  const product = await db.product.create({
    data: {
      title: 'کالای اصلاح فاکتور',
      slug: 'record-edit-' + randomUUID(),
      categoryId: category.id,
      price: 20000,
      weight: '۵۰۰ گرم',
      shippingWeightGrams: 500,
      shortDescription: '',
      description: '',
      isActive: true,
    },
  });
  products.add(product.id);
  const historic = await createOrderFixture(customer, product, { status: 'PROCESSING' });
  const snapshot = await db.order.findUniqueOrThrow({
    where: { id: historic.id },
    include: { items: true },
  });
  const old = good(
    await adminGql(customerRead, { id: customer.user.id }, session.cookies),
  ).adminUser;
  const oldSession = await db.userSession.create({
    data: {
      id: randomUUID(),
      userId: customer.user.id,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });
  const change = {
    id: old.id,
    expectedRevision: old.editRevision,
    requestId: randomUUID(),
    phone: phone(),
    firstName: 'مشتری اصلاح‌شده',
    lastName: 'آزمون',
    email: '',
    address: {
      title: old.defaultAddress.title,
      recipientName: 'گیرنده اصلاح‌شده',
      recipientPhone: old.phone,
      province: 'یزد',
      city: 'اردکان',
      postalCode: '1234567890',
      postalAddress: 'نشانی اصلاح شده',
      isDefault: true,
      latitude: 32.31,
      longitude: 54.01,
    },
  };
  errorCode(await adminGql(customerEdit, { input: change }), 'UNAUTHENTICATED');
  const limited = await db.admin.create({
    data: {
      email: `edits-${randomUUID()}@example.test`,
      passwordHash: owner.passwordHash,
      role: 'STAFF',
      permissions: ['PRODUCTS'],
    },
  });
  admins.push(limited);
  ownedAdminIds.push(limited.id);
  const limitedSession = await loginAdmin({ ...limited, password: owner.password });
  errorCode(await adminGql(customerEdit, { input: change }, limitedSession.cookies), 'FORBIDDEN');
  errorCode(
    await adminGql(
      customerEdit,
      { input: change },
      session.cookies,
      '192.0.2.1',
      'https://foreign.test',
    ),
    'FORBIDDEN',
  );
  const updated = good(
    await adminGql(customerEdit, { input: change }, session.cookies),
  ).editAdminCustomer;
  assert.equal(updated.phone, change.phone);
  assert.equal(updated.defaultAddress.latitude, null);
  assert.equal(updated.defaultAddress.longitude, null);
  assert.ok((await db.userSession.findUniqueOrThrow({ where: { id: oldSession.id } })).revokedAt);
  good(await adminGql(customerEdit, { input: change }, session.cookies));
  assert.equal(await db.adminRecordChange.count({ where: { entityId: old.id } }), 1);
  errorCode(
    await adminGql(
      customerEdit,
      { input: { ...change, requestId: randomUUID(), firstName: 'تعارض' } },
      session.cookies,
    ),
    'REQUEST_CONFLICT',
  );
  const latest = good(
    await adminGql(customerRead, { id: customer.user.id }, session.cookies),
  ).adminUser;
  errorCode(
    await adminGql(
      customerEdit,
      {
        input: {
          ...change,
          requestId: randomUUID(),
          expectedRevision: latest.editRevision,
          phone: other.user.phone,
        },
      },
      session.cookies,
    ),
    'BAD_USER_INPUT',
  );
  assert.equal((await db.user.findUniqueOrThrow({ where: { id: old.id } })).phone, change.phone);
  await db.address.update({
    where: { id: customer.address.id },
    data: { postalAddress: 'نشانی اصلاح بیرونی' },
  });
  errorCode(
    await adminGql(
      customerEdit,
      { input: { ...change, requestId: randomUUID(), expectedRevision: latest.editRevision } },
      session.cookies,
    ),
    'REQUEST_CONFLICT',
  );
  assert.deepEqual(
    await db.order.findUniqueOrThrow({ where: { id: historic.id }, include: { items: true } }),
    snapshot,
    'Customer edits do not rewrite historical orders',
  );
  // A real manual sale and receipt, then a correction below the amount already received.
  const created = good(
    await adminGql(
      'mutation($input:AdminManualOrderInput!){createAdminManualOrder(input:$input){id updatedAt total offlinePaidAmount}}',
      {
        input: {
          customerId: old.id,
          salesChannel: 'IN_PERSON',
          pickup: true,
          shippingMethod: 'POST',
          manualShippingCost: 0,
          items: [{ productId: product.id, quantity: 2, unitPrice: 10000 }],
          receivedAmount: 10000,
          paymentMethod: 'POS',
          expectedTotal: 20000,
          requestId: randomUUID(),
        },
      },
      session.cookies,
    ),
  ).createAdminManualOrder;
  assert.equal(created.offlinePaidAmount, 10000);
  const beforeLedger = await db.customerAccountEntry.findMany({ where: { userId: old.id } });
  const correction = {
    orderId: created.id,
    expectedUpdatedAt: created.updatedAt,
    requestId: randomUUID(),
    customerId: old.id,
    salesChannel: 'IN_PERSON',
    pickup: true,
    shippingMethod: 'POST',
    manualShippingCost: 0,
    items: [{ productId: product.id, quantity: 1, unitPrice: 2500 }],
    expectedTotal: 2500,
  };
  errorCode(await adminGql(edit, { input: correction }, limitedSession.cookies), 'FORBIDDEN');
  errorCode(
    await adminGql(
      edit,
      {
        input: {
          ...correction,
          orderId: historic.id,
          expectedUpdatedAt: historic.updatedAt.toISOString(),
        },
      },
      session.cookies,
    ),
    'BAD_USER_INPUT',
  );
  errorCode(
    await adminGql(edit, { input: { ...correction, customerId: other.user.id } }, session.cookies),
    'BAD_USER_INPUT',
  );
  const corrected = good(
    await adminGql(edit, { input: correction }, session.cookies),
  ).editAdminManualOrder;
  assert.equal(corrected.total, 2500);
  assert.equal(corrected.offlinePaidAmount, 2500);
  const ledger = await db.customerAccountEntry.findMany({ where: { userId: old.id } });
  assert.equal(ledger.length, beforeLedger.length);
  assert.equal(ledger[0].amount, 10000);
  assert.equal(ledger[0].remaining, 7500);
  const allocations = await db.offlinePayment.findMany({
    where: { orderId: created.id, voided: false },
  });
  assert.equal(
    allocations.reduce((s, p) => s + p.amount, 0),
    2500,
  );
  assert.ok(await db.offlinePayment.count({ where: { orderId: created.id, voided: true } }));
  good(await adminGql(edit, { input: correction }, session.cookies));
  assert.equal(await db.adminRecordChange.count({ where: { entityId: created.id } }), 1);
  errorCode(
    await adminGql(
      edit,
      {
        input: {
          ...correction,
          requestId: randomUUID(),
          expectedTotal: 3000,
          items: [{ productId: product.id, quantity: 1, unitPrice: 3000 }],
        },
      },
      session.cookies,
    ),
    'REQUEST_CONFLICT',
  );
  // Keep an inactive historical item editable, but do not permit a new inactive item.
  const activeBefore = product.isActive;
  await db.product.update({ where: { id: product.id }, data: { isActive: false } });
  try {
    const quote = good(
      await adminGql(
        'query($input:AdminManualQuoteInput!,$id:ID){adminManualQuote(input:$input,orderId:$id){total items{title}}}',
        {
          id: created.id,
          input: {
            items: correction.items,
            pickup: true,
            shippingMethod: 'POST',
            manualShippingCost: 0,
          },
        },
        session.cookies,
      ),
    ).adminManualQuote;
    assert.equal(quote.total, 2500);
  } finally {
    await db.product.update({
      where: { id: product.id },
      data: { isActive: activeBefore, updatedAt: product.updatedAt },
    });
  }
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(adminOrigin + '/login');
  await page.getByLabel('ایمیل مدیر', { exact: true }).fill(owner.email);
  await page.getByLabel('رمز ورود', { exact: true }).fill(owner.password);
  await page.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(page).toHaveURL(adminOrigin + '/admin');
  await page.goto(adminOrigin + '/admin/users?search=' + change.phone);
  await page.getByRole('button', { name: /ویرایش مشتری/ }).click();
  const customerDialog = page.getByRole('dialog', { name: 'ویرایش مشتری', exact: true });
  await expect(customerDialog).toBeVisible();
  await customerDialog.getByLabel('نام', { exact: true }).fill('نام نهایی مشتری');
  await customerDialog.getByRole('button', { name: 'ذخیره اصلاحات مشتری', exact: true }).click();
  await expect(customerDialog).toBeHidden();
  await expect(page.getByRole('button', { name: /ویرایش مشتری/ })).toBeFocused();
  assert.equal(
    (await db.user.findUniqueOrThrow({ where: { id: old.id } })).firstName,
    'نام نهایی مشتری',
  );
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('button', { name: /ویرایش مشتری/ }).click();
    await expect(customerDialog).toBeVisible();
    await page.waitForTimeout(300);
    const box = await customerDialog.boundingBox();
    assert.ok(box.x >= -1 && box.x + box.width <= width + 1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    if (width === 390) await page.screenshot({ path: '/tmp/behjati-customer-edit-mobile.png' });
    await page.keyboard.press('Escape');
    await expect(customerDialog).toBeHidden();
  }
  let dropped = false;
  await page.route('**/api/admin', async (route) => {
    const body = route.request().postDataJSON();
    if (body.query.includes('mutation EditAdminManualOrder') && !dropped) {
      dropped = true;
      const response = await route.fetch();
      assert.equal((await response.json()).errors, undefined);
      return route.abort('failed');
    }
    return route.continue();
  });
  await page.goto(adminOrigin + '/admin/orders/manual');
  const card = page.locator(`[data-order-id="${created.id}"]`);
  await card.getByRole('button', { name: /ویرایش سفارش/ }).click();
  const invoice = page.getByRole('dialog', { name: /ویرایش فاکتور سفارش/ });
  await expect(invoice).toBeVisible();
  const qty = invoice.getByRole('spinbutton', { name: new RegExp('تعداد ' + product.title) });
  await qty.fill('2');
  await expect(
    invoice.getByRole('button', { name: 'ذخیره اصلاحات فاکتور', exact: true }),
  ).toBeEnabled();
  await invoice.getByRole('button', { name: 'ذخیره اصلاحات فاکتور', exact: true }).click();
  const retry = invoice.getByRole('button', {
    name: 'بررسی و تلاش دوباره برای اصلاح فاکتور',
    exact: true,
  });
  await expect(retry).toBeEnabled();
  await retry.click();
  await expect(invoice).toBeHidden();
  assert.equal(await db.adminRecordChange.count({ where: { entityId: created.id } }), 2);
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: created.id } })).total, 5000);
  await expect(card).toContainText('۵۰٬۰۰۰');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await card.getByRole('button', { name: /ویرایش سفارش/ }).click();
    await expect(invoice).toBeVisible();
    await page.waitForTimeout(300);
    const box = await invoice.boundingBox();
    assert.ok(box.x >= -1 && box.x + box.width <= width + 1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    if (width === 1440) await page.screenshot({ path: '/tmp/behjati-invoice-edit-desktop.png' });
    await page.keyboard.press('Escape');
    await expect(invoice).toBeHidden();
  }
  assert.deepEqual(errors, []);
  console.info(
    'Record editing passes: customer phone/address CAS, collision/session revocation/history preservation; audited manual correction, received-money preservation and excess credit, no customer transfer of paid invoice, replay/conflict/permissions, inactive existing items, real customer/card edits and 320–1440px bounds.',
  );
} finally {
  await browser?.close();
  await db.adminRecordChange.deleteMany({ where: { adminId: { in: ownedAdminIds } } });
  await cleanupAdmin();
}
