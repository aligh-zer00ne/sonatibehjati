import { USER_REFRESH_COOKIE } from '@behjati/shared';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
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
import {
  createAdmin,
  createCustomer,
  cleanupAdmin,
  products,
  startAdmin,
  admins,
} from './admin-harness.mjs';
let browser;
const coupons = [];
try {
  await startAPI();
  await startStorefront();
  await startAdmin();
  const owner = await createAdmin();
  const customer = await createCustomer();
  const category = await db.category.findFirstOrThrow();
  const product = await db.product.create({
    data: {
      title: 'محصول پیش‌نمایش عملیاتی',
      slug: `ui-ops-${randomBytes(6).toString('hex')}`,
      price: 150000,
      weight: '۵۰۰ گرم',
      categoryId: category.id,
      shortDescription: 'معرفی محصول',
      description: 'توضیحات محصول',
      images: { create: { url: '/images/products/tahini-blue.webp', alt: 'ارده آزمون' } },
    },
  });
  products.add(product.id);
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  async function login(tab, email, password) {
    await tab.goto(adminOrigin + '/login');
    await tab.getByLabel('ایمیل مدیر', { exact: true }).fill(email);
    await tab.getByLabel('رمز ورود', { exact: true }).fill(password);
    await tab.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
    await expect(tab).toHaveURL(adminOrigin + '/admin');
  }
  await login(page, owner.email, owner.password);
  await page.goto(adminOrigin + `/admin/products/${product.id}/edit`);
  await page.getByLabel('عنوان محصول', { exact: true }).fill('نام تازهٔ محصول در پیش‌نمایش');
  await page.getByRole('button', { name: 'ذخیره محصول', exact: true }).click();
  await expect(page.getByText('محصول ذخیره شد.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'مشاهده در سایت', exact: true }).click();
  const preview = page.getByRole('dialog', { name: 'پیش‌نمایش محصول در سایت' });
  await expect(preview).toBeVisible();
  const iframe = preview.frameLocator('iframe');
  await expect(
    iframe.getByRole('heading', { name: 'نام تازهٔ محصول در پیش‌نمایش', exact: true }),
  ).toBeVisible();
  await preview.getByRole('button', { name: 'بستن', exact: true }).last().click();
  await page.goto(adminOrigin + '/admin/accounts');
  const staffEmail = `ui-staff-${randomBytes(5).toString('hex')}@example.test`;
  const staffPassword = randomBytes(20).toString('base64url');
  await page.getByLabel('ایمیل همکار', { exact: true }).fill(staffEmail);
  await page.getByLabel('رمز اولیه (حداقل ۱۲ نویسه)', { exact: true }).fill(staffPassword);
  for (const label of [
    'سفارش‌ها و چاپ',
    'نقشه سفارش‌ها',
    'محصولات و تخفیف محصول',
    'پشتیبانی و تیکت‌ها',
    'نظرات محصولات',
  ])
    await page.getByRole('checkbox', { name: label, exact: true }).check();
  await page.getByRole('button', { name: 'ساخت حساب همکار', exact: true }).click();
  await expect(page.getByText(staffEmail, { exact: true })).toBeVisible();
  const staff = await db.admin.findUniqueOrThrow({ where: { email: staffEmail } });
  admins.push(staff);
  await page.goto(adminOrigin + '/admin/coupons');
  await page.getByRole('button', { name: 'کد تخفیف جدید', exact: true }).click();
  const code = `UI-BF-${randomBytes(4).toString('hex').toUpperCase()}`;
  await page.getByLabel('کد (حروف انگلیسی و عدد)', { exact: true }).fill(code);
  await page.getByRole('button', { name: 'ذخیره کد', exact: true }).click();
  await expect(page.getByText(code, { exact: true })).toBeVisible();
  const coupon = await db.discountCode.findUniqueOrThrow({ where: { code } });
  coupons.push(coupon.id);
  assert.equal(coupon.type, 'PERCENT');
  await page.goto(adminOrigin + '/admin/users?search=' + customer.user.phone);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'خروجی اکسل مشتریان', exact: true }).click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'customers.xlsx');
  assert.equal(await download.failure(), null);
  const requested = await gql(keys.request, { input: { phone: customer.user.phone } });
  const session = await gql(keys.verify, verification(requested.data.requestOtp));
  assert.equal(session.errors, undefined);
  const refreshCookie = session.cookies
    .split('; ')
    .find((value) => value.startsWith(`${USER_REFRESH_COOKIE}=`));
  assert.ok(refreshCookie);
  const [cookieName, cookieValue] = refreshCookie.split('=');
  const customerContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await customerContext.addCookies([
    { name: cookieName, value: cookieValue, url: origin, httpOnly: true, sameSite: 'Lax' },
  ]);
  const shop = await customerContext.newPage();
  shop.on('pageerror', (e) => errors.push(e.message));
  await shop.goto(origin + '/account/support');
  await shop.getByRole('button', { name: 'تیکت جدید', exact: true }).click();
  await shop.getByLabel('موضوع', { exact: true }).fill('پیگیری سفارش مرورگر');
  await shop.getByLabel('توضیحات', { exact: true }).fill('لطفاً وضعیت ارسال را اعلام کنید.');
  await shop.getByRole('button', { name: 'ثبت تیکت', exact: true }).click();
  await expect(shop).toHaveURL(new RegExp('/account/support/[^/]+$'));
  const ticketId = shop.url().split('/').at(-1);
  await expect(shop.getByText('لطفاً وضعیت ارسال را اعلام کنید.', { exact: true })).toBeVisible();
  const staffContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const staffPage = await staffContext.newPage();
  staffPage.on('pageerror', (e) => errors.push(e.message));
  await staffPage.goto(adminOrigin + '/login');
  await staffPage.getByLabel('ایمیل مدیر', { exact: true }).fill(staffEmail);
  await staffPage.getByLabel('رمز ورود', { exact: true }).fill(staffPassword);
  await staffPage.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(staffPage).toHaveURL(adminOrigin + '/admin/orders');
  const nav = staffPage.locator('aside nav');
  for (const label of ['گزارش‌ها', 'مشتریان', 'کاربران پنل', 'کدهای تخفیف', 'داشبورد'])
    await expect(nav.getByRole('link', { name: label, exact: true })).toHaveCount(0);
  await expect(staffPage.getByRole('combobox', { name: 'فیلتر کاربر' })).toHaveCount(0);
  for (const path of ['users', 'reports', 'accounts', 'coupons']) {
    await staffPage.goto(adminOrigin + '/admin/' + path);
    await expect(staffPage).toHaveURL(adminOrigin + '/admin/orders');
  }
  await staffPage.goto(adminOrigin + '/admin/tickets');
  const row = staffPage.getByRole('article').filter({ hasText: 'پیگیری سفارش مرورگر' });
  await row.getByRole('button', { name: 'مشاهده و پاسخ', exact: true }).click();
  await staffPage.getByLabel('پاسخ پشتیبانی', { exact: true }).fill('سفارش شما آمادهٔ ارسال است.');
  await staffPage.getByRole('button', { name: 'ارسال پاسخ', exact: true }).click();
  await expect(staffPage.getByText('سفارش شما آمادهٔ ارسال است.', { exact: true })).toBeVisible();
  await shop.getByRole('button', { name: 'تازه‌سازی گفتگو', exact: true }).click();
  await expect(shop.getByText('سفارش شما آمادهٔ ارسال است.', { exact: true })).toBeVisible();
  assert.equal(
    (await db.supportTicket.findUniqueOrThrow({ where: { id: ticketId } })).status,
    'IN_PROGRESS',
  );
  await shop.goto(origin + '/product/' + product.slug);
  await shop.getByRole('tab', { name: 'نظرات', exact: true }).click();
  await shop.getByLabel('متن نظر', { exact: true }).fill('نظر مشتری برای تأیید در مرورگر');
  await shop.getByRole('button', { name: 'ثبت نظر', exact: true }).click();
  await expect(shop.getByText('وضعیت نظر شما: منتظر تأیید', { exact: true })).toBeVisible();
  const guest = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await guest.goto(origin + '/product/' + product.slug);
  await guest.getByRole('tab', { name: 'نظرات', exact: true }).click();
  await expect(guest.getByText('نظر مشتری برای تأیید در مرورگر', { exact: true })).toHaveCount(0);
  await staffPage.getByRole('dialog').locator('.ant-modal-close').click();
  await staffPage.goto(adminOrigin + '/admin/reviews');
  const reviewRow = staffPage
    .getByRole('article')
    .filter({ hasText: 'نظر مشتری برای تأیید در مرورگر' });
  await reviewRow.getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect(reviewRow).toHaveCount(0);
  await guest.reload();
  await guest.getByRole('tab', { name: 'نظرات', exact: true }).click();
  await expect(guest.getByText('نظر مشتری برای تأیید در مرورگر', { exact: true })).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of [
      'accounts',
      'coupons',
      'tickets',
      'reviews',
      `products/${product.id}/edit`,
    ]) {
      await page.goto(adminOrigin + '/admin/' + path, { waitUntil: 'networkidle' });
      const bounds = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
        inset: document.querySelector('[data-admin-page]').getBoundingClientRect().left,
      }));
      assert.ok(bounds.scroll <= bounds.width + 1, `overflow ${width} ${path}`);
      assert.ok(bounds.inset >= 15, `inset ${width} ${path}`);
      if (width === 390 || width === 1440)
        await page.screenshot({
          path: `/tmp/behjati-operations-${path.split('/')[0]}-${width}.png`,
          fullPage: true,
        });
    }
  }
  assert.deepEqual(errors, []);
  console.log(
    'Saved-product iframe, owner/staff workflows, coupons, Excel download, support conversation, moderated reviews and responsive layouts passed.',
  );
} finally {
  await browser?.close();
  await db.discountCode.deleteMany({ where: { id: { in: coupons } } });
  await cleanupAdmin();
}
