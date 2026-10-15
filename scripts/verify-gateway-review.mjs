import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { bank, bankRecords, bankControl } from './payment-harness.mjs';
process.env.CUSTOMER_AUTH_ENABLED = 'false';
process.env.ADMIN_PAYMENT_TEST_ENABLED = 'true';
const { db, startAPI, startStorefront, origin, gql, keys, errorCode, proxySecret } =
  await import('./auth-harness.mjs');
process.env.AUTH_PROXY_SECRET = proxySecret;
const { createAdmin, loginAdmin, adminGql, cleanupAdmin, startAdmin } =
  await import('./admin-harness.mjs');
const { startAdminGatewayTest } = await import('../apps/api/src/modules/payments/admin-test.ts');
const { callback, reconcilePayments } = await import('../apps/api/src/modules/payments/service.ts');
const query =
  '{adminGatewayTest{enabled amount terminalId payments{payment{id status bankCode reason verifiedAt} redirectUrl resultUrl}}}';
const start = 'mutation{startAdminGatewayTest{redirectUrl}}';
const retry = 'mutation($id:ID!){retryAdminPayment(paymentId:$id){status}}';
let browser;
try {
  await startAPI();
  const owner = await createAdmin();
  const staff = await createAdmin();
  await db.admin.update({
    where: { id: staff.id },
    data: { role: 'STAFF', permissions: ['ORDERS'] },
  });
  const ownerSession = await loginAdmin(owner);
  const staffSession = await loginAdmin(staff);
  errorCode(await adminGql(query), 'UNAUTHENTICATED');
  errorCode(await adminGql(query, {}, staffSession.cookies), 'FORBIDDEN');
  errorCode(await adminGql(start, {}, staffSession.cookies), 'FORBIDDEN');
  errorCode(await gql(start, {}, ownerSession.cookies), 'FORBIDDEN');
  const counts = {
    users: await db.user.count(),
    orders: await db.order.count(),
    otp: await db.otpCode.count(),
  };
  errorCode(await gql(keys.request, { input: { phone: '09000000001' } }), 'SERVICE_UNAVAILABLE');
  errorCode(
    await gql(keys.verify, {
      input: { challengeId: crypto.randomUUID(), phone: '09000000001', code: '12345' },
    }),
    'SERVICE_UNAVAILABLE',
  );
  errorCode(await gql(keys.refresh), 'SERVICE_UNAVAILABLE');
  errorCode(
    await gql('mutation{startOrderPayment(orderId:"unpaid"){redirectUrl}}'),
    'SERVICE_UNAVAILABLE',
  );
  assert.equal((await gql('{paymentAvailable me{id}}')).data.paymentAvailable, false);
  bankControl.tokenError = true;
  errorCode(await adminGql(start, {}, ownerSession.cookies), 'PAYMENT_UNAVAILABLE');
  bankControl.tokenError = false;
  const rejected = await adminGql(query, {}, ownerSession.cookies);
  assert.equal(rejected.data.adminGatewayTest.payments[0].payment.bankCode, 8);
  async function attempt() {
    const response = await startAdminGatewayTest(owner.id);
    const [, id, key] = response.redirectUrl.match(/redirect\/([^/]+)\/([^/]+)$/);
    return { id, key, bank: bankRecords.get(id) };
  }
  const success = await attempt();
  const resumed = await startAdminGatewayTest(owner.id);
  assert.ok(resumed.redirectUrl.includes(success.id));
  assert.equal(success.bank.Amount, 100000);
  assert.equal(success.bank.CellNumber, undefined);
  const complete = (p) =>
    callback(p.id, p.key, {
      state: 'OK',
      resnum: p.id,
      terminalid: '12345678',
      refnum: 'ref-' + p.id,
    });
  await Promise.all([complete(success), complete(success)]);
  let record = await db.payment.findUniqueOrThrow({ where: { id: success.id } });
  assert.equal(record.orderId, null);
  assert.equal(record.gatewayTestAdminId, owner.id);
  assert.equal(record.status, 'REVERSED');
  assert.equal(record.reason, 'ADMIN_GATEWAY_TEST');
  assert.ok(record.verifiedAt && record.reversedAt);
  assert.equal(record.acceptedAt, null);
  assert.equal(success.bank.verifyCalls, 1);
  assert.equal(success.bank.reverseCalls, 1);
  const pendingRefund = await attempt();
  pendingRefund.bank.reverseOutage = true;
  await complete(pendingRefund);
  assert.equal(
    (await db.payment.findUniqueOrThrow({ where: { id: pendingRefund.id } })).status,
    'REFUND_PENDING',
  );
  await assert.rejects(() => startAdminGatewayTest(owner.id));
  errorCode(await adminGql(retry, { id: pendingRefund.id }, staffSession.cookies), 'FORBIDDEN');
  pendingRefund.bank.reverseOutage = false;
  assert.equal(
    (await adminGql(retry, { id: pendingRefund.id }, ownerSession.cookies)).data.retryAdminPayment
      .status,
    'REVERSED',
  );
  const late = await attempt();
  await db.payment.update({
    where: { id: late.id },
    data: { status: 'VERIFY_PENDING', refNum: 'ref-' + late.id },
  });
  await reconcilePayments();
  assert.equal((await db.payment.findUniqueOrThrow({ where: { id: late.id } })).status, 'REVERSED');
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
  await page.goto('http://localhost:3005/login', { waitUntil: 'networkidle' });
  await page.getByLabel('ایمیل مدیر', { exact: true }).fill(owner.email);
  await page.getByLabel('رمز ورود', { exact: true }).fill(owner.password);
  await page.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/);
  const go = () =>
    page.goto('http://localhost:3005/admin/payment-test', { waitUntil: 'networkidle' });
  await go();
  await expect(page.getByRole('heading', { name: 'تست درگاه پرداخت', exact: true })).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Admin gateway review overflow at ${width}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/tmp/behjati-gateway-review-admin.png', fullPage: true });
  let state = 'OK';
  let outage = false;
  let latest;
  await context.route('https://sep.shaparak.ir/OnlinePG/OnlinePG', async (route) => {
    const token = new URLSearchParams(route.request().postData()).get('Token');
    latest = [...bankRecords.values()].find((row) => 'token-' + row.ResNum === token);
    assert.ok(latest);
    latest.outage = outage;
    assert.equal(route.request().headers().referer, origin + '/');
    await route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: `<html lang="fa" dir="rtl"><form method="post" action="${latest.RedirectUrl}"><input type="hidden" name="State" value="${state}"><input type="hidden" name="ResNum" value="${latest.ResNum}"><input type="hidden" name="RefNum" value="ref-${latest.ResNum}"><input type="hidden" name="TerminalId" value="12345678"><button>بازگشت بانک آزمایشی</button></form></html>`,
    });
  });
  async function enter() {
    await go();
    await page.getByRole('button', { name: 'شروع تست واقعی درگاه سامان' }).click();
    await expect(page.getByRole('button', { name: 'بازگشت بانک آزمایشی' })).toBeVisible();
    await page.getByRole('button', { name: 'بازگشت بانک آزمایشی' }).click();
    await expect(page).toHaveURL(/\/payment\/sep\/result\//);
  }
  bankControl.tokenError = true;
  await go();
  await page.getByRole('button', { name: 'شروع تست واقعی درگاه سامان' }).click();
  await expect(
    page.locator('[role=alert]').filter({ hasText: 'اتصال به درگاه انجام نشد' }),
  ).toBeVisible();
  bankControl.tokenError = false;
  await enter();
  await expect(page.getByRole('heading', { name: 'وجه برگشت داده شد', exact: true })).toBeVisible();
  await expect(page.getByText('بانک پرداخت تست را تأیید کرد.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'جزئیات سفارش', exact: true })).toHaveCount(0);
  const receipt = page.url();
  const guest = await browser.newContext();
  const guestPage = await guest.newPage();
  await guestPage.goto(receipt, { waitUntil: 'networkidle' });
  await expect(guestPage.getByText('بانک پرداخت تست را تأیید کرد.', { exact: true })).toBeVisible();
  assert.equal((await guest.cookies()).length, 0);
  await guest.close();
  await page.screenshot({ path: '/tmp/behjati-gateway-review-result.png', fullPage: true });
  state = 'CanceledByUser';
  await enter();
  await expect(page.getByRole('heading', { name: 'پرداخت لغو شد', exact: true })).toBeVisible();
  state = 'Failed';
  await enter();
  await expect(page.getByRole('heading', { name: 'پرداخت ناموفق', exact: true })).toBeVisible();
  state = 'OK';
  outage = true;
  await enter();
  await expect(
    page.getByRole('heading', { name: 'در انتظار تأیید بانک', exact: true }),
  ).toBeVisible();
  await go();
  await expect(page.getByRole('button', { name: 'شروع تست واقعی درگاه سامان' })).toBeDisabled();
  latest.outage = false;
  await page.getByRole('button', { name: 'پیگیری بانک', exact: true }).click();
  await expect(
    page.getByText('بانک پرداخت تست را تأیید کرد.', { exact: true }).first(),
  ).toBeVisible();
  assert.deepEqual(errors, []);
  assert.equal(await db.user.count(), counts.users);
  assert.equal(await db.order.count(), counts.orders);
  assert.equal(await db.otpCode.count(), counts.otp);
  await expect
    .poll(async () => (await db.payment.findUniqueOrThrow({ where: { id: latest.ResNum } })).status)
    .toBe('REVERSED');
  record = await db.payment.findUniqueOrThrow({ where: { id: latest.ResNum } });
  assert.equal(record.acceptedAt, null);
  console.log(
    'Gateway review passed: owner-only real-bank workflow with SMS/customer auth disabled, fixed amount, no orders/users/sales, token rejection, idempotency, verification and automatic reversal, refund outage recovery, staff rejection, public receipt without cookies, mobile/desktop UI and cancel/decline/pending states. Bank traffic was simulated; no charge occurred.',
  );
} finally {
  await browser?.close();
  await cleanupAdmin();
  await new Promise((resolve) => bank.close(resolve));
}
