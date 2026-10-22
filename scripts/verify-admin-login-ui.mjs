import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { startAPI, db, adminOrigin } from './auth-harness.mjs';
import { createAdmin, startAdmin, cleanupAdmin } from './admin-harness.mjs';
import { verifySurfaceMotion } from './surface-motion-checks.mjs';

let browser;
try {
  await startAPI();
  await startAdmin();
  const owner = await createAdmin();
  const staff = await createAdmin();
  await db.admin.update({
    where: { id: staff.id },
    data: { role: 'STAFF', permissions: ['PRODUCTS'] },
  });
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.setDefaultTimeout(15000);
  let failSession = true;
  let holdSession = true;
  let releaseSession;
  const sessionGate = new Promise((resolve) => (releaseSession = resolve));
  let holdLogin = false;
  let releaseLogin;
  const loginGate = new Promise((resolve) => (releaseLogin = resolve));
  let loginRequests = 0;
  await page.route('**/api/admin', async (route) => {
    const query = route.request().postDataJSON()?.query ?? '';
    if (/mutation AdminRefresh\b/.test(query)) {
      if (holdSession) {
        holdSession = false;
        await sessionGate;
      }
      if (failSession) {
        failSession = false;
        return route.fulfill({ status: 503, json: { errors: [{ message: 'Unavailable' }] } });
      }
    }
    if (/mutation AdminLogin\b/.test(query)) {
      loginRequests++;
      if (holdLogin) await loginGate;
    }
    await route.continue();
  });
  const target = '/admin/orders/manual?salesChannel=INSTAGRAM';
  await page.goto(adminOrigin + '/login');
  await expect(page.getByRole('status', { name: 'در حال بررسی نشست' })).toBeVisible();
  releaseSession();
  await expect(page.getByRole('button', { name: 'تلاش دوباره' })).toBeVisible();
  await page.getByRole('button', { name: 'تلاش دوباره' }).click();
  await expect(page.getByRole('button', { name: 'تلاش دوباره' })).toHaveCount(0);
  await page.goto(adminOrigin + target);
  const email = page.getByLabel('ایمیل مدیر', { exact: true });
  const password = page.getByLabel('رمز ورود', { exact: true });
  const submit = page.getByRole('button', { name: 'ورود به پنل', exact: true });
  await submit.click();
  await expect(page.getByText('ایمیل مدیر را وارد کنید.', { exact: true })).toBeVisible();
  await expect(page.getByText('رمز ورود را وارد کنید.', { exact: true })).toBeVisible();
  await email.fill('invalid-email');
  await password.fill('temporary');
  await submit.click();
  await expect(page.getByText('ایمیل معتبر وارد کنید.', { exact: true })).toBeVisible();
  assert.equal(loginRequests, 0);
  await password.focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'نمایش رمز ورود', exact: true })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(password).toHaveAttribute('type', 'text');
  await expect(password).toHaveValue('temporary');
  await page.keyboard.press('Enter');
  await expect(password).toHaveAttribute('type', 'password');
  assert.equal(loginRequests, 0, 'Password toggle must not submit the form');

  await email.fill('');
  await password.fill('');
  await email.blur();
  await page.reload();
  await expect(email).toBeVisible();
  await expect(email).toHaveAttribute('autocomplete', 'username');
  await expect(password).toHaveAttribute('autocomplete', 'current-password');
  await verifySurfaceMotion(page, page.locator('[data-motion-surface]').first(), { ambient: true });
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [1440, 900],
    [1024, 480],
  ]) {
    await page.setViewportSize({ width, height });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const inputStyle = await email.evaluate((el) => ({
      direction: getComputedStyle(el).direction,
      align: getComputedStyle(el).textAlign,
    }));
    assert.deepEqual(inputStyle, { direction: 'ltr', align: 'left' });
    await submit.scrollIntoViewIfNeeded();
    await expect(submit).toBeInViewport();
    assert.ok((await submit.boundingBox()).height >= 44);
    assert.ok(
      (await page.getByRole('button', { name: 'نمایش رمز ورود', exact: true }).boundingBox())
        .width >= 44,
    );
    const logo = page.getByRole('img');
    assert.ok(await logo.evaluate((el) => el.complete && el.naturalWidth > 0));
    await page.screenshot({ path: `/tmp/admin-login-${width}.png`, fullPage: true });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await email.fill(owner.email);
  await password.fill('incorrect-password');
  await submit.click();
  await expect(
    page
      .locator('[role="alert"]')
      .filter({ hasText: /ایمیل|رمز/ })
      .last(),
  ).toBeVisible();
  await expect(submit).toBeEnabled();
  await password.fill(owner.password);
  holdLogin = true;
  await submit.click();
  await expect(email).toBeDisabled();
  await expect(password).toBeDisabled();
  await expect(page.getByRole('button', { name: 'نمایش رمز ورود', exact: true })).toBeDisabled();
  await page.locator('form').evaluate((form) => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  releaseLogin();
  await expect(page).toHaveURL(adminOrigin + target);
  assert.equal(loginRequests, 2, 'One failed and one successful login, no duplicate request');
  await page.goto(adminOrigin + '/login');
  await expect(page).toHaveURL(adminOrigin + '/admin');
  const storage = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  assert.ok(!storage.includes(owner.password));
  await context.close();

  const staffContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const staffPage = await staffContext.newPage();
  await staffPage.goto(adminOrigin + '/login');
  await staffPage.setViewportSize({ width: 390, height: 568 });
  await staffPage.getByLabel('ایمیل مدیر', { exact: true }).waitFor();
  const touch = await staffContext.newCDPSession(staffPage);
  await touch.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 180, y: 155 }],
  });
  await touch.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: 180, y: 65 }],
  });
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => staffPage.evaluate(() => scrollY)).toBeGreaterThan(25);
  await touch.detach();
  await staffPage.getByLabel('ایمیل مدیر', { exact: true }).fill(staff.email);
  await staffPage.getByLabel('رمز ورود', { exact: true }).fill(staff.password);
  await staffPage.getByRole('button', { name: 'ورود به پنل', exact: true }).tap();
  await expect(staffPage).toHaveURL(adminOrigin + '/admin/products');
  await staffContext.close();
  assert.deepEqual(errors, []);
  console.log(
    'Admin login passed: responsive production UI, session retry/loading, validation, keyboard password toggle, real failed/successful login, pending guard, protected deep link and restricted staff landing.',
  );
} finally {
  await browser?.close();
  await cleanupAdmin();
}
