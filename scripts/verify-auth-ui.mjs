import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import {
  startAPI,
  startStorefront,
  origin,
  phone,
  codes,
  db,
  cleanup,
  unlockResend,
} from './auth-harness.mjs';
let browser;
try {
  const development = process.env.AUTH_VERIFY_DEVELOPMENT === 'true';
  await startAPI({ environment: development ? 'development' : 'test', developmentCode: '12345' });
  await startStorefront();
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  let bearerRequests = 0;
  page.on('request', (request) => {
    if (
      request.url().endsWith('/api/auth') &&
      request.headers().authorization?.startsWith('Bearer ')
    )
      bearerRequests++;
  });
  page.on('pageerror', (error) => errors.push(error.message));
  const goto = (path) => page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
  await goto('/shop');
  await page.getByRole('button', { name: 'افزودن حلواارده سنتی به سبد خرید' }).click();
  await page.getByRole('button', { name: 'افزایش تعداد حلواارده سنتی' }).click();
  const cartBefore = await page.evaluate(
    () => JSON.parse(localStorage.getItem('behjati-guest-cart-v1')).state.items,
  );
  await goto('/account');
  await expect(page).toHaveURL(/\/login\?next=/);
  await goto('/login?next=%2Fcart');
  await page.getByLabel('شماره موبایل', { exact: true }).fill('123');
  await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
  await expect(page.locator('main p[role="alert"]')).toContainText('شماره موبایل معتبر');
  const mobile = phone();
  assert.equal(await db.user.count({ where: { phone: mobile } }), 0);
  await page
    .getByLabel('شماره موبایل', { exact: true })
    .fill(mobile.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]));
  await page.route(
    '**/api/auth',
    (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [
            {
              message: 'ارسال پیامک انجام نشد. دوباره تلاش کنید.',
              extensions: { code: 'SMS_UNAVAILABLE' },
            },
          ],
        }),
      }),
    { times: 1 },
  );
  await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
  await expect(page.locator('main p[role="alert"]')).toContainText('ارسال پیامک انجام نشد');
  await page.screenshot({ path: '/tmp/behjati-phase5-login-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
  await expect(page).toHaveURL(/\/verify\?challenge=/);
  await expect(page.getByLabel('کد ورود', { exact: true })).toBeVisible();
  await expect(page.locator('#otp-help bdi')).toHaveText(/^[۰-۹]{2}:[۰-۹]{2}$/);
  await expect(page.getByText(mobile, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /ارسال مجدد تا/ })).toBeDisabled();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByLabel('کد ورود', { exact: true })).toBeVisible();
  await expect(page.getByLabel('کد ورود', { exact: true })).toHaveAttribute('maxlength', '5');
  await expect(page.getByLabel('کد ورود', { exact: true })).toHaveAttribute('pattern', '[0-9]{5}');
  const code = codes.get(mobile);
  assert.ok(code);
  if (development) assert.equal(code, '12345');
  await page.getByLabel('کد ورود', { exact: true }).fill(code === '99999' ? '00000' : '99999');
  await page.getByRole('button', { name: 'تأیید و ورود' }).click();
  await expect(page.locator('main p[role="alert"]')).toContainText('کد نادرست');
  await page.getByLabel('کد ورود', { exact: true }).fill('');
  await page.screenshot({ path: '/tmp/behjati-phase5-verify-mobile.png', fullPage: true });
  const oldId = new URL(page.url()).searchParams.get('challenge');
  await unlockResend(mobile);
  await page.clock.install();
  await page.clock.fastForward(61000);
  await page.getByRole('button', { name: 'ارسال مجدد کد', exact: true }).click();
  await expect(page).not.toHaveURL(new RegExp(`challenge=${oldId}`));
  await expect.poll(() => codes.get(mobile)).not.toBeUndefined();
  const latestCode = codes.get(mobile);
  await page
    .getByLabel('کد ورود', { exact: true })
    .fill(latestCode.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]));
  await expect(page.getByLabel('کد ورود', { exact: true })).toHaveValue(latestCode);
  await page.getByRole('button', { name: 'تأیید و ورود' }).click();
  await expect(page).toHaveURL(`${origin}/cart`);
  await expect(page.locator('[data-cart-product="traditional-halva-500"] output')).toHaveText('۲');
  assert.deepEqual(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('behjati-guest-cart-v1')).state.items,
    ),
    cartBefore,
  );
  assert.equal(await db.user.count({ where: { phone: mobile } }), 1);
  const jar = await context.cookies();
  assert.ok(
    jar
      .filter((cookie) => cookie.name.startsWith('behjati_user_'))
      .every((cookie) => cookie.httpOnly && cookie.sameSite === 'Lax'),
  );
  assert.equal(jar.filter((cookie) => cookie.name.startsWith('behjati_user_')).length, 1);
  assert.equal(
    jar.some((cookie) => cookie.name === 'behjati_user_access'),
    false,
  );
  assert.ok(!(await page.evaluate(() => document.cookie)).includes('behjati_user_'));
  assert.equal(await page.evaluate(() => sessionStorage.getItem('behjati-otp-challenge')), null);
  await goto('/account');
  await expect(page.getByRole('heading', { name: 'به سنتی بهجتی خوش آمدید' })).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText(mobile, { exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/behjati-phase5-account-mobile.png', fullPage: true });
  const previousRefresh = (await context.cookies()).find(
    (cookie) => cookie.name === 'behjati_user_refresh',
  ).value;
  await context.clearCookies({ name: 'behjati_user_access' });
  const tab = await context.newPage();
  tab.on('pageerror', (error) => errors.push(error.message));
  await Promise.all([
    page.reload({ waitUntil: 'networkidle' }),
    tab.goto(`${origin}/account`, { waitUntil: 'networkidle' }),
  ]);
  await expect(page.getByText(mobile, { exact: true })).toBeVisible();
  await expect(tab.getByText(mobile, { exact: true })).toBeVisible();
  const currentJar = await context.cookies();
  assert.equal(
    currentJar.some((cookie) => cookie.name === 'behjati_user_access'),
    false,
  );
  assert.ok(bearerRequests > 0);
  assert.equal(
    await page.evaluate(() =>
      [...Object.values(localStorage), ...Object.values(sessionStorage)].some((value) =>
        /eyJ[A-Za-z0-9_-]+\./.test(value),
      ),
    ),
    false,
  );
  assert.notEqual(
    currentJar.find((cookie) => cookie.name === 'behjati_user_refresh').value,
    previousRefresh,
  );
  const user = await db.user.findUniqueOrThrow({ where: { phone: mobile } });
  assert.equal(await db.userSession.count({ where: { userId: user.id, revokedAt: null } }), 1);
  await page.getByRole('button', { name: 'خروج از حساب', exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(tab).toHaveURL(/\/login/);
  assert.equal(
    (await context.cookies()).filter((cookie) => cookie.name.startsWith('behjati_user_')).length,
    0,
  );
  assert.deepEqual(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('behjati-guest-cart-v1')).state.items,
    ),
    cartBefore,
  );
  const csrf = await page.request.post(`${origin}/api/auth`, {
    headers: { Origin: 'https://other.example' },
    data: { operation: 'LogoutUser', variables: {} },
  });
  assert.equal(csrf.status(), 403);
  const invalid = await page.request.post(`${origin}/api/auth`, {
    headers: { Origin: origin },
    data: { operation: 'AdminLogin', variables: {} },
  });
  assert.equal(invalid.status(), 400);
  const visualContext = await browser.newContext();
  const visualPage = await visualContext.newPage();
  visualPage.on('pageerror', (error) => errors.push(error.message));
  await visualPage.goto(`${origin}/login?next=https%3A%2F%2Fother.example`, {
    waitUntil: 'networkidle',
  });
  for (const width of [320, 390, 768, 1440]) {
    await visualPage.setViewportSize({ width, height: 1000 });
    await expect(visualPage.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(visualPage.getByLabel('شماره موبایل', { exact: true })).toBeVisible();
    assert.ok(
      await visualPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Auth overflow at ${width}`,
    );
  }
  await visualPage.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, (image) => image.decode().catch(() => {})));
  });
  await visualPage.screenshot({ path: '/tmp/behjati-phase5-login-desktop.png', fullPage: true });
  await visualContext.close();
  await goto('/verify?challenge=missing');
  await expect(
    page.getByText('ابتدا شماره موبایل خود را وارد کنید.', { exact: true }),
  ).toBeVisible();
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(`${origin}/login`, { waitUntil: 'networkidle' });
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(staticPage.getByLabel('شماره موبایل', { exact: true })).toBeVisible();
  await staticContext.close();
  assert.deepEqual(errors, []);
  console.log(
    'Auth UI checks passed: guest route protection, Persian phone/code input, SMS error retry, persisted challenge, incorrect code and resend countdown, automatic login/return path, cart retention, HttpOnly cookies, reload and multi-tab refresh/logout, CSRF and operation allowlist, missing challenge, responsive 320/390/768/1440 and no runtime errors.',
  );
} finally {
  await browser?.close();
  await cleanup();
}
