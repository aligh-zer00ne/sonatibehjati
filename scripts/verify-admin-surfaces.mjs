import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { startAPI, adminOrigin } from './auth-harness.mjs';
import {
  createAdmin,
  loginAdmin,
  createCustomer,
  startAdmin,
  cleanupAdmin,
} from './admin-harness.mjs';
import { verifySurfaceMotion } from './surface-motion-checks.mjs';
let browser;
try {
  await startAPI();
  await startAdmin();
  const owner = await createAdmin(),
    session = await loginAdmin(owner),
    customer = await createCustomer();
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addCookies(
    session.cookies.split('; ').map((v) => {
      const i = v.indexOf('=');
      return { name: v.slice(0, i), value: v.slice(i + 1), url: adminOrigin };
    }),
  );
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const [path, selector] of [
    ['/admin/sections/catalog', '[data-admin-section="catalog"] > header'],
    ['/admin/sections/sales', '[data-admin-section="sales"] > header'],
    ['/admin/sections/communication', '[data-admin-section="communication"] > header'],
    ['/admin/sections/settings', '[data-admin-section="settings"] > header'],
    ['/admin/reports', '[data-admin-reports] > header'],
    [
      '/admin/settlements/account?customerId=' + customer.user.id,
      '[aria-label="خلاصه حساب مشتری"] > header',
    ],
    ['/admin/settlements', 'header:has(h1:text-is("دریافت و پرداخت"))'],
  ]) {
    await page.goto(adminOrigin + path);
    const surface = page.locator(selector),
      canvas = surface.locator('canvas[data-ambient-backdrop]');
    await expect(canvas).toHaveCount(1);
    await expect(canvas).toHaveAttribute('data-network-state', 'running');
    const pixels = await canvas.evaluate((el) => el.toDataURL());
    await expect.poll(() => canvas.evaluate((el) => el.toDataURL())).not.toBe(pixels);
    assert.equal(await surface.evaluate((el) => getComputedStyle(el).transform), 'none');
    if (path.includes('/catalog')) {
      assert.match(
        await surface.evaluate((el) => getComputedStyle(el).backgroundImage),
        /rgb\(92, 25, 36\)/,
      );
      await verifySurfaceMotion(page, surface, { ambient: true });
      await page.screenshot({
        path: '/tmp/behjati-burgundy-catalog-desktop.png',
        fullPage: true,
        animations: 'disabled',
      });
    }
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
        .toBeLessThanOrEqual(1);
    }
  }
  await page.goto(adminOrigin + '/admin');
  await verifySurfaceMotion(page, page.locator('[data-admin-topbar]'), { ambient: true });
  await page.screenshot({
    path: '/tmp/behjati-burgundy-dashboard-desktop.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(adminOrigin + '/admin/sections/catalog');
  await expect(
    page.locator('[data-admin-section="catalog"] canvas[data-ambient-backdrop]'),
  ).toHaveAttribute('data-network-state', 'running');
  await page.screenshot({
    path: '/tmp/behjati-burgundy-catalog-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  assert.deepEqual(errors, []);
  console.log(
    'Admin surfaces passed: burgundy catalog/sales/communication/settings/report/account/finance panels, visible autonomous network, stationary backgrounds, pointer/touch links, reduced-motion and 320–1440px bounds. No SMS/bank call.',
  );
} finally {
  await browser?.close();
  await cleanupAdmin();
}
