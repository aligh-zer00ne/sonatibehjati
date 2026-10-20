import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import { startAPI, adminOrigin, db } from './auth-harness.mjs';
import {
  createAdmin,
  createCustomer,
  createOrderFixture,
  startAdmin,
  cleanupAdmin,
  admins,
} from './admin-harness.mjs';

let browser;
try {
  await startAPI();
  await startAdmin();
  const owner = await createAdmin();
  const customer = await createCustomer();
  const product = await db.product.findFirstOrThrow();
  const order = await createOrderFixture(customer, product);
  const second = await createOrderFixture(customer, product, { status: 'DELIVERED' });
  const title = 'ارده سنتی با عنوان ثبت‌شده در زمان خرید';
  await db.orderItem.updateMany({ where: { orderId: order.id }, data: { productTitle: title } });
  await db.address.update({
    where: { id: customer.address.id },
    data: { city: 'شهر تغییرکرده پس از خرید' },
  });
  const paymentId = randomUUID();
  await db.payment.create({
    data: {
      id: paymentId,
      orderId: order.id,
      status: 'VERIFY_PENDING',
      amountRials: 2500000n,
      terminalId: 'fixture',
      callbackKey: randomUUID(),
      sessionKey: 1,
      expiresAt: new Date(Date.now() + 600000),
      rrn: '123456789',
    },
  });
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  let detailRequests = 0;
  let failDetail = false;
  let bankChecks = 0;
  await context.route('**/api/admin', async (route) => {
    const body = route.request().postDataJSON();
    if (/query AdminOrder\(/.test(body.query)) {
      detailRequests++;
      if (failDetail) {
        failDetail = false;
        return route.fulfill({
          json: {
            errors: [
              { message: 'دریافت جزئیات انجام نشد.', extensions: { code: 'SERVICE_UNAVAILABLE' } },
            ],
          },
        });
      }
    }
    if (/mutation RetryAdminPayment\(/.test(body.query)) {
      bankChecks++;
      return route.fulfill({
        json: {
          errors: [{ message: 'بانک در دسترس نیست.', extensions: { code: 'PAYMENT_UNAVAILABLE' } }],
        },
      });
    }
    await route.continue();
  });
  const login = async (email, password) => {
    await page.goto(adminOrigin + '/login');
    await page.getByLabel('ایمیل مدیر', { exact: true }).fill(email);
    await page.getByLabel('رمز ورود', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  };
  await login(owner.email, owner.password);
  await expect(page).toHaveURL(adminOrigin + '/admin');
  const listURL = adminOrigin + `/admin/orders?userId=${customer.user.id}`;
  await page.goto(listURL, { waitUntil: 'networkidle' });
  const number = new Intl.NumberFormat('fa-IR').format(order.number);
  const card = page.getByRole('article', { name: `سفارش ${number}`, exact: true });
  const toggle = card.getByRole('button', { name: `جزئیات سفارش ${number}`, exact: true });
  await expect(card).toBeVisible();
  assert.equal(detailRequests, 0, 'Details are fetched only when expanded');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page).toHaveURL(listURL);
  await expect(card.getByText(title, { exact: true })).toBeVisible();
  await card.getByRole('tab', { name: 'مشتری و ارسال', exact: true }).click();
  await expect(card.getByText('یزد، اردکان، خیابان آزمون، پلاک ۱۰', { exact: true })).toBeVisible();
  await expect(card.getByText('شهر تغییرکرده پس از خرید', { exact: true })).toHaveCount(0);
  await card.getByLabel('وضعیت جدید سفارش', { exact: true }).click();
  await page.locator('.ant-select-item-option').filter({ hasText: 'در حال آماده‌سازی' }).click();
  await card.getByRole('button', { name: 'ثبت وضعیت', exact: true }).click();
  await page.getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect(
    card.getByRole('heading', { name: `جزئیات سفارش ${number}`, exact: true }),
  ).toBeVisible();
  await expect(card.locator('.ant-tag').first()).toHaveText('در حال آماده‌سازی');
  assert.equal(
    (await db.order.findUniqueOrThrow({ where: { id: order.id } })).status,
    'PROCESSING',
  );
  await card.getByRole('tab', { name: 'تاریخچه', exact: true }).click();
  await expect(card.getByText(owner.email, { exact: true })).toBeVisible();
  assert.equal(await db.orderStatusEvent.count({ where: { orderId: order.id } }), 1);
  await card.getByRole('tab', { name: 'پرداخت‌ها', exact: true }).click();
  await expect(card.getByText('پرداخت بانک تأیید نشده است', { exact: true })).toBeVisible();
  await card.getByRole('button', { name: 'پیگیری بانک', exact: true }).click();
  await expect(page.getByText('بانک در دسترس نیست.', { exact: true })).toBeVisible();
  assert.equal(bankChecks, 1, 'Bank request intercepted; no real bank call');
  await card.getByRole('button', { name: 'چاپ فاکتور / PDF', exact: true }).click();
  const invoice = page.getByRole('dialog', { name: `فاکتور سفارش ${number}`, exact: true });
  await expect(invoice.getByRole('cell').filter({ hasText: title })).toBeVisible();
  await expect(invoice.getByRole('button', { name: 'چاپ / ذخیره PDF', exact: true })).toBeVisible();
  await invoice.locator('.ant-modal-close').click();
  await card.getByRole('button', { name: 'لیبل پستی / چاپ', exact: true }).click();
  const label = page.getByRole('dialog', { name: `لیبل پستی سفارش ${number}`, exact: true });
  await expect(label.getByLabel('نام گیرنده', { exact: true })).toHaveValue('گیرنده هنگام خرید');
  await expect(label.getByRole('button', { name: 'ذخیره لیبل سفارش', exact: true })).toBeVisible();
  await label.locator('.ant-modal-close').click();
  await page.setViewportSize({ width: 320, height: 1000 });
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'Closing an autosizing label form must not leave horizontal overflow on a smaller viewport',
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await card.getByRole('button', { name: 'بستن جزئیات سفارش', exact: true }).click();
  await expect(toggle).toBeFocused();
  await toggle.press('Space');
  await expect(card.getByText(title, { exact: true })).toBeVisible();
  const secondNumber = new Intl.NumberFormat('fa-IR').format(second.number);
  const secondCard = page.getByRole('article', { name: `سفارش ${secondNumber}`, exact: true });
  await secondCard
    .getByRole('button', { name: `جزئیات سفارش ${secondNumber}`, exact: true })
    .click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(
    secondCard.getByText('این سفارش به وضعیت نهایی رسیده است.', { exact: true }),
  ).toBeVisible();
  await toggle.click();
  await card.getByRole('tab', { name: 'محصولات', exact: true }).click();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(listURL, { waitUntil: 'networkidle' });
    await toggle.click();
    await expect(card.getByText(title, { exact: true })).toBeVisible();
    await card.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    const tabs = card.getByRole('tablist').getByRole('tab');
    await expect(tabs).toHaveCount(4);
    const cardBox = await card.boundingBox();
    for (const tab of await tabs.all()) {
      const box = await tab.boundingBox();
      assert.ok(
        box && box.x >= cardBox.x && box.x + box.width <= cardBox.x + cardBox.width,
        `All tabs fit at ${width}px`,
      );
    }
    await tabs.first().focus();
    await page.keyboard.press('ArrowLeft');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    await expect(tabs.last()).toBeFocused();
    await page.keyboard.press('Home');
    await expect(tabs.first()).toBeFocused();
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `No page overflow at ${width}`,
    );
    await expect(card.getByRole('button', { name: 'لیبل پستی / چاپ', exact: true })).toBeVisible();
    await card.screenshot({ path: `/tmp/behjati-order-card-${width}.png` });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await card.getByRole('button', { name: 'بستن جزئیات سفارش', exact: true }).click();
  failDetail = true;
  await toggle.click();
  await expect(card.getByRole('alert')).toBeVisible();
  await card.getByRole('button', { name: 'تلاش دوباره', exact: true }).click();
  await expect(card.getByText(title, { exact: true })).toBeVisible();
  await page.getByLabel('وضعیت', { exact: true }).click();
  await page.locator('.ant-select-item-option').filter({ hasText: 'تحویل‌شده' }).click();
  await expect(card).toHaveCount(0);
  await expect(secondCard).toBeVisible();
  await expect(
    secondCard.getByRole('button', { name: `جزئیات سفارش ${secondNumber}`, exact: true }),
  ).toHaveAttribute('aria-expanded', 'false');
  await page.goto(adminOrigin + `/admin/orders/${order.id}`);
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await page.goto(adminOrigin + '/admin');
  await page.getByRole('button', { name: `جزئیات سفارش ${number}`, exact: true }).click();
  await expect(page).toHaveURL(adminOrigin + '/admin');
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  const restricted = await db.admin.create({
    data: {
      email: `restricted-${randomUUID()}@example.test`,
      passwordHash: owner.passwordHash,
      role: 'STAFF',
      permissions: ['PRODUCTS'],
    },
  });
  admins.push(restricted);
  await page.getByRole('button', { name: 'خروج از مدیریت', exact: true }).click();
  await login(restricted.email, owner.password);
  await expect(page).toHaveURL(adminOrigin + '/admin/products');
  await page.goto(listURL);
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'سفارش‌ها', exact: true })).toHaveCount(0);
  assert.deepEqual(errors, []);
  console.log(
    'Order cards passed: inline keyboard expansion, lazy fetch, immutable snapshots, audited status/list refresh, payment distinction/intercepted retry, invoice/label dialogs, terminal status, 320–1440px layouts, single expansion, errors/retry, filters, deep links/dashboard and permissions.',
  );
} finally {
  await browser?.close();
  await cleanupAdmin();
}
