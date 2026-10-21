import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';

const base = process.env.ADMIN_PREVIEW_URL ?? 'http://localhost:3001';
const date = new Date().toISOString();
const owner = {
  id: 'cards-owner',
  email: 'owner@example.test',
  role: 'OWNER',
  permissions: [],
  isActive: true,
  gatewayTestEnabled: false,
};
const staff = {
  ...owner,
  id: 'cards-staff',
  email: 'colleague-with-a-long-address-for-layout-check@example.test',
  role: 'STAFF',
  permissions: ['ORDERS', 'PRODUCTS', 'TICKETS', 'REVIEWS'],
};
const category = { id: 'cards-category', title: 'فرآورده‌های کنجدی' };
const product = {
  id: 'cards-product',
  slug: 'cards-product',
  title: 'ارده سنتی بهجتی با عنوان طولانی برای بررسی نمایش در کارت',
  shortDescription: '',
  description: '',
  price: 123456789,
  weight: '۵۰۰ گرم',
  isActive: true,
  badge: null,
  discountPercent: null,
  discountTitle: null,
  discountStartsAt: null,
  discountEndsAt: null,
  createdAt: date,
  updatedAt: date,
  category,
  images: [{ id: 'cards-image', url: '/images/products/tahini-blue.webp', alt: 'ارده' }],
};
const user = {
  id: 'cards-user',
  firstName: 'مشتری با نام و نام خانوادگی طولانی',
  lastName: 'برای بررسی چیدمان',
  phone: '09123456789',
  email: null,
  createdAt: date,
  ordersCount: 12,
  totalOrdersValue: 123456789,
  acquisitionSource: 'WEBSITE',
  salesChannels: ['WEBSITE', 'INSTAGRAM'],
};
const order = {
  id: 'cards-order',
  number: 1240,
  salesChannel: 'WEBSITE',
  shippingMethod: 'POST',
  offlinePaidAmount: 0,
  status: 'PROCESSING',
  total: 250000,
  createdAt: date,
  user,
  address: {
    title: 'خانه',
    recipientName: 'گیرنده سفارش',
    recipientPhone: user.phone,
    province: 'یزد',
    city: 'اردکان',
    postalAddress: 'نشانی ثبت‌شده هنگام خرید',
    postalCode: '1234567890',
    latitude: null,
    longitude: null,
  },
};
const ticket = {
  id: 'cards-ticket',
  subject: 'درخواست پیگیری سفارش و زمان آماده‌سازی برای ارسال',
  status: 'OPEN',
  orderNumber: 1240,
  customerName: 'مشتری بهجتی',
  createdAt: date,
  updatedAt: date,
  messages: [
    {
      id: 'cards-message',
      body: 'لطفاً سفارش را بررسی کنید.',
      createdAt: date,
      fromSupport: false,
    },
  ],
};
let reviews = [
  {
    id: 'cards-review',
    productId: product.id,
    productTitle: product.title,
    authorName: user.firstName,
    rating: 5,
    body: 'نظر مشتری برای بررسی کارت ' + 'متن‌طولانی‌بدون‌فاصله'.repeat(12),
    status: 'PENDING',
    createdAt: date,
    updatedAt: date,
  },
];
const coupon = {
  id: 'cards-coupon',
  code: 'BEHJATI-WELCOME-CARD-LAYOUT',
  type: 'PERCENT',
  value: 10,
  minOrderAmount: 100000,
  maxDiscountAmount: null,
  startsAt: date,
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
  usageLimit: 100,
  usageCount: 12,
  isActive: true,
  updatedAt: date,
};
const report = {
  from: date.slice(0, 10),
  to: date.slice(0, 10),
  ordersCount: 12,
  orderValue: 123456789,
  averageOrderValue: 10288065,
  revenue: 250000,
  bankRevenue: 250000,
  offlineRevenue: 0,
  statuses: [{ status: 'PROCESSING', count: 12 }],
  daily: Array.from({ length: 21 }, (_, index) => ({
    date: new Date(Date.now() - index * 86400000).toISOString().slice(0, 10),
    ordersCount: 12,
    orderValue: 123456789,
    revenue: 250000,
  })),
};
const session = {
  admin: owner,
  accessToken: 'browser-fixture-only',
  accessExpiresAt: new Date(Date.now() + 3600000).toISOString(),
};
const paged = (items) => ({ items, total: items.length, page: 1, pageSize: 20, totalPages: 1 });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox'],
});
async function setup(page) {
  const requests = [];
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/api/admin', (route) => {
    const { query, variables } = route.request().postDataJSON();
    const op = query.match(/(?:query|mutation)\s+(\w+)/)?.[1];
    requests.push({ op, input: variables.input });
    const results = {
      AdminMe: { adminMe: owner },
      AdminRefresh: { adminRefresh: session },
      AdminProducts: { adminProducts: paged([product]), categories: [category] },
      AdminUsers: { adminUsers: paged([user]) },
      AdminOrders: { adminOrders: paged([order]) },
      AdminReport: { adminReport: report },
      AdminTickets: { adminTickets: paged([ticket]) },
      AdminReviews: { adminReviews: paged(reviews) },
      AdminCoupons: { adminCoupons: [coupon] },
      AdminAccounts: { adminAccounts: [owner, staff] },
      AdminDashboard: {
        adminDashboard: {
          ...report,
          channelMetrics: ['WEBSITE', 'INSTAGRAM', 'IN_PERSON'].map((salesChannel) => ({
            salesChannel,
            customersCount: 1,
            ordersCount: 1,
            orderValue: 250000,
            revenue: 250000,
          })),
          activeProductsCount: 1,
          customersCount: 1,
          recentUsers: [user],
          recentOrders: [order],
          topProducts: [],
          report,
        },
      },
    };
    if (!results[op]) errors.push(`Unexpected operation ${op}`);
    return route.fulfill({
      json: results[op]
        ? { data: results[op] }
        : { errors: [{ message: 'Unexpected test request' }] },
    });
  });
  return { requests, errors };
}
async function fits(page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
    .toBeLessThanOrEqual(1);
}
const panel = (page, label) => page.getByRole('region', { name: label, exact: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultNavigationTimeout(20000);
  page.setDefaultTimeout(12000);
  const state = await setup(page);
  await page.goto(base + '/admin/products');
  const categoryTrigger = page.getByRole('button', { name: 'دسته‌بندی', exact: true });
  await expect(categoryTrigger).toHaveAttribute('aria-expanded', 'false');
  await categoryTrigger.hover();
  await expect(panel(page, 'دسته‌بندی')).toBeVisible();
  // Crossing into the popup must keep it open. One hover group at a time.
  await panel(page, 'دسته‌بندی').getByRole('button', { name: category.title, exact: true }).hover();
  await expect(categoryTrigger).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: 'وضعیت محصول', exact: true }).hover();
  await expect(panel(page, 'وضعیت محصول')).toBeVisible();
  await expect(categoryTrigger).toHaveAttribute('aria-expanded', 'false');
  await panel(page, 'وضعیت محصول').getByRole('button', { name: 'غیرفعال', exact: true }).click();
  await expect
    .poll(() => state.requests.filter((r) => r.op === 'AdminProducts').at(-1)?.input.active)
    .toBe(false);
  await expect(panel(page, 'وضعیت محصول')).toBeHidden();
  await categoryTrigger.hover();
  await panel(page, 'دسته‌بندی').getByRole('button', { name: category.title, exact: true }).click();
  await expect
    .poll(() => state.requests.filter((r) => r.op === 'AdminProducts').at(-1)?.input.categoryId)
    .toBe(category.id);
  await page.getByRole('button', { name: 'مرتب‌سازی محصولات', exact: true }).hover();
  await panel(page, 'مرتب‌سازی محصولات')
    .getByRole('button', { name: 'قیمت کمتر', exact: true })
    .click();
  await expect
    .poll(() => state.requests.filter((r) => r.op === 'AdminProducts').at(-1)?.input.sort)
    .toBe('PRICE_ASC');
  await categoryTrigger.focus();
  await page.keyboard.press('ArrowDown');
  await expect(
    panel(page, 'دسته‌بندی').getByRole('button', { name: 'همه دسته‌ها', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(categoryTrigger).toBeFocused();
  await expect(categoryTrigger).toHaveAttribute('aria-expanded', 'false');
  await categoryTrigger.hover();
  await page.mouse.move(5, 5);
  await expect(panel(page, 'دسته‌بندی')).toBeHidden();
  await page.getByRole('button', { name: 'جستجوی محصول', exact: true }).hover();
  await panel(page, 'جستجوی محصول').getByRole('searchbox').fill('ارده');
  await panel(page, 'جستجوی محصول').getByRole('searchbox').press('Enter');
  await expect
    .poll(() => state.requests.filter((r) => r.op === 'AdminProducts').at(-1)?.input.search)
    .toBe('ارده');
  await page.keyboard.press('Escape');
  const paths = [
    'orders',
    'products',
    'users',
    'tickets',
    'reviews',
    'coupons',
    'accounts',
    'reports',
    '',
  ];
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of paths) {
      console.log('Checking filter layout', path || 'dashboard', width);
      await page.goto(`${base}/admin/${path}`);
      const bar = page.locator('[data-admin-filter-bar]');
      await expect(bar).toBeVisible();
      await fits(page);
      if (width === 1440)
        assert.ok(
          await bar.evaluate((el) => el.getBoundingClientRect().height <= 66),
          `${path}: compact single-row toolbar`,
        );
      const trigger = bar.locator('button[aria-expanded]').first();
      await trigger.hover();
      const id = await trigger.getAttribute('aria-controls');
      const popup = page.locator(`[id="${id}"]`);
      await expect(popup).toBeVisible();
      await fits(page);
      await expect
        .poll(
          async () => {
            const box = await popup.boundingBox();
            if (!box || box.x < -1 || box.x + box.width > width + 1) {
              console.log(path, width, box);
              await page.screenshot({ path: '/tmp/behjati-hover-filter-failure.png' });
            }
            return !!box && box.x >= -1 && box.x + box.width <= width + 1;
          },
          { message: `${path}: popup fits ${width}`, timeout: 5000 },
        )
        .toBe(true);
      await page.keyboard.press('Escape');
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + '/admin/orders');
  await page.getByRole('button', { name: 'محل خرید', exact: true }).hover();
  await panel(page, 'محل خرید').getByRole('button', { name: 'اینستاگرام', exact: true }).click();
  await expect(page).toHaveURL(/salesChannel=INSTAGRAM/);
  await page.getByRole('button', { name: 'شیوه ارسال', exact: true }).hover();
  await panel(page, 'شیوه ارسال').getByRole('button', { name: 'تیپاکس', exact: true }).click();
  await expect(page).toHaveURL(/shippingMethod=TIPAX/);
  await page.getByRole('button', { name: 'وضعیت سفارش', exact: true }).hover();
  await expect(panel(page, 'وضعیت سفارش')).toBeVisible();
  await page.screenshot({ path: '/tmp/behjati-hover-filters-desktop.png' });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'پاک کردن فیلترها', exact: true }).click();
  await expect(page).not.toHaveURL(/salesChannel=|shippingMethod=/);
  await page.goto(base + '/admin/reports');
  await page.getByRole('button', { name: 'وضعیت گزارش', exact: true }).hover();
  await panel(page, 'وضعیت گزارش').getByRole('button', { name: 'لغوشده', exact: true }).click();
  await expect
    .poll(() => state.requests.filter((r) => r.op === 'AdminReport').at(-1)?.input.status)
    .toBe('CANCELED');
  // Touch devices have no hover: first tap opens, selection applies, outside tap closes.
  const touch = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobile = await touch.newPage();
  const mobileState = await setup(mobile);
  await mobile.goto(base + '/admin/orders');
  const trigger = mobile.getByRole('button', { name: 'محل خرید', exact: true });
  await trigger.tap();
  await expect(panel(mobile, 'محل خرید')).toBeVisible();
  await panel(mobile, 'محل خرید').getByRole('button', { name: 'حضوری', exact: true }).tap();
  await expect(mobile).toHaveURL(/salesChannel=IN_PERSON/);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.tap();
  await expect(panel(mobile, 'محل خرید')).toBeVisible();
  await mobile.screenshot({ path: '/tmp/behjati-hover-filters-mobile.png' });
  await mobile.getByRole('heading', { name: 'سفارش‌ها', exact: true }).tap();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await fits(mobile);
  assert.deepEqual(state.errors, []);
  assert.deepEqual(mobileState.errors, []);
  console.log(
    'Admin filters passed: desktop hover, popup crossing/leave/switch, direct options and payloads, keyboard ArrowDown/Escape/focus, touch open/select/outside, compact toolbar and 320–1440px fit across nine pages. All API calls intercepted.',
  );
} finally {
  await browser.close();
}
