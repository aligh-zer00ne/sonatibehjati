import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { startAPI, startStorefront, origin, phone, db, cleanup } from './auth-harness.mjs';
let browser;
try {
  await startAPI({ environment: 'development', developmentCode: '12345' });
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
  const goto = (path) => page.goto(origin + path, { waitUntil: 'networkidle' });
  for (const path of [
    '/account/profile',
    '/account/addresses',
    '/account/orders',
    '/account/orders/unknown',
  ]) {
    await goto(path);
    await expect(page).toHaveURL(origin + '/login?next=' + encodeURIComponent(path));
  }
  await goto('/account/profile');
  const mobile = phone();
  await page.getByLabel('شماره موبایل', { exact: true }).fill(mobile);
  await page.getByRole('button', { name: 'دریافت کد ورود' }).click();
  await page.getByLabel('کد ورود', { exact: true }).fill('۱۲۳۴۵');
  await page.getByRole('button', { name: 'تأیید و ورود' }).click();
  await expect(page).toHaveURL(origin + '/account/profile');
  await expect(page.getByLabel('شماره موبایل تأییدشده')).toHaveAttribute('readonly', '');
  await page.getByLabel('نام', { exact: true }).fill('علی');
  await page.getByLabel('نام خانوادگی', { exact: true }).fill('غفوری');
  await page.getByLabel('ایمیل (اختیاری)', { exact: true }).fill('User@Example.COM');
  let profileFailure = 2;
  const profileRoute = async (route) => {
    if (profileFailure && route.request().postDataJSON().operation === 'UpdateAccountProfile') {
      profileFailure--;
      if (profileFailure === 0)
        return route.fulfill({ status: 502, contentType: 'text/plain', body: 'Bad gateway' });
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
    await route.continue();
  };
  await page.route('**/api/auth', profileRoute);
  await page.getByRole('button', { name: 'ذخیره پروفایل' }).click();
  await expect(page.locator('main [role="alert"]')).toContainText('سرویس موقتاً');
  await page.getByRole('button', { name: 'ذخیره پروفایل' }).click();
  await expect(page.locator('main [role="alert"]')).toContainText('سرویس موقتاً در دسترس نیست');
  await page.getByRole('button', { name: 'ذخیره پروفایل' }).click();
  await expect(page.getByText('پروفایل ذخیره شد.', { exact: true })).toBeVisible();
  await page.unroute('**/api/auth', profileRoute);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByLabel('نام', { exact: true })).toHaveValue('علی');
  await expect(page.getByLabel('ایمیل (اختیاری)', { exact: true })).toHaveValue('user@example.com');
  await page.getByLabel('ایمیل (اختیاری)', { exact: true }).fill('');
  await page.getByRole('button', { name: 'ذخیره پروفایل' }).click();
  await expect(page.getByText('پروفایل ذخیره شد.', { exact: true })).toBeVisible();
  const user = await db.user.findUniqueOrThrow({ where: { phone: mobile } });
  assert.equal(user.email, null);
  assert.equal(user.phone, mobile);
  await goto('/account/orders');
  await expect(page.getByRole('heading', { name: 'هنوز سفارشی ثبت نکرده‌اید' })).toBeVisible();
  await goto('/account/addresses');
  await expect(page.getByRole('heading', { name: 'هنوز نشانی ندارید' })).toBeVisible();
  const addAddress = async (title) => {
    await page.getByRole('button', { name: 'افزودن نشانی', exact: true }).click();
    await page.getByLabel('عنوان نشانی', { exact: true }).fill(title);
    await page.getByLabel('نام گیرنده', { exact: true }).fill('گیرنده اولیه');
    await page.getByLabel('استان', { exact: true }).fill('یزد');
    await page.getByLabel('شهر', { exact: true }).fill('اردکان');
    await page.getByLabel('نشانی کامل', { exact: true }).fill('خیابان اولیه، کوچه نمونه، پلاک ۱۰');
    await page.getByLabel('کد پستی', { exact: true }).fill('۱۲۳۴۵۶۷۸۹۰');
    await expect(page.getByRole('region', { name: 'نقشه انتخاب موقعیت نشانی' })).toBeVisible();
    await page.getByRole('button', { name: 'ذخیره نشانی', exact: true }).click();
    await expect(page.getByRole('heading', { name: new RegExp(title) })).toBeVisible();
  };
  await addAddress('خانه');
  await addAddress('محل کار');
  await page.getByRole('button', { name: 'پیش‌فرض کردن محل کار', exact: true }).click();
  await expect(page.getByRole('button', { name: 'پیش‌فرض کردن خانه', exact: true })).toBeVisible();
  assert.equal(await db.address.count({ where: { userId: user.id, isDefault: true } }), 1);
  await page.getByRole('button', { name: 'ویرایش خانه', exact: true }).click();
  await page.getByLabel('عنوان نشانی', { exact: true }).fill('خانه جدید');
  await page.getByRole('button', { name: 'ذخیره نشانی', exact: true }).click();
  await expect(page.getByRole('button', { name: 'حذف خانه جدید', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'حذف محل کار', exact: true }).click();
  await page.getByRole('button', { name: 'تأیید حذف', exact: true }).click();
  await expect(page.getByRole('heading', { name: /خانه جدید.*پیش‌فرض/ })).toBeVisible();
  const address = await db.address.findFirstOrThrow({ where: { userId: user.id } });
  const product = await db.product.findFirstOrThrow();
  const snapshot = {
    title: address.title,
    recipientName: address.recipientName,
    recipientPhone: address.recipientPhone,
    province: address.province,
    city: address.city,
    postalAddress: address.postalAddress,
    postalCode: address.postalCode,
  };
  let latest;
  for (let i = 0; i < 12; i++)
    latest = await db.order.create({
      data: {
        userId: user.id,
        addressId: address.id,
        addressSnapshot: snapshot,
        createdAt: new Date(Date.UTC(2026, 8, 1) + i * 1000),
        status: i % 2 ? 'PENDING_PAYMENT' : 'DELIVERED',
        subtotal: 200000,
        discount: 10000,
        shipping: 60000,
        total: 250000,
        items: {
          create: {
            productId: product.id,
            productTitle: 'عنوان هنگام خرید',
            productWeight: '۵۰۰ گرم',
            unitPrice: 100000,
            quantity: 2,
            lineTotal: 200000,
          },
        },
      },
    });
  await page.getByRole('button', { name: 'حذف خانه جدید', exact: true }).click();
  await page.getByRole('button', { name: 'تأیید حذف', exact: true }).click();
  await expect(page.locator('main [role="alert"]')).toContainText('قابل حذف نیست');
  await page.getByRole('button', { name: 'انصراف', exact: true }).click();
  await page.getByRole('button', { name: 'ویرایش خانه جدید', exact: true }).click();
  await page.getByLabel('نشانی کامل', { exact: true }).fill('نشانی تغییرکرده پس از ثبت سفارش');
  await page.getByRole('button', { name: 'ذخیره نشانی', exact: true }).click();
  await expect(
    page.getByText('یزد، اردکان، نشانی تغییرکرده پس از ثبت سفارش', { exact: true }),
  ).toBeVisible();
  let listFailure = true;
  const listRoute = async (route) => {
    if (listFailure && route.request().postDataJSON().operation === 'AccountOrders') {
      listFailure = false;
      return route.abort('failed');
    }
    await route.continue();
  };
  await page.route('**/api/auth', listRoute);
  await goto('/account/orders');
  await expect(page.locator('main [role="alert"]')).toContainText('ارتباط برقرار نشد');
  await page.getByRole('button', { name: 'تلاش دوباره', exact: true }).click();
  await expect(page.getByText('۱۲ سفارش', { exact: true })).toBeVisible();
  await page.unroute('**/api/auth', listRoute);
  await page.getByRole('button', { name: 'بعدی', exact: true }).click();
  await expect(page.getByText('۲ از ۲', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'بعدی', exact: true })).toBeDisabled();
  await page.getByLabel('وضعیت', { exact: true }).selectOption('PENDING_PAYMENT');
  await expect(page.getByText('۶ سفارش', { exact: true })).toBeVisible();
  await page.getByLabel('وضعیت', { exact: true }).selectOption('CANCELED');
  await expect(page.getByRole('heading', { name: 'سفارشی با این وضعیت ندارید' })).toBeVisible();
  await page.getByLabel('وضعیت', { exact: true }).selectOption('');
  await page.locator(`a[href="/account/orders/${latest.id}"]`).click();
  await expect(page.getByRole('heading', { name: 'جزئیات سفارش', level: 1 })).toBeVisible();
  await expect(page.getByText('عنوان هنگام خرید', { exact: true })).toBeVisible();
  await expect(
    page.getByText('یزد، اردکان، ' + snapshot.postalAddress, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('۲۵۰٬۰۰۰ تومان', { exact: true })).toBeVisible();
  await expect(page.getByText('۱۰۰٬۰۰۰ تومان', { exact: false })).toBeVisible();
  await expect(
    page.getByText('این سفارش در انتظار پرداخت است؛ پرداخت آنلاین هنوز فعال نیست.', {
      exact: true,
    }),
  ).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText('عنوان هنگام خرید', { exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.screenshot({ path: '/tmp/behjati-phase7-order-mobile.png', fullPage: true });
  for (const path of [
    '/account',
    '/account/profile',
    '/account/addresses',
    '/account/orders',
    `/account/orders/${latest.id}`,
  ]) {
    await goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.locator('nav[aria-label="ناوبری موبایل"] a[href="/account"]'),
    ).toHaveAttribute('aria-current', 'page');
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Account overflow: ${path} at ${width}`,
      );
    }
  }
  await goto('/account');
  await page.screenshot({ path: '/tmp/behjati-phase7-account-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/tmp/behjati-phase7-account-mobile.png', fullPage: true });
  const tab = await context.newPage();
  tab.on('pageerror', (error) => errors.push(error.message));
  await tab.goto(origin + '/account', { waitUntil: 'networkidle' });
  await expect(tab.getByText('علی غفوری،', { exact: true })).toBeVisible();
  await goto('/account/orders/not-owned');
  await expect(page.locator('main [role="alert"]')).toContainText('سفارش یافت نشد');
  await page.getByRole('button', { name: 'خروج از حساب', exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(tab).toHaveURL(/\/login/);
  assert.deepEqual(errors, []);
  console.log(
    'Account UI passed: private routes and login return, profile save/error/retry/reload and verified phone, address CRUD/defaults/map reuse/used restriction, order pagination/status/empty/error/retry, immutable snapshot detail/reload, noindex, responsive 320/390/768/1440, multi-tab logout and no runtime errors.',
  );
} finally {
  await browser?.close();
  await cleanup();
}
