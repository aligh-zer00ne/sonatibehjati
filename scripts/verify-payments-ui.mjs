import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { bank, bankRecords } from './payment-harness.mjs';
import { db, startAPI, startStorefront, origin, codes } from './auth-harness.mjs';
import {
  createCustomer,
  createOrderFixture,
  cleanupAdmin,
  startAdmin,
  createAdmin,
} from './admin-harness.mjs';
const checkoutTest = process.argv.includes('--checkout-test');
if (checkoutTest) process.env.CHECKOUT_PAYMENT_TEST_ENABLED = 'true';
let browser;
try {
  await startAPI();
  await startStorefront();
  await startAdmin();
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const customer = await createCustomer();
  const product = await db.product.findFirstOrThrow({
    where: { isActive: true, ...(checkoutTest ? { id: 'halva-500' } : {}) },
  });
  const goto = (path) => page.goto(origin + path, { waitUntil: 'networkidle' });
  await goto('/login');
  await page.getByLabel('شماره موبایل', { exact: true }).fill(customer.user.phone);
  await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
  await expect(page.getByLabel('کد ورود', { exact: true })).toBeVisible();
  const loginChallenge = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem('behjati-otp-challenge')),
  );
  async function verifyAgain(code) {
    const response = await context.request.post(origin + '/api/auth', {
      headers: { Origin: origin },
      data: {
        operation: 'VerifyOtp',
        variables: {
          input: { challengeId: loginChallenge.challengeId, phone: customer.user.phone, code },
        },
      },
    });
    return response.json();
  }
  if (checkoutTest) {
    assert.equal(loginChallenge.codeLength, 6);
    assert.equal(loginChallenge.testMode, true);
    assert.equal((await verifyAgain('12345')).errors?.[0]?.extensions?.code, 'BAD_USER_INPUT');
    await expect(page.getByLabel('کد ورود', { exact: true })).toHaveAttribute('maxlength', '6');
    await expect(
      page.getByText('؛ پیامکی ارسال نمی‌شود. کد ۱۲۳۴۵۶ را وارد کنید.', { exact: false }),
    ).toBeVisible();
    assert.equal(
      codes.has(customer.user.phone),
      false,
      'Fixed-code login must not log or send SMS',
    );
    await page.getByLabel('کد ورود', { exact: true }).fill('654321');
    await page.getByRole('button', { name: 'تأیید و ورود' }).click();
    await expect(page.locator('#otp-error')).toContainText('کد نادرست است');
  }
  await page
    .getByLabel('کد ورود', { exact: true })
    .fill(checkoutTest ? '۱۲۳۴۵۶' : codes.get(customer.user.phone));
  await page.getByRole('button', { name: 'تأیید و ورود' }).click();
  await expect(page).not.toHaveURL(/\/verify/);
  if (checkoutTest)
    assert.equal(
      (await verifyAgain('123456')).errors?.[0]?.extensions?.code,
      'INVALID_OTP',
      'A successful challenge must remain single-use',
    );
  let state = 'OK';
  let latest;
  let pending = false;
  await context.route('https://sep.shaparak.ir/OnlinePG/OnlinePG', async (route) => {
    const token = new URLSearchParams(route.request().postData()).get('Token');
    const record = [...bankRecords.values()].find((r) => 'token-' + r.ResNum === token);
    assert.ok(record, 'Browser sent a saved bank token');
    assert.equal(route.request().headers().referer, origin + '/');
    latest = record;
    record.outage = pending;
    await route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: `<!doctype html><html lang="fa" dir="rtl"><title>بانک آزمایشی</title><form action="${record.RedirectUrl}" method="post"><input name="ResNum" value="${record.ResNum}" type="hidden"><input name="RefNum" value="ref-${record.ResNum}" type="hidden"><input name="State" value="${state}" type="hidden"><input name="TerminalId" value="12345678" type="hidden"><button>بازگشت از بانک</button></form></html>`,
    });
  });
  let firstCheckout = checkoutTest;
  async function enterBank() {
    let order;
    if (firstCheckout) {
      firstCheckout = false;
      await goto('/shop');
      await page
        .getByRole('button', { name: 'افزودن ' + product.title + ' به سبد خرید', exact: true })
        .click();
      await goto('/cart');
      await page.getByRole('link', { name: 'ادامهٔ ثبت سفارش', exact: true }).click();
      await expect(page).toHaveURL(origin + '/checkout');
      await expect(page.getByRole('button', { name: 'ثبت سفارش', exact: true })).toBeEnabled();
      await page.getByRole('button', { name: 'ثبت سفارش', exact: true }).click();
      await expect(page).toHaveURL(/\/checkout\/order\//);
      order = await db.order.findUniqueOrThrow({ where: { id: page.url().split('/').pop() } });
      assert.equal(order.userId, customer.user.id);
      assert.equal(order.paidAt, null);
    } else {
      order = await createOrderFixture(customer, product);
      await goto('/checkout/order/' + order.id);
    }
    await expect(page.getByRole('button', { name: 'پرداخت امن با درگاه سامان' })).toBeEnabled();
    await page.getByRole('button', { name: 'پرداخت امن با درگاه سامان' }).click();
    await expect(page.getByRole('button', { name: 'بازگشت از بانک' })).toBeVisible();
    assert.equal(latest.Amount, order.total * 10);
    return order;
  }
  const paid = await enterBank();
  await page.getByRole('button', { name: 'بازگشت از بانک' }).click();
  await expect(page).toHaveURL(/\/payment\/sep\/result\//);
  await expect(page.getByRole('heading', { name: 'پرداخت موفق', exact: true })).toBeVisible();
  assert.ok((await db.order.findUniqueOrThrow({ where: { id: paid.id } })).paidAt);
  const resultUrl = page.url();
  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await guestPage.goto(resultUrl, { waitUntil: 'networkidle' });
  await expect(guestPage.getByRole('heading', { name: 'پرداخت موفق', exact: true })).toBeVisible();
  assert.equal((await guestContext.cookies()).length, 0);
  await guestContext.close();
  await goto('/checkout/order/' + paid.id);
  await expect(
    page.getByRole('heading', { name: 'پرداخت شما تأیید شد', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'پرداخت امن با درگاه سامان' })).toHaveCount(0);
  await goto('/account/orders/' + paid.id);
  await expect(page.getByText('پرداخت تأییدشده', { exact: true })).toBeVisible();
  await page.goto(resultUrl, { waitUntil: 'networkidle' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Payment result overflow at ${width}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/tmp/behjati-payment-success-mobile.png', fullPage: true });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'پرداخت موفق', exact: true })).toBeVisible();
  const publicStatus = await context.request.get(resultUrl.replace('/result/', '/status/'));
  assert.equal(publicStatus.headers()['cache-control'], 'no-store');
  const body = await publicStatus.json();
  assert.equal(body.status, 'SUCCEEDED');
  assert.equal(body.token, undefined);
  assert.equal(body.phone, undefined);
  assert.equal(body.address, undefined);
  state = 'CanceledByUser';
  const canceled = await enterBank();
  await page.getByRole('button', { name: 'بازگشت از بانک' }).click();
  await expect(page.getByRole('heading', { name: 'پرداخت لغو شد', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'تلاش دوباره برای پرداخت' })).toBeVisible();
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: canceled.id } })).paidAt, null);
  state = 'Failed';
  await enterBank();
  await page.getByRole('button', { name: 'بازگشت از بانک' }).click();
  await expect(page.getByRole('heading', { name: 'پرداخت ناموفق', exact: true })).toBeVisible();
  state = 'OK';
  pending = true;
  const delayed = await enterBank();
  await page.getByRole('button', { name: 'بازگشت از بانک' }).click();
  await expect(
    page.getByRole('heading', { name: 'در انتظار تأیید بانک', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'تلاش دوباره برای پرداخت' })).toHaveCount(0);
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: delayed.id } })).paidAt, null);
  await page.screenshot({ path: '/tmp/behjati-payment-pending-mobile.png', fullPage: true });
  const admin = await createAdmin();
  const adminPage = await context.newPage();
  await adminPage.goto('http://localhost:3005/login', { waitUntil: 'networkidle' });
  await adminPage.getByLabel('ایمیل مدیر', { exact: true }).fill(admin.email);
  await adminPage.getByLabel('رمز ورود', { exact: true }).fill(admin.password);
  await adminPage.getByRole('button', { name: 'ورود به پنل' }).click();
  await expect(adminPage).not.toHaveURL(/\/login/);
  await adminPage.goto('http://localhost:3005/admin/orders/' + delayed.id, {
    waitUntil: 'networkidle',
  });
  await expect(adminPage.getByText('در انتظار تأیید بانک', { exact: true })).toBeVisible();
  latest.outage = false;
  await adminPage.getByRole('button', { name: 'پیگیری بانک', exact: true }).click();
  await expect(adminPage.getByText('پرداخت بانک تأیید شده است', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'بررسی دوباره نتیجه' }).click();
  await expect(page.getByRole('heading', { name: 'پرداخت موفق', exact: true })).toBeVisible();
  await adminPage.getByRole('button', { name: 'چاپ فاکتور / PDF' }).click();
  await expect(
    adminPage.getByText('پرداخت این سفارش توسط بانک تأیید شده است.', { exact: true }).first(),
  ).toBeVisible();
  assert.deepEqual(errors, []);
  if (checkoutTest)
    console.log(
      'Main-storefront checkout passed: fixed 123456 / Persian digits, wrong code refused, no SMS, cart, existing address, real order creation and verified payment.',
    );
  console.log(
    'SEP browser checks passed: real token form and origin referrer, bank POST/303, cookieless result, success/cancel/decline/pending, admin retry, invoice, safe public status, reload and mobile/desktop layout. Bank traffic was intercepted; no real charge occurred.',
  );
} finally {
  await browser?.close();
  await cleanupAdmin();
  await new Promise((resolve) => bank.close(resolve));
}
