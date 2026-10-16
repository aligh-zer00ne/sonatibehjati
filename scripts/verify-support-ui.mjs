import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { USER_REFRESH_COOKIE } from '@behjati/shared';
import {
  startAPI,
  startStorefront,
  origin,
  adminOrigin,
  db,
  gql,
  keys,
  verification,
} from './auth-harness.mjs';
import { createAdmin, createCustomer, startAdmin, cleanupAdmin } from './admin-harness.mjs';

let browser;
try {
  await startAPI();
  await startStorefront();
  await startAdmin();
  const admin = await createAdmin();
  const customer = await createCustomer();
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const errors = [];
  const guest = await browser.newPage({ viewport: { width: 390, height: 844 } });
  guest.on('pageerror', (e) => errors.push(e.message));
  for (const width of [320, 390, 768, 1440]) {
    await guest.setViewportSize({ width, height: 844 });
    await guest.goto(origin + '/support');
    await expect(
      guest.getByRole('heading', { name: 'پشتیبانی سنتی بهجتی', exact: true }),
    ).toBeVisible();
    assert.ok(
      await guest.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      ),
      `Support overflow at ${width}px`,
    );
  }
  await guest.getByRole('link', { name: 'ورود و ثبت تیکت', exact: true }).click();
  await expect(guest).toHaveURL(origin + '/login?next=%2Fsupport');
  const requested = await gql(keys.request, { input: { phone: customer.user.phone } });
  const session = await gql(keys.verify, verification(requested.data.requestOtp));
  assert.equal(session.errors, undefined);
  const refreshCookie = session.cookies
    .split('; ')
    .find((value) => value.startsWith(`${USER_REFRESH_COOKIE}=`));
  assert.ok(refreshCookie);
  const [name, value] = refreshCookie.split('=');
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addCookies([{ name, value, url: origin, httpOnly: true, sameSite: 'Lax' }]);
  const shop = await context.newPage();
  shop.on('pageerror', (e) => errors.push(e.message));
  await shop.goto(origin + '/support');
  await shop.getByRole('button', { name: 'تیکت جدید', exact: true }).click();
  await shop.getByLabel('موضوع', { exact: true }).fill('پیگیری از صفحه پشتیبانی');
  await shop.getByLabel('توضیحات', { exact: true }).fill('لطفاً وضعیت ارسال را اعلام کنید.');
  await shop.getByRole('button', { name: 'ثبت تیکت', exact: true }).click();
  await expect(shop).toHaveURL(new RegExp('/account/support/[^/]+$'));
  const ticketId = shop.url().split('/').at(-1);
  await expect(shop.getByText('لطفاً وضعیت ارسال را اعلام کنید.', { exact: true })).toBeVisible();
  const manager = await browser.newPage();
  manager.on('pageerror', (e) => errors.push(e.message));
  await manager.goto(adminOrigin + '/login');
  await manager.getByLabel('ایمیل مدیر', { exact: true }).fill(admin.email);
  await manager.getByLabel('رمز ورود', { exact: true }).fill(admin.password);
  await manager.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(manager).toHaveURL(adminOrigin + '/admin');
  await manager.goto(adminOrigin + '/admin/tickets');
  await manager
    .getByRole('row')
    .filter({ hasText: 'پیگیری از صفحه پشتیبانی' })
    .getByRole('button', { name: 'مشاهده و پاسخ', exact: true })
    .click();
  await manager.getByLabel('پاسخ پشتیبانی', { exact: true }).fill('سفارش شما آمادهٔ ارسال است.');
  const [replyResponse] = await Promise.all([
    manager.waitForResponse((response) => {
      const request = response.request();
      return (
        request.method() === 'POST' &&
        request.postDataJSON()?.query?.includes('mutation ReplyAdminTicket')
      );
    }),
    manager.getByRole('button', { name: 'ارسال پاسخ', exact: true }).click(),
  ]);
  assert.equal((await replyResponse.json()).errors, undefined);
  // A textarea's entered value also matches getByText. Wait for the saved message paragraph.
  await expect(
    manager.locator('p').filter({ hasText: /^سفارش شما آمادهٔ ارسال است\.$/ }),
  ).toBeVisible();
  await shop.getByRole('button', { name: 'تازه‌سازی گفتگو', exact: true }).click();
  await expect(shop.getByText('سفارش شما آمادهٔ ارسال است.', { exact: true })).toBeVisible();
  assert.equal(
    (await db.supportTicket.findUniqueOrThrow({ where: { id: ticketId } })).status,
    'IN_PROGRESS',
  );
  assert.deepEqual(errors, []);
  console.log(
    'Public support entry, responsive layout, guest login redirect, ticket creation and admin reply passed.',
  );
} finally {
  await browser?.close();
  await cleanupAdmin();
}
