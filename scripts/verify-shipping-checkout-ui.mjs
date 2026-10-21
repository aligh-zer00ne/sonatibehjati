import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox'],
});
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  page.setDefaultNavigationTimeout(30000);
  await page
    .context()
    .addCookies([
      { name: 'behjati_user_refresh', value: 'browser-fixture-only', url: 'http://localhost:3000' },
    ]);
  const errors = [];
  const methods = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() =>
    localStorage.setItem(
      'behjati-guest-cart-v1',
      JSON.stringify({ state: { items: { 'shipping-fixture': 2 }, favorites: [] }, version: 0 }),
    ),
  );
  const user = {
    id: 'shipping-fixture-user',
    phone: '09123456789',
    firstName: 'مشتری',
    lastName: 'آزمون',
    email: null,
  };
  const address = {
    id: 'shipping-address',
    title: 'خانه',
    recipientName: 'گیرنده',
    recipientPhone: user.phone,
    province: 'یزد',
    city: 'اردکان',
    postalAddress: 'خیابان آزمون پلاک ۱۲',
    postalCode: '1234567890',
    latitude: null,
    longitude: null,
    isDefault: true,
  };
  await page.route('**/api/auth', (route) => {
    const { operation, variables } = route.request().postDataJSON();
    let data;
    if (operation === 'CurrentUser') data = { me: user };
    else if (operation === 'RefreshUserSession')
      data = {
        refreshToken: {
          user,
          accessToken: 'fixture',
          accessExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
      };
    else if (operation === 'MyAddresses') data = { myAddresses: [address] };
    else if (operation === 'CheckoutQuote') {
      methods.push(variables.input.shippingMethod);
      data = {
        checkoutQuote: {
          addressId: address.id,
          items: [
            {
              productId: 'shipping-fixture',
              title: 'ارده',
              weight: '۵۰۰ گرم',
              quantity: 2,
              unitPrice: 100000,
              lineTotal: 200000,
              imageUrl: null,
            },
          ],
          subtotal: 200000,
          discount: 0,
          shipping: 70000,
          total: 270000,
          shippingMethod: variables.input.shippingMethod,
          shippingWeightGrams: 1000,
        },
      };
    } else if (operation === 'AccountOrderDetails')
      data = {
        myOrder: {
          id: 'offline-order',
          number: 1,
          status: 'PENDING_PAYMENT',
          createdAt: new Date().toISOString(),
          salesChannel: 'INSTAGRAM',
          shippingMethod: 'TIPAX',
          offlinePaidAmount: 50000,
          paidAt: null,
          payments: [],
          address,
          items: [],
          subtotal: 200000,
          discount: 0,
          shipping: 70000,
          total: 270000,
        },
      };
    else if (operation === 'PaymentAvailability') data = { paymentAvailable: true };
    else {
      errors.push(`Unexpected operation: ${operation}`);
      return route.fulfill({ json: { errors: [{ message: 'Unexpected test operation' }] } });
    }
    return route.fulfill({ json: { data } });
  });
  await page.goto('http://localhost:3000/checkout');
  await expect(page.getByRole('group', { name: 'روش ارسال سفارش', exact: true })).toBeVisible();
  for (const [method, label] of [
    ['POST', 'پست'],
    ['TIPAX', 'تیپاکس'],
    ['COURIER', 'پیک'],
  ]) {
    await page.getByRole('radio', { name: label, exact: true }).check();
    await expect(page.getByRole('radio', { name: label, exact: true })).toBeChecked();
    await expect.poll(() => methods.at(-1)).toBe(method);
    await expect(page.getByText('۲۷۰٬۰۰۰ تومان', { exact: true })).toBeVisible();
  }
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.screenshot({ path: '/tmp/behjati-shipping-checkout-mobile.png', fullPage: true });
  await page.goto('http://localhost:3000/account/orders/offline-order');
  await expect(page.getByText(/دریافت فروشگاه:/)).toBeVisible();
  await expect(page.getByText(/مانده:/)).toBeVisible();
  await expect(page.getByRole('button', { name: /پرداخت/ })).toHaveCount(0);
  assert.deepEqual(errors, []);
  console.log(
    'Shipping checkout UI passed: all three radio methods reach quote requests, fee/total display, 320–1440px fit and offline account receipts without an online bank action. API writes intercepted.',
  );
} finally {
  await browser.close();
}
