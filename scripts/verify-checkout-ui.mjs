import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { startAPI, startStorefront, origin, phone, db, cleanup } from './auth-harness.mjs';
let browser;
try {
  await startAPI({ environment: 'development', developmentCode: '123456' });
  await startStorefront();
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9HcAAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const goto = (path) => page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
  await goto('/shop');
  await page.getByRole('button', { name: 'افزودن حلواارده سنتی به سبد خرید' }).click();
  await goto('/cart');
  await page.getByRole('link', { name: 'ادامهٔ ثبت سفارش', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fcheckout/);
  const mobile = phone();
  await page.getByLabel('شماره موبایل', { exact: true }).fill(mobile);
  await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
  await expect(page.getByLabel('کد ورود', { exact: true })).toBeVisible();
  await page.getByLabel('کد ورود', { exact: true }).fill('۱۲۳۴۵۶');
  await page.getByRole('button', { name: 'تأیید و ورود' }).click();
  await expect(page).toHaveURL(`${origin}/checkout`);
  await page.getByRole('button', { name: 'افزودن نشانی', exact: true }).click();
  await page.getByLabel('عنوان نشانی', { exact: true }).fill('خانه');
  await page.getByLabel('نام گیرنده', { exact: true }).fill('گیرنده نمونه');
  await page.getByLabel('استان', { exact: true }).fill('یزد');
  await page.getByLabel('شهر', { exact: true }).fill('اردکان');
  await page.getByLabel('کد پستی', { exact: true }).fill('۱۲۳۴۵۶۷۸۹۰');
  await page.getByLabel('نشانی کامل', { exact: true }).fill('خیابان نمونه، کوچه نمونه، پلاک ۱۰');
  await page.getByRole('button', { name: 'موقعیت فعلی من', exact: true }).click();
  await expect(
    page.getByText('دسترسی به موقعیت داده نشد؛ روی نقشه انتخاب کنید یا نشانی را دستی بنویسید.', {
      exact: true,
    }),
  ).toBeVisible();
  await context.grantPermissions(['geolocation'], { origin });
  await context.setGeolocation({ latitude: 32.312, longitude: 54.017 });
  await page.getByRole('button', { name: 'موقعیت فعلی من', exact: true }).click();
  await expect(page.getByText('موقعیت انتخاب شد', { exact: true })).toBeVisible();
  const map = page.getByRole('region', { name: 'نقشه انتخاب موقعیت نشانی' });
  await expect(page.locator('.leaflet-marker-icon')).toBeVisible();
  await map.click({ position: { x: 85, y: 110 } });
  const marker = page.locator('.leaflet-marker-icon');
  const box = await marker.boundingBox();
  await page.mouse.move(box.x + 12, box.y + 15);
  await page.mouse.down();
  await page.mouse.move(box.x + 55, box.y + 35, { steps: 8 });
  await page.mouse.up();
  await page.route('**/api/auth', async (route) => {
    if (route.request().postDataJSON().operation === 'ReverseCheckoutLocation')
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ data: { reverseLocation: 'اردکان، خیابان نمونه، پلاک ۱۲' } }),
      });
    await route.continue();
  });
  await page.getByRole('button', { name: 'دریافت نشانی پیشنهادی', exact: true }).click();
  await expect(page.getByLabel('نشانی کامل', { exact: true })).toHaveValue(
    'اردکان، خیابان نمونه، پلاک ۱۲',
  );
  await page.screenshot({ path: '/tmp/behjati-phase6-address-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'ذخیره نشانی', exact: true }).click();
  await expect(page.getByRole('button', { name: 'ثبت سفارش', exact: true })).toBeEnabled();
  const user = await db.user.findUniqueOrThrow({ where: { phone: mobile } });
  const address = await db.address.findFirstOrThrow({ where: { userId: user.id } });
  assert.equal(address.postalCode, '1234567890');
  assert.ok(address.latitude !== 32.312);
  await page.getByRole('button', { name: 'ویرایش خانه', exact: true }).click();
  await page.getByLabel('عنوان نشانی', { exact: true }).fill('خانه جدید');
  await page.getByRole('button', { name: 'ذخیره نشانی', exact: true }).click();
  await expect(page.getByText('خانه جدید · پیش‌فرض', { exact: true })).toBeVisible();
  await page.getByLabel('کد تخفیف', { exact: true }).fill('INVALID-COUPON');
  await page.getByRole('button', { name: 'اعمال', exact: true }).click();
  await expect(page.locator('main [role="alert"]')).toContainText('کد تخفیف معتبر نیست');
  await expect(page.getByRole('button', { name: 'ثبت سفارش', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'حذف کد تخفیف', exact: true }).click();
  await expect(page.getByRole('button', { name: 'ثبت سفارش', exact: true })).toBeEnabled();
  await page.getByLabel('کد تخفیف', { exact: true }).fill('DEV10');
  await page.getByRole('button', { name: 'اعمال', exact: true }).click();
  await expect(page.getByText('۲۸۰٬۵۰۰ تومان', { exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/behjati-phase6-checkout-mobile.png', fullPage: true });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'ثبت سفارش', exact: true })).toBeEnabled();
  await page.getByLabel('کد تخفیف', { exact: true }).fill('DEV10');
  await page.getByRole('button', { name: 'اعمال', exact: true }).click();
  await expect(page.getByText('۲۸۰٬۵۰۰ تومان', { exact: true })).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Checkout overflow at ${width}`,
    );
  }
  await page.screenshot({ path: '/tmp/behjati-phase6-checkout-desktop.png', fullPage: true });
  let lostResponse = false;
  let creationCount = 0;
  await page.route('**/api/auth', async (route) => {
    const body = route.request().postDataJSON();
    if (body.operation === 'CreateCheckoutOrder') {
      creationCount++;
      if (!lostResponse) {
        lostResponse = true;
        await route.fetch();
        return route.abort('failed');
      }
    }
    await route.fallback();
  });
  await page.getByRole('button', { name: 'ثبت سفارش', exact: true }).click();
  await expect(page.locator('main [role="alert"]')).toContainText('ارتباط برقرار نشد');
  assert.equal(await db.order.count({ where: { userId: user.id } }), 1);
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('behjati-guest-cart-v1')).state.items['halva-500'],
    ),
    1,
  );
  await page.getByRole('button', { name: 'ثبت سفارش', exact: true }).click();
  await expect(page).toHaveURL(/\/checkout\/order\//);
  await expect(page.getByRole('heading', { name: 'سفارش شما ثبت شد' })).toBeVisible();
  await expect(page.getByText('در انتظار پرداخت', { exact: true })).toBeVisible();
  assert.equal(creationCount, 2);
  assert.equal(await db.order.count({ where: { userId: user.id } }), 1);
  assert.equal(
    Object.keys(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem('behjati-guest-cart-v1')).state.items,
      ),
    ).length,
    0,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/tmp/behjati-phase6-receipt-mobile.png', fullPage: true });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'سفارش شما ثبت شد' })).toBeVisible();
  await goto('/shop');
  await page.getByRole('button', { name: 'افزودن حلواارده سنتی به سبد خرید' }).click();
  await goto('/checkout');
  await expect(page.getByRole('button', { name: 'ثبت سفارش', exact: true })).toBeEnabled();
  lostResponse = false;
  await page.getByRole('button', { name: 'ثبت سفارش', exact: true }).click();
  await expect(page.locator('main [role="alert"]')).toContainText('ارتباط برقرار نشد');
  assert.equal(await db.order.count({ where: { userId: user.id } }), 2);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/checkout\/order\//);
  await expect(page.getByRole('heading', { name: 'سفارش شما ثبت شد' })).toBeVisible();
  assert.equal(await db.order.count({ where: { userId: user.id } }), 2);
  assert.equal(
    Object.keys(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem('behjati-guest-cart-v1')).state.items,
      ),
    ).length,
    0,
  );
  let unavailable = true;
  await page.route('**/api/auth', async (route) => {
    if (unavailable && route.request().postDataJSON().operation === 'RefreshUserSession') {
      unavailable = false;
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [
            { message: 'سرویس موقتاً در دسترس نیست.', extensions: { code: 'SERVICE_UNAVAILABLE' } },
          ],
        }),
      });
    }
    await route.fallback();
  });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('main [role="alert"]')).toContainText('سرویس موقتاً در دسترس نیست');
  await page.getByRole('button', { name: 'تلاش دوباره', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'سفارش شما ثبت شد' })).toBeVisible();
  assert.deepEqual(errors, []);
  console.log(
    'Checkout UI passed: guest login return, fixed Persian OTP, address create/edit, map click/drag, denied/allowed geolocation, reverse address, discount validation/removal, backend summary, reload, 320/390/768/1440, lost-response idempotent retry, pending-payment receipt and cart clear only after confirmed order.',
  );
} finally {
  await browser?.close();
  await cleanup();
}
