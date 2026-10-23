import assert from 'node:assert/strict';
import { bank } from './payment-harness.mjs';
import { chromium, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { startAPI, db, adminOrigin, errorCode } from './auth-harness.mjs';
import {
  createAdmin,
  loginAdmin,
  createCustomer,
  createOrderFixture,
  startAdmin,
  cleanupAdmin,
  admins,
} from './admin-harness.mjs';
const read = '{adminMessageTemplates{items{id kind title body} updatedAt storeName}}';
const save =
  'mutation($items:[MessageTemplateInput!]!,$version:String){saveAdminMessageTemplates(items:$items,expectedUpdatedAt:$version){items{id kind title body} updatedAt}}';
const shipment =
  'mutation($input:AdminShipmentInput!){saveAdminShipment(input:$input){id status updatedAt shippingMethod shippingLabel{trackingNumber carrier} statusEvents{id fromStatus toStatus}}}';
import { adminGql } from './admin-harness.mjs';
const good = (r) => {
  assert.equal(r.errors, undefined, JSON.stringify(r.errors));
  return r.data;
};
let browser, backup;
try {
  await startAPI();
  await startAdmin();
  backup = await db.messageTemplateSettings.findUnique({ where: { id: 'store' } });
  const owner = await createAdmin(),
    session = await loginAdmin(owner),
    customer = await createCustomer();
  const product = await db.product.findFirstOrThrow({ where: { isActive: true } });
  const web = await createOrderFixture(customer, product, { status: 'PROCESSING' });
  await db.order.update({
    where: { id: web.id },
    data: { paidAt: new Date(), shippingMethod: 'POST' },
  });
  const insta = await createOrderFixture(customer, product, { status: 'CREATED' });
  await db.order.update({
    where: { id: insta.id },
    data: { salesChannel: 'INSTAGRAM', shippingMethod: 'POST' },
  });
  const person = await createOrderFixture(customer, product, { status: 'DELIVERED' });
  await db.order.update({ where: { id: person.id }, data: { salesChannel: 'IN_PERSON' } });
  const limited = await db.admin.create({
    data: {
      email: `messages-${randomUUID()}@example.test`,
      passwordHash: owner.passwordHash,
      role: 'STAFF',
      permissions: ['ORDERS'],
    },
  });
  admins.push(limited);
  const staff = await loginAdmin({ ...limited, password: owner.password });
  errorCode(await adminGql(read), 'UNAUTHENTICATED');
  const initial = good(await adminGql(read, {}, session.cookies)).adminMessageTemplates;
  good(await adminGql(read, {}, staff.cookies));
  errorCode(
    await adminGql(save, { items: initial.items, version: initial.updatedAt }, staff.cookies),
    'FORBIDDEN',
  );
  errorCode(
    await adminGql(
      save,
      { items: initial.items, version: initial.updatedAt },
      session.cookies,
      '192.0.2.1',
      'https://foreign.test',
    ),
    'FORBIDDEN',
  );
  const custom = [
    {
      id: randomUUID(),
      kind: 'PAYMENT',
      title: 'پرداخت آزمون',
      body: '{نام_مشتری}؛ مبلغ {مبلغ}\n{لینک_پرداخت}\n{نام_فروشگاه}',
    },
    {
      id: randomUUID(),
      kind: 'SHIPPING',
      title: 'رهگیری آزمون',
      body: '{نام_مشتری}، سفارش {شماره_سفارش} با {روش_ارسال} ارسال شد.\nرهگیری: {کد_رهگیری}',
    },
  ];
  custom.push({
    id: randomUUID(),
    kind: 'SHIPPING',
    title: 'پیگیری کوتاه',
    body: 'سفارش {شماره_سفارش}، {روش_ارسال}؛ رهگیری {کد_رهگیری}',
  });
  const saved = good(
    await adminGql(save, { items: custom, version: initial.updatedAt }, session.cookies),
  ).saveAdminMessageTemplates;
  assert.equal(
    good(await adminGql(save, { items: custom, version: initial.updatedAt }, session.cookies))
      .saveAdminMessageTemplates.updatedAt,
    saved.updatedAt,
  );
  errorCode(
    await adminGql(
      save,
      { items: [{ ...custom[0], title: 'تعارض' }, custom[1]], version: initial.updatedAt },
      session.cookies,
    ),
    'REQUEST_CONFLICT',
  );
  errorCode(
    await adminGql(
      save,
      { items: [{ ...custom[0], body: 'بدون لینک' }], version: saved.updatedAt },
      session.cookies,
    ),
    'BAD_USER_INPUT',
  );
  const unauthorized = await db.admin.create({
    data: {
      email: `messages-only-${randomUUID()}@example.test`,
      passwordHash: owner.passwordHash,
      role: 'STAFF',
      permissions: ['MESSAGES'],
    },
  });
  admins.push(unauthorized);
  const messagesOnly = await loginAdmin({ ...unauthorized, password: owner.password });
  const before = await db.order.findUniqueOrThrow({ where: { id: insta.id } });
  const input = {
    orderId: insta.id,
    shippingMethod: 'TIPAX',
    trackingNumber: '۱۲۳۴۵۶۷۸۹',
    expectedUpdatedAt: before.updatedAt.toISOString(),
  };
  errorCode(await adminGql(shipment, { input }, messagesOnly.cookies), 'FORBIDDEN');
  errorCode(
    await adminGql(shipment, { input }, session.cookies, '192.0.2.1', 'https://foreign.test'),
    'FORBIDDEN',
  );
  const changed = good(await adminGql(shipment, { input }, session.cookies)).saveAdminShipment;
  assert.equal(changed.status, 'SHIPPED');
  assert.equal(changed.shippingLabel.trackingNumber, '123456789');
  assert.equal(changed.shippingLabel.carrier, 'تیپاکس');
  assert.equal(changed.statusEvents.length, 1);
  const after = await db.order.findUniqueOrThrow({ where: { id: insta.id } });
  for (const key of ['total', 'subtotal', 'discount', 'shipping', 'offlinePaidAmount', 'paidAt'])
    assert.deepEqual(after[key], before[key]);
  assert.deepEqual(after.addressSnapshot, before.addressSnapshot);
  good(await adminGql(shipment, { input }, session.cookies));
  assert.equal(await db.orderStatusEvent.count({ where: { orderId: insta.id } }), 1);
  errorCode(
    await adminGql(shipment, { input: { ...input, trackingNumber: '999' } }, session.cookies),
    'REQUEST_CONFLICT',
  );
  errorCode(
    await adminGql(
      shipment,
      {
        input: {
          ...input,
          orderId: person.id,
          expectedUpdatedAt: (
            await db.order.findUniqueOrThrow({ where: { id: person.id } })
          ).updatedAt.toISOString(),
        },
      },
      session.cookies,
    ),
    'BAD_USER_INPUT',
  );
  const current = await db.order.findUniqueOrThrow({
    where: { id: insta.id },
    include: { shippingLabel: true },
  });
  errorCode(
    await adminGql(
      shipment,
      {
        input: {
          ...input,
          trackingNumber: '555',
          expectedUpdatedAt: current.updatedAt.toISOString(),
          expectedLabelUpdatedAt: null,
        },
      },
      session.cookies,
    ),
    'REQUEST_CONFLICT',
  );
  errorCode(
    await adminGql(
      shipment,
      {
        input: {
          ...input,
          trackingNumber: '',
          expectedUpdatedAt: current.updatedAt.toISOString(),
          expectedLabelUpdatedAt: current.shippingLabel.updatedAt.toISOString(),
        },
      },
      session.cookies,
    ),
    'BAD_USER_INPUT',
  );
  const unpaid = await createOrderFixture(customer, product, { status: 'PENDING_PAYMENT' });
  errorCode(
    await adminGql(
      shipment,
      {
        input: {
          ...input,
          orderId: unpaid.id,
          expectedUpdatedAt: unpaid.updatedAt.toISOString(),
          trackingNumber: '999',
        },
      },
      session.cookies,
    ),
    'BAD_USER_INPUT',
  );
  assert.equal(await db.orderShippingLabel.count({ where: { orderId: unpaid.id } }), 0);
  assert.equal(
    (await db.order.findUniqueOrThrow({ where: { id: unpaid.id } })).status,
    'PENDING_PAYMENT',
  );
  const pickup = await createOrderFixture(customer, product, {
    status: 'CREATED',
    snapshot: { title: 'حضوری', recipientName: 'مشتری', recipientPhone: customer.user.phone },
  });
  const pickupOrder = await db.order.update({
    where: { id: pickup.id },
    data: { salesChannel: 'INSTAGRAM' },
  });
  errorCode(
    await adminGql(
      shipment,
      {
        input: {
          ...input,
          orderId: pickup.id,
          expectedUpdatedAt: pickupOrder.updatedAt.toISOString(),
        },
      },
      session.cookies,
    ),
    'BAD_USER_INPUT',
  );
  assert.equal(await db.orderShippingLabel.count({ where: { orderId: pickup.id } }), 0);
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data) => {
        window.__sharedCustomerMessage = data;
      },
    });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(adminOrigin + '/login');
  await page.getByLabel('ایمیل مدیر', { exact: true }).fill(owner.email);
  await page.getByLabel('رمز ورود', { exact: true }).fill(owner.password);
  await page.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(page).toHaveURL(adminOrigin + '/admin');
  await page.goto(adminOrigin + '/admin/message-templates');
  await expect(
    page
      .locator('#admin-desktop-navigation')
      .getByRole('link', { name: 'تنظیمات مدیریت', exact: true }),
  ).toHaveAttribute('aria-current', 'location');
  await page.getByLabel('عنوان قالب', { exact: true }).fill('قالب پرداخت ویرایش‌شده');
  await page.getByRole('button', { name: 'ذخیره قالب‌ها', exact: true }).click();
  await expect(page.getByText('قالب پیام‌ها ذخیره شد.', { exact: true })).toBeVisible();
  assert.equal(
    (await db.messageTemplateSettings.findUniqueOrThrow({ where: { id: 'store' } })).data[0].title,
    'قالب پرداخت ویرایش‌شده',
  );
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    if (width === 320 || width === 1440)
      await page.screenshot({
        path: `/tmp/behjati-message-templates-${width}.png`,
        fullPage: true,
      });
  }
  await page.goto(adminOrigin + '/admin/orders/' + web.id);
  await page.getByRole('combobox', { name: 'روش ارسال مرسوله' }).click();
  await page.getByText('تیپاکس', { exact: true }).last().click();
  await page.getByRole('textbox', { name: 'کد رهگیری مرسوله', exact: true }).fill('987654321');
  await page.getByRole('button', { name: 'ذخیره اطلاعات ارسال', exact: true }).click();
  await expect(page.getByRole('button', { name: 'ارسال پیام سفارش', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'ارسال پیام سفارش', exact: true }).click();
  const composer = page.getByRole('dialog', { name: 'پیام ارسال سفارش', exact: true });
  await expect(composer).toBeVisible();
  await composer.getByRole('combobox', { name: 'قالب پیام' }).click();
  await page.getByText('پیگیری کوتاه', { exact: true }).last().click();
  const text = await composer.getByRole('textbox', { name: 'متن آماده پیام' }).inputValue();
  assert.ok(text.includes('987654321') && text.includes('تیپاکس') && !text.includes('{کد_رهگیری}'));
  await composer.getByRole('button', { name: 'ارسال در پیام‌رسان', exact: true }).click();
  assert.equal(await page.evaluate(() => window.__sharedCustomerMessage.text), text);
  const sms = await composer
    .getByRole('link', { name: 'باز کردن پیامک گوشی' })
    .getAttribute('href');
  assert.ok(sms.startsWith('sms:' + customer.snapshot.recipientPhone));
  assert.equal(decodeURIComponent(sms.split('body=')[1]), text);
  await composer.getByRole('button', { name: 'کپی متن و رهگیری', exact: true }).click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), text);
  await page.screenshot({ path: '/tmp/behjati-customer-message.png' });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.waitForTimeout(350);
    const box = await composer.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
  }
  await composer.getByRole('button', { name: 'بستن پیام ارسال سفارش', exact: true }).click();
  await page.getByRole('button', { name: 'لیبل پستی / چاپ', exact: true }).click();
  await expect(page.locator('[data-label-workspace] [data-label-sheet]')).toContainText('تیپاکس');
  await expect(page.locator('[data-label-workspace] [data-label-sheet]')).toContainText(
    '987654321',
  );
  await page.goto(adminOrigin + '/admin/orders/' + person.id);
  await expect(page.getByRole('heading', { name: /جزئیات سفارش/ }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'ارسال پیام سفارش', exact: true })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'ارسال و رهگیری سفارش' })).toHaveCount(0);
  assert.deepEqual(errors, []);
  console.info(
    'Customer message templates and shipping pass: persistent CAS/permissions, exact data, atomic audited tracking, unchanged finances, phone SMS URI/copy, carrier label, no in-person messages and responsive dialogs. No SMS sent.',
  );
} finally {
  await browser?.close();
  if (backup)
    await db.messageTemplateSettings.upsert({
      where: { id: 'store' },
      create: backup,
      update: { data: backup.data, updatedAt: backup.updatedAt },
    });
  else if (backup === null) await db.messageTemplateSettings.deleteMany({ where: { id: 'store' } });
  await cleanupAdmin();
  bank.close();
}
