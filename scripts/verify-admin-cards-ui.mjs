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
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const errors = [];
  const mutations = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/api/admin', async (route) => {
    const { query, variables } = route.request().postDataJSON();
    const operation = query.match(/(?:query|mutation)\s+(\w+)/)?.[1];
    let data;
    switch (operation) {
      case 'AdminRefresh':
        data = { adminRefresh: session };
        break;
      case 'AdminMe':
        data = { adminMe: owner };
        break;
      case 'AdminProducts':
        data = { adminProducts: paged([product]), categories: [category] };
        break;
      case 'AdminUsers':
        data = { adminUsers: paged([user]) };
        break;
      case 'AdminOrders':
        data = { adminOrders: paged([order]) };
        break;
      case 'AdminReport':
        data = { adminReport: report };
        break;
      case 'AdminReviews':
        data = {
          adminReviews: paged(
            reviews.filter(
              (review) => !variables.input.status || review.status === variables.input.status,
            ),
          ),
        };
        break;
      case 'AdminTickets':
        data = { adminTickets: paged([ticket]) };
        break;
      case 'AdminTicket':
        data = { adminTicket: ticket };
        break;
      case 'AdminCoupons':
        data = { adminCoupons: [coupon] };
        break;
      case 'AdminAccounts':
        data = { adminAccounts: [owner, staff] };
        break;
      case 'AdminDashboard':
        data = {
          adminDashboard: {
            ...report,
            activeProductsCount: 1,
            customersCount: 1,
            channelMetrics: ['WEBSITE', 'INSTAGRAM', 'IN_PERSON'].map((salesChannel) => ({
              salesChannel,
              customersCount: 1,
              ordersCount: 1,
              orderValue: 250000,
              revenue: 250000,
            })),
            ordersToday: 1,
            ordersThisMonth: 12,
            recentUsers: [user],
            recentOrders: [order],
            topProducts: [
              {
                id: product.id,
                title: product.title,
                image: product.images[0].url,
                quantity: 2,
                orderValue: 250000,
              },
            ],
            report,
          },
        };
        break;
      case 'ModerateProductReview':
        mutations.push(operation);
        reviews = reviews.map((review) => ({ ...review, status: variables.status }));
        data = { moderateProductReview: reviews[0] };
        break;
      default:
        errors.push(`Unhandled operation ${operation}`);
        return route.fulfill({
          json: { errors: [{ message: 'Unexpected browser fixture operation' }] },
        });
    }
    await route.fulfill({ json: { data } });
  });
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
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      await page.goto(`${base}/admin/${path}`, { waitUntil: 'networkidle' });
      await expect(page.locator('[data-admin-record]').first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${path || 'dashboard'}: page fits ${width}px`,
      );
      assert.ok(
        await page.evaluate(() =>
          Array.from(document.querySelectorAll('[data-admin-record] *'))
            .filter((el) => el.getBoundingClientRect().width > 0)
            .every((el) => {
              const style = getComputedStyle(el);
              if (style.position === 'absolute' || style.position === 'fixed') return true;
              const box = el.getBoundingClientRect();
              const card = el.closest('[data-admin-record]').getBoundingClientRect();
              return box.left >= card.left - 1 && box.right <= card.right + 1;
            }),
        ),
        `${path || 'dashboard'}: card fields/actions fit ${width}px`,
      );
      assert.equal(await page.locator('main table').count(), 0);
      if (width === 390 || width === 1440)
        await page
          .locator('[data-admin-record]')
          .first()
          .screenshot({ path: `/tmp/behjati-brand-card-${path || 'dashboard'}-${width}.png` });
    }
  }
  await page.goto(base + '/admin/products');
  await page.getByRole('checkbox', { name: 'انتخاب همهٔ این صفحه', exact: true }).check();
  await expect(page.getByRole('button', { name: /تخفیف \/ جشنواره/ })).toBeEnabled();
  await page.getByRole('button', { name: /تخفیف \/ جشنواره/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').locator('.ant-modal-close').click();
  await page.goto(base + '/admin/coupons');
  await page
    .locator('[data-admin-record]')
    .getByRole('button', { name: 'ویرایش', exact: true })
    .click();
  await expect(page.getByRole('dialog', { name: 'ویرایش کد تخفیف', exact: true })).toBeVisible();
  await page.getByRole('dialog').locator('.ant-modal-close').click();
  await page.goto(base + '/admin/accounts');
  await page.getByRole('button', { name: 'تعیین دسترسی‌ها', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'انصراف', exact: true }).click();
  await page.goto(base + '/admin/tickets');
  await page.getByRole('button', { name: 'مشاهده و پاسخ', exact: true }).click();
  await expect(page.getByLabel('پاسخ پشتیبانی', { exact: true })).toBeVisible();
  await page.getByRole('dialog').locator('.ant-modal-close').click();
  await page.goto(base + '/admin/reviews');
  await page
    .locator('[data-admin-record]')
    .getByRole('button', { name: 'تأیید', exact: true })
    .click();
  await expect(page.locator('[data-admin-record]')).toHaveCount(0);
  assert.deepEqual(mutations, ['ModerateProductReview']);
  assert.deepEqual(errors, []);
  console.log(
    'Admin cards passed: nine pages, 320/390/768/1440px, long content, no tables/overflow, group selection, coupon editor, staff permissions, ticket reply and review moderation. All API calls intercepted; no real data/SMS/bank mutations.',
  );
} finally {
  await browser.close();
}
