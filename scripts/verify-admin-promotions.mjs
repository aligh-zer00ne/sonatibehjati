import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import { startAPI, adminOrigin, db, gql } from './auth-harness.mjs';
import {
  createAdmin,
  loginAdmin,
  adminGql,
  startAdmin,
  products,
  cleanupAdmin,
} from './admin-harness.mjs';
const mutation =
  'mutation($input:AdminPromotionInput!,$products:[AdminPromotionTargetInput!]!){setAdminPromotion(input:$input,products:$products){id discountPercent promotion{price percent} updatedAt}}';
let browser;
try {
  await startAPI();
  await startAdmin();
  const admin = await createAdmin();
  const category = await db.category.findFirstOrThrow();
  const suffix = randomBytes(6).toString('hex');
  const fixtures = [];
  for (let i = 0; i < 2; i++) {
    const product = await db.product.create({
      data: {
        title: `جشنواره آزمون ${suffix} ${i}`,
        slug: `festival-test-${suffix}-${i}`,
        price: 100000,
        weight: '۵۰۰ گرم',
        categoryId: category.id,
        shortDescription: '',
        description: '',
        images: { create: { url: '/images/products/traditional-halva-500.webp', alt: 'آزمون' } },
      },
    });
    products.add(product.id);
    fixtures.push(product);
  }
  const now = Date.now();
  const input = {
    discountPercent: 20,
    discountTitle: 'جشنواره آزمون',
    discountStartsAt: new Date(now - 1000).toISOString(),
    discountEndsAt: new Date(now + 86400000).toISOString(),
  };
  const targets = fixtures.map((product) => ({
    id: product.id,
    expectedUpdatedAt: product.updatedAt.toISOString(),
  }));
  const denied = await adminGql(mutation, { input, products: targets });
  assert.equal(denied.errors?.[0]?.extensions?.code, 'UNAUTHENTICATED');
  const session = await loginAdmin(admin);
  assert.ok(session.cookies);
  const conflict = await adminGql(
    mutation,
    {
      input,
      products: targets.map((target, index) =>
        index ? { ...target, expectedUpdatedAt: new Date(0).toISOString() } : target,
      ),
    },
    session.cookies,
  );
  assert.equal(conflict.errors?.[0]?.extensions?.code, 'REQUEST_CONFLICT');
  assert.ok(
    (
      await db.product.findMany({ where: { id: { in: fixtures.map((product) => product.id) } } })
    ).every((product) => product.discountPercent === null),
    'A conflicting festival must roll back all updates',
  );
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(adminOrigin + '/login', { waitUntil: 'networkidle' });
  await page.getByLabel('ایمیل مدیر', { exact: true }).fill(admin.email);
  await page.getByLabel('رمز ورود', { exact: true }).fill(admin.password);
  await page.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(page).toHaveURL(adminOrigin + '/admin');
  await page.goto(adminOrigin + '/admin/products', { waitUntil: 'networkidle' });
  await page.getByLabel('جستجوی محصول', { exact: true }).fill(suffix);
  await page.getByLabel('جستجوی محصول', { exact: true }).press('Enter');
  await expect(page.locator('[data-admin-record]')).toHaveCount(2);
  await expect(page.locator('[data-admin-record]')).toHaveCount(2);
  for (const row of await page.locator('[data-admin-record]').all())
    await row.getByRole('checkbox').check();
  await expect(page.getByRole('button', { name: /تخفیف \/ جشنواره/ })).toBeEnabled();
  await page.getByRole('button', { name: /تخفیف \/ جشنواره/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('spinbutton', { name: 'درصد تخفیف', exact: true }).fill('20');
  await dialog.getByLabel('عنوان جشنواره (اختیاری)', { exact: true }).fill('جشنواره آزمون');
  await dialog.getByLabel('پایان تخفیف', { exact: true }).click();
  await expect(dialog.locator('.rmdp-calendar')).toBeVisible();
  await expect(dialog.locator('.rmdp-time-picker')).toBeVisible();
  await dialog.locator('.rmdp-day.rmdp-selected span.sd').click();
  await dialog.getByLabel('عنوان جشنواره (اختیاری)', { exact: true }).click();
  await dialog.getByRole('button', { name: 'اعمال روی محصولات انتخاب‌شده', exact: true }).click();
  await expect(dialog).toBeHidden();
  const stored = await db.product.findMany({
    where: { id: { in: fixtures.map((product) => product.id) } },
  });
  assert.ok(
    stored.every(
      (product) =>
        product.discountPercent === 20 && product.discountEndsAt > product.discountStartsAt,
    ),
  );
  const publicResult = await gql('{promotionalProducts{id promotion{price percent}}}');
  for (const product of fixtures)
    assert.ok(
      publicResult.data.promotionalProducts.some(
        (item) => item.id === product.id && item.promotion.price === 80000,
      ),
    );
  await page.getByRole('button', { name: `ویرایش ${fixtures[0].title}`, exact: true }).click();
  await page.getByRole('tab', { name: 'تخفیف', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'درصد تخفیف', exact: true }).fill('');
  await page.getByRole('button', { name: 'ذخیره محصول', exact: true }).click();
  await expect(page.getByText('محصول ذخیره شد.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'بازگشت به محصولات', exact: true }).click();
  await expect(page).toHaveURL(adminOrigin + '/admin/products');
  await page.getByLabel('جستجوی محصول', { exact: true }).fill(suffix);
  await page.getByLabel('جستجوی محصول', { exact: true }).press('Enter');
  assert.equal(
    (await db.product.findUniqueOrThrow({ where: { id: fixtures[0].id } })).discountPercent,
    null,
  );
  await expect(page.locator('[data-admin-record]')).toHaveCount(2);
  for (const row of await page.locator('[data-admin-record]').all())
    await row.getByRole('checkbox').check();
  await expect(page.getByRole('button', { name: /تخفیف \/ جشنواره/ })).toBeEnabled();
  await page.getByRole('button', { name: /تخفیف \/ جشنواره/ }).click();
  await dialog.getByRole('button', { name: 'اعمال روی محصولات انتخاب‌شده', exact: true }).click();
  await expect(dialog).toBeHidden();
  assert.ok(
    (
      await db.product.findMany({ where: { id: { in: fixtures.map((product) => product.id) } } })
    ).every((product) => product.discountPercent === null),
  );
  assert.deepEqual(errors, []);
  console.log(
    'Admin promotions verified: authorization, real transactional rollback on stale versions, bulk festival UI save, public discounted price, individual removal, bulk removal, no runtime errors. Temporary fixtures cleaned up.',
  );
} finally {
  await browser?.close();
  await cleanupAdmin();
}
