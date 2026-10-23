import { verifySurfaceMotion } from './surface-motion-checks.mjs';
import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { bank, bankRecords } from './payment-harness.mjs';
import { db, startAPI, startStorefront, origin, codes } from './auth-harness.mjs';
import {
  createAdmin,
  createCustomer,
  createOrderFixture,
  startAdmin,
  cleanupAdmin,
} from './admin-harness.mjs';
let browser;
const adminOrigin = 'http://localhost:3005';
const fits = async (page) =>
  expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
    .toBeLessThanOrEqual(1);
try {
  await startAPI();
  await startAdmin();
  await startStorefront({ hostname: '127.0.0.1' });
  const owner = await createAdmin(),
    customer = await createCustomer();
  const product = await db.product.findFirstOrThrow({ where: { isActive: true } });
  const order = await createOrderFixture(customer, product, { total: 250000 });
  await db.order.update({
    where: { id: order.id },
    data: { salesChannel: 'IN_PERSON', status: 'DELIVERED' },
  });
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const requests = [];
  await page.route('**/api/admin', async (route) => {
    const body = route.request().postDataJSON();
    if (!body.query.includes('mutation CreateAdminPaymentRequest')) return route.continue();
    requests.push(body.variables.input);
    if (requests.length === 1) {
      const response = await route.fetch();
      assert.equal((await response.json()).errors, undefined);
      return route.abort('failed');
    }
    return route.continue();
  });
  await page.goto(adminOrigin + '/login');
  await page.getByLabel('ایمیل مدیر', { exact: true }).fill(owner.email);
  await page.getByLabel('رمز ورود', { exact: true }).fill(owner.password);
  await page.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(page).toHaveURL(adminOrigin + '/admin');
  await page.goto(adminOrigin + '/admin/users?search=' + customer.user.phone);
  const card = page.locator('[data-admin-record]');
  await expect(card).toHaveCount(1);
  await card.getByRole('button', { name: 'لینک پرداخت مانده', exact: true }).click();
  await expect(page).toHaveURL(/settlements\/links\/new\?customerId=/);
  await expect(page.locator('[data-amount="250000"]')).toBeVisible();
  await page.getByRole('button', { name: 'ساخت لینک پرداخت', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'بررسی و ساخت مجدد همین لینک', exact: true }),
  ).toBeEnabled();
  await page.reload();
  await page.getByRole('button', { name: 'بررسی و ساخت مجدد همین لینک', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'لینک پرداخت آماده است', exact: true }),
  ).toBeVisible();
  assert.deepEqual(requests[0], requests[1]);
  assert.equal(
    await db.paymentRequest.count({
      where: { createdByAdminId: owner.id, customerId: customer.user.id },
    }),
    1,
  );
  const url = await page
    .getByRole('textbox', { name: 'آدرس لینک پرداخت', exact: true })
    .inputValue();
  assert.match(url, new RegExp('^' + origin + '/pay/'));
  await page.getByRole('button', { name: 'کپی لینک', exact: true }).click();
  const composer = page.getByRole('dialog', { name: 'ارسال لینک پرداخت', exact: true });
  await expect(composer).toBeVisible();
  await composer.getByRole('button', { name: 'کپی لینک با متن قالب', exact: true }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  assert.ok(copied.includes(url) && copied.length > url.length);
  assert.equal(
    copied,
    await composer.getByRole('textbox', { name: 'متن آماده پیام' }).inputValue(),
  );
  await composer.getByRole('button', { name: 'بستن ارسال لینک پرداخت', exact: true }).click();
  await page.screenshot({ path: '/tmp/behjati-payment-link-created.png', fullPage: true });
  const payer = await browser.newContext({ viewport: { width: 390, height: 844 } }),
    publicPage = await payer.newPage();
  publicPage.on('pageerror', (e) => errors.push(e.message));
  let bankRecord;
  await payer.route('https://sep.shaparak.ir/OnlinePG/OnlinePG', async (route) => {
    const token = new URLSearchParams(route.request().postData()).get('Token');
    const record = [...bankRecords.values()].find((r) => 'token-' + r.ResNum === token);
    assert.ok(record);
    bankRecord = record;
    await route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: `<!doctype html><html><title>Mock bank</title><form method="post" action="${record.RedirectUrl}"><input type="hidden" name="ResNum" value="${record.ResNum}"><input type="hidden" name="State" value="OK"><input type="hidden" name="RefNum" value="ref-${record.ResNum}"><input type="hidden" name="TerminalId" value="12345678"><button>بازگشت از بانک</button></form></html>`,
    });
  });
  const response = await publicPage.goto(url);
  assert.equal(response.status(), 200);
  assert.equal(response.headers()['referrer-policy'], 'no-referrer');
  assert.match(response.headers()['x-robots-tag'], /noindex/);
  await expect(
    publicPage.getByRole('button', { name: 'پرداخت در درگاه سامان', exact: false }),
  ).toBeVisible();
  assert.match(await publicPage.locator('meta[name=robots]').getAttribute('content'), /noindex/);
  assert.equal(
    await publicPage.locator('meta[name=referrer]').getAttribute('content'),
    'no-referrer',
  );
  assert.equal(codes.size, 0);
  assert.equal((await payer.cookies()).filter((c) => c.name.startsWith('behjati_')).length, 0);
  const status = await payer.request.get(url + '/status');
  assert.match(status.headers()['cache-control'], /no-store/);
  const json = await status.json();
  assert.equal(json.amount, 250000);
  assert.equal(json.payerPhone, undefined);
  const denied = await payer.request.post(url + '/start', {
    headers: { Origin: 'https://outside.example', 'Sec-Fetch-Site': 'cross-site' },
  });
  assert.equal(denied.status(), 403);
  for (const width of [320, 390, 768, 1440]) {
    await publicPage.setViewportSize({ width, height: 900 });
    await fits(publicPage);
  }
  await publicPage.setViewportSize({ width: 390, height: 844 });
  await publicPage.screenshot({
    path: '/tmp/behjati-payment-link-public-mobile.png',
    fullPage: true,
  });
  await publicPage.getByRole('button', { name: 'پرداخت در درگاه سامان', exact: false }).click();
  await expect(
    publicPage.getByRole('button', { name: 'بازگشت از بانک', exact: true }),
  ).toBeVisible();
  assert.equal(bankRecord.Amount, 2500000);
  assert.equal(await db.customerAccountEntry.count({ where: { userId: customer.user.id } }), 0);
  await publicPage.getByRole('button', { name: 'بازگشت از بانک', exact: true }).click();
  await expect(publicPage.getByRole('heading', { name: 'پرداخت موفق', exact: true })).toBeVisible();
  await publicPage.getByRole('link', { name: 'بازگشت به وضعیت لینک پرداخت', exact: true }).click();
  await expect(
    publicPage.getByText('پرداخت توسط بانک تأیید و رسید آن ثبت شد.', { exact: true }),
  ).toBeVisible();
  await expect(
    publicPage.getByRole('button', { name: 'پرداخت در درگاه سامان', exact: false }),
  ).toHaveCount(0);
  assert.equal(
    await db.customerAccountEntry.count({ where: { userId: customer.user.id, method: 'ONLINE' } }),
    1,
  );
  await page.goto(adminOrigin + '/admin/settlements/account?customerId=' + customer.user.id);
  await expect(page.locator('[data-account-status="settled"]').first()).toBeVisible();
  await expect(page.getByText('درگاه سامان (تأییدشده)', { exact: false }).first()).toBeVisible();
  await page.goto(adminOrigin + '/admin/settlements');
  await expect(page.getByRole('heading', { name: 'دریافت و پرداخت', exact: true })).toBeVisible();
  await expect(page.locator('a[href="/admin/settlements/receipt"]')).toHaveCount(1);
  await page
    .getByRole('link', { name: /دریافت از مشتری/ })
    .last()
    .click();
  await expect(page.locator('[data-account-operation="RECEIPT"]')).toBeVisible();
  const select = page.getByRole('combobox', { name: 'جستجوی مشتری', exact: true });
  await select.fill(customer.user.phone);
  await page
    .locator('.ant-select-item-option')
    .filter({ hasText: customer.user.phone.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]) })
    .click();
  await page.getByLabel('مبلغ (ریال)', { exact: true }).fill('1500000');
  await expect(page.locator('[data-account-preview] [data-amount="150000"]')).toHaveCount(2);
  const formBox = await page.locator('form').boundingBox(),
    previewBox = await page.locator('[data-account-preview]').boundingBox();
  assert.ok(formBox.x > previewBox.x && Math.abs(formBox.y - previewBox.y) < 2);
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', { name: 'ثبت دریافت از مشتری', exact: true }),
  ).toBeEnabled();
  await page.screenshot({
    path: '/tmp/behjati-finance-operation-desktop.png',
    fullPage: true,
    animations: 'disabled',
  });
  for (const width of [320, 390, 768, 1100, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await fits(page);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.screenshot({
    path: '/tmp/behjati-finance-operation-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  // Anonymous arbitrary amounts use the same site and require no synthetic customer.
  await page.goto(adminOrigin + '/admin/settlements/links/new');
  await page.getByLabel('مبلغ (ریال)', { exact: true }).fill('1200000');
  await page.getByRole('button', { name: 'ساخت لینک پرداخت', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'لینک پرداخت آماده است', exact: true }),
  ).toBeVisible();
  const generic = await db.paymentRequest.findFirstOrThrow({
    where: { createdByAdminId: owner.id, customerId: null },
  });
  assert.equal(generic.amount, 120000);
  await page.goto(adminOrigin + '/admin/settlements/links');
  await expect(page.locator('[data-payment-request]')).toHaveCount(2);
  await expect(
    page.locator('[data-payment-request]').getByText('پرداخت‌شده', { exact: true }),
  ).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await fits(page);
  }
  const transactionButton = page.getByRole('button', { name: 'جزئیات تراکنش‌ها', exact: true });
  await transactionButton.click();
  const transactions = page.getByRole('dialog', { name: 'جزئیات تراکنش‌ها', exact: true });
  await expect(transactions).toBeVisible();
  await expect(
    transactions.getByRole('textbox', { name: 'آدرس لینک پرداخت', exact: true }),
  ).toHaveValue(url);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(async () => {
        const box = await transactions.boundingBox();
        return box && box.x >= 0 && box.x + box.width <= width + 1 && box.y + box.height <= 1000;
      })
      .toBe(true);
    const box = await transactions.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= width + 1 && box.y + box.height <= 1000);
  }
  await page.keyboard.press('Escape');
  await expect(transactions).toBeHidden();
  await expect(transactionButton).toBeFocused();
  const genericCard = page.locator(`[data-payment-request="${generic.id}"]`);
  await genericCard.getByRole('button', { name: 'غیرفعال‌کردن لینک', exact: true }).click();
  await expect(genericCard.getByText('غیرفعال', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await verifySurfaceMotion(page, page.locator('[data-admin-topbar]'), { ambient: true });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  assert.deepEqual(errors, []);
  console.log(
    'Payment link UI: customer action, exact rial amount, copy, response-loss UUID recovery, anonymous bank payment/receipt, account ledger, generic link, inline preview, header motion and 320–1440px bounds passed.',
  );
} finally {
  await browser?.close();
  await cleanupAdmin();
  bank.close();
}
