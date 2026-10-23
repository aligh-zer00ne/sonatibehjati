import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import { startAPI, db, phone } from './auth-harness.mjs';
import {
  createAdmin,
  createCustomer,
  startAdmin,
  cleanupAdmin,
  products,
} from './admin-harness.mjs';
const base = 'http://localhost:3005';
let browser, page;
async function fits(page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth), {
      timeout: 5000,
    })
    .toBeLessThanOrEqual(1);
}

try {
  await startAPI();
  await startAdmin();
  const admin = await createAdmin();
  const customer = await createCustomer();
  const category = await db.category.findFirstOrThrow();
  const product = await db.product.create({
    data: {
      title: `ارده فروش دستی ${randomUUID().slice(0, 8)}`,
      slug: `ui-retail-${randomUUID()}`,
      price: 100000,
      weight: '۵۰۰ گرم',
      shortDescription: 'محصول آزمون',
      description: 'شرح محصول آزمون',
      categoryId: category.id,
      shippingWeightGrams: 500,
      shippingBaseCost: 50000,
      shippingAdditionalKgCost: 10000,
      images: { create: { url: '/images/products/tahini-blue.webp', alt: 'ارده', position: 0 } },
    },
  });
  products.add(product.id);
  const extraProducts = [];
  for (const name of ['روغن کنجد یک لیتری', 'حلوا ارده سنتی']) {
    const p = await db.product.create({
      data: {
        title: `${name} ${randomUUID().slice(0, 6)}`,
        slug: `compact-${randomUUID()}`,
        price: 690000,
        weight: 'یک بسته',
        shortDescription: '',
        description: '',
        categoryId: category.id,
      },
    });
    products.add(p.id);
    extraProducts.push(p);
  }
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(20000);
  const replayInputs = { create: [], receipt: [] };
  await page.route('**/api/admin', async (route) => {
    const body = route.request().postDataJSON();
    const kind = body.query.includes('mutation CreateAdminManualOrder')
      ? 'create'
      : body.query.includes('mutation RecordAdminAccountEntry')
        ? 'receipt'
        : null;
    if (!kind) return route.continue();
    replayInputs[kind].push(body.variables.input);
    if (replayInputs[kind].length === 1) {
      const response = await route.fetch();
      assert.equal(response.status(), 200);
      const data = await response.json();
      assert.equal(data.errors, undefined, JSON.stringify(data.errors));
      return route.abort('failed');
    }
    return route.continue();
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + '/login');
  await page.getByLabel('ایمیل مدیر', { exact: true }).fill(admin.email);
  await page.getByLabel('رمز ورود', { exact: true }).fill(admin.password);
  await page.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  await expect(page.locator('[data-admin-dashboard]')).toBeVisible();
  await page.goto(`${base}/admin/products/${product.id}/edit`);
  await page.getByRole('tab', { name: 'وزن ارسال', exact: true }).click();
  await page.getByLabel('وزن بسته برای ارسال (گرم)', { exact: true }).fill('600');
  await page.getByRole('button', { name: 'ذخیره محصول', exact: true }).click();
  await expect(page.getByText('محصول ذخیره شد.', { exact: true })).toBeVisible();
  const saved = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  assert.equal(saved.shippingWeightGrams, 600);
  assert.equal(saved.shippingBaseCost, 50000);
  assert.equal(saved.shippingAdditionalKgCost, 10000);
  await page.goto(base + '/admin/orders/manual');
  await page.getByRole('button', { name: 'ثبت سفارش دستی', exact: true }).click();
  let modal = page.getByRole('dialog', { name: 'ثبت سفارش حضوری / اینستاگرام', exact: true });
  await expect(modal).toBeVisible();
  await expect(modal.locator('[data-invoice-header]')).toHaveCount(0);
  await expect(modal.getByText('فاکتور هنوز خالی است', { exact: true })).toBeVisible();
  await modal
    .getByRole('combobox', { name: 'مشتری سفارش دستی', exact: true })
    .fill(customer.user.phone);
  await page.locator('.ant-select-item-option').filter({ hasText: customer.user.phone }).click();
  await modal.getByRole('combobox', { name: 'محصول سفارش دستی', exact: true }).fill(product.title);
  await page.locator('.ant-select-item-option').filter({ hasText: product.title }).click();
  await modal.getByRole('combobox', { name: 'محصول سفارش دستی', exact: true }).fill(product.title);
  await expect(page.locator(`[data-product-result="${product.id}"] img`)).toBeVisible();
  await expect(page.locator(`[data-product-result="${product.id}"]`)).toContainText('ریال');
  await page.locator('.ant-select-item-option').filter({ hasText: product.title }).click();
  await expect(modal.locator('[data-manual-line]')).toHaveCount(1);
  await expect(
    modal.getByRole('spinbutton', { name: `تعداد ${product.title}`, exact: true }),
  ).toHaveValue('2');
  await modal.getByRole('spinbutton', { name: `تعداد ${product.title}`, exact: true }).fill('2');
  await modal.getByRole('spinbutton', { name: `تعداد ${product.title}`, exact: true }).press('Tab');
  await modal.getByLabel('قیمت واحد (ریال)', { exact: true }).fill('2000000');
  await modal.getByLabel('قیمت کل (ریال)', { exact: true }).fill('6000000');
  await modal.getByLabel('مقدار تخفیف', { exact: true }).fill('500000');
  await expect(modal.locator('[data-amount="550000"]').first()).toBeVisible();
  await modal.getByRole('combobox', { name: `نوع تخفیف ${product.title}`, exact: true }).click();
  await page.locator('.ant-select-item-option').filter({ hasText: 'درصدی' }).click();
  await modal
    .getByRole('spinbutton', { name: `درصد تخفیف ${product.title}`, exact: true })
    .fill('10');
  await expect(modal.locator('[data-amount="540000"]').first()).toBeVisible();
  await expect(modal.getByLabel('کد تخفیف', { exact: true })).toHaveCount(0);
  await expect(
    modal.getByRole('button', { name: `حذف ${product.title}`, exact: true }).locator('svg'),
  ).toHaveCount(1);
  await modal.getByLabel('مبلغ دریافت‌شده (ریال)', { exact: true }).fill('500000');
  await modal.getByLabel('مبلغ دریافت‌شده (ریال)', { exact: true }).press('Tab');
  const rowBox = await modal.locator('[data-manual-line]').boundingBox();
  assert.ok(rowBox && rowBox.height < 100, 'Desktop invoice items must fit one compact row');
  for (const p of extraProducts) {
    await modal.getByRole('combobox', { name: 'محصول سفارش دستی', exact: true }).fill(p.title);
    await page.locator('.ant-select-item-option').filter({ hasText: p.title }).click();
  }
  await expect(modal.locator('[data-manual-line]')).toHaveCount(3);
  await expect(modal.locator('[data-invoice-header]')).toBeVisible();
  await modal.getByText('اقلام فاکتور', { exact: true }).click();
  await expect(page.locator('.ant-select-dropdown:visible')).toHaveCount(0);
  for (const row of await modal.locator('[data-manual-line]').all())
    assert.ok((await row.boundingBox()).height < 100);
  await modal.screenshot({ path: '/tmp/behjati-manual-compact-desktop.png' });
  for (const p of extraProducts)
    await modal.getByRole('button', { name: `حذف ${p.title}`, exact: true }).click();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await fits(page);
    assert.ok(await modal.evaluate((e) => e.getBoundingClientRect().width <= innerWidth));
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await modal.screenshot({ path: '/tmp/behjati-retail-manual-mobile.png' });
  await modal.getByRole('button', { name: 'ثبت نهایی سفارش', exact: true }).click();
  await expect(
    modal.getByRole('button', { name: 'تلاش دوباره برای ثبت همین سفارش', exact: true }),
  ).toBeVisible();
  await modal.getByRole('button', { name: 'تلاش دوباره برای ثبت همین سفارش', exact: true }).click();
  await expect(modal).toHaveCount(0);
  assert.deepEqual(replayInputs.create[0], replayInputs.create[1]);
  let order = await db.order.findFirstOrThrow({
    where: { userId: customer.user.id },
    orderBy: { createdAt: 'desc' },
  });
  assert.equal(order.salesChannel, 'IN_PERSON');
  assert.equal(order.offlinePaidAmount, 50000);
  assert.equal(order.total, 540000);
  await expect(page.getByRole('tab', { name: 'محصولات', exact: true })).toBeVisible();
  for (const name of ['مشتری و ارسال', 'پرداخت‌ها', 'تاریخچه'])
    await expect(page.getByRole('tab', { name, exact: true })).toHaveCount(0);
  await expect(page.getByText('تغییر وضعیت سفارش', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'چاپ فاکتور / PDF', exact: true }).click();
  await expect(page.getByRole('dialog').getByText(/دریافت ثبت‌شده در فروشگاه/)).toBeVisible();
  await expect(
    page.getByRole('dialog').getByText('تخفیف ردیف', { exact: false }).first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'بستن پیش‌نمایش چاپ', exact: true }).click();
  await page.goto(`${base}/admin/settlements?customerId=${customer.user.id}`);
  await expect(page.locator('[data-account-status="debtor"]').first()).toBeVisible();
  await expect(
    page.locator('[data-account-status="debtor"]').first().locator('.ant-tag-red'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'ثبت دریافت از مشتری', exact: true }).click();
  let receipt = page.locator('[data-account-operation="RECEIPT"]');
  await receipt.getByLabel('مبلغ (ریال)', { exact: true }).fill('5500000');
  await receipt.getByRole('button', { name: 'ثبت دریافت از مشتری', exact: true }).click();
  await expect(
    receipt.getByRole('button', { name: 'بررسی و ثبت مجدد همین درخواست', exact: true }),
  ).toBeEnabled();
  // The server accepted the first POST but its response was lost. Reload must recover the SAME UUID.
  await page.reload();
  receipt = page.locator('[data-account-operation="RECEIPT"]');
  await expect(
    receipt.getByRole('button', { name: 'بررسی و ثبت مجدد همین درخواست', exact: true }),
  ).toBeEnabled();
  await receipt.getByRole('button', { name: 'بررسی و ثبت مجدد همین درخواست', exact: true }).click();
  await expect(receipt).toHaveCount(0);
  assert.deepEqual(replayInputs.receipt[0], replayInputs.receipt[1]);
  await expect(
    page.locator('[data-account-status="creditor"]').first().locator('.ant-tag-gold'),
  ).toBeVisible();
  await page.getByRole('tab', { name: /گردش حساب/ }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: /فاکتورهای مستقل مشتری/ })).toBeFocused();
  await expect(page.getByRole('tab', { name: /فاکتورهای مستقل مشتری/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(
    page.locator('[data-account-status="settled"]').first().locator('.ant-tag-green'),
  ).toBeVisible();
  order = await db.order.findUniqueOrThrow({ where: { id: order.id } });
  assert.equal(order.offlinePaidAmount, 540000);
  assert.equal(order.paidAt, null);
  assert.equal(order.status, 'DELIVERED');
  assert.equal(await db.customerAccountEntry.count({ where: { userId: customer.user.id } }), 2);
  await page.getByRole('tab', { name: /گردش حساب/ }).click();
  await expect(page.locator('[data-account-entry]')).toHaveCount(2);
  await page.getByRole('button', { name: 'پرداخت به مشتری', exact: true }).click();
  const payout = page.locator('[data-account-operation="PAYMENT"]');
  await expect(payout.getByRole('heading', { name: 'پرداخت به مشتری', exact: true })).toBeVisible();
  await payout.getByLabel('مبلغ (ریال)', { exact: true }).fill('600000');
  await payout.locator('form').evaluate((form) => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  await expect(payout).toHaveCount(0);
  await expect(page.locator('[data-account-status="settled"]').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'پرداخت به مشتری', exact: true })).toBeDisabled();
  assert.equal(await db.customerAccountEntry.count({ where: { userId: customer.user.id } }), 3);

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await fits(page);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: '/tmp/behjati-customer-accounts-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: '/tmp/behjati-customer-accounts-desktop.png', fullPage: true });
  // Instagram customer entry captures and reuses postal details; shipping is explicitly entered in rial.
  const instagramPhone = phone();
  await page.goto(base + '/admin/orders/manual');
  await page.getByRole('button', { name: 'ثبت سفارش دستی', exact: true }).click();
  modal = page.getByRole('dialog', { name: 'ثبت سفارش حضوری / اینستاگرام', exact: true });
  await modal.getByLabel('محل خرید', { exact: true }).click();
  await page.locator('.ant-select-item-option').filter({ hasText: 'اینستاگرام' }).click();
  await modal.getByRole('button', { name: 'افزودن مشتری جدید', exact: true }).click();
  const customerDialog = page.getByRole('dialog', { name: 'افزودن مشتری', exact: true });
  await customerDialog.getByLabel('نام', { exact: true }).fill('مشتری اینستا');
  await customerDialog.getByLabel('نام خانوادگی', { exact: true }).fill('آزمون');
  await customerDialog.getByLabel('موبایل', { exact: true }).fill(instagramPhone);
  for (const [name, value] of [
    ['استان', 'یزد'],
    ['شهر', 'اردکان'],
    ['آدرس کامل', 'نشانی پستی آزمون پلاک ۱۲'],
    ['کد پستی', '1234567890'],
  ])
    await customerDialog.getByLabel(name, { exact: true }).fill(value);
  await customerDialog.getByRole('button', { name: 'ثبت مشتری', exact: true }).click();
  await expect(customerDialog).toHaveCount(0);
  await expect(modal.getByLabel('کد پستی', { exact: true })).toHaveValue('1234567890');
  await modal.getByRole('combobox', { name: 'محصول سفارش دستی', exact: true }).fill(product.title);
  await page.locator('.ant-select-item-option').filter({ hasText: product.title }).click();
  await modal.getByLabel('هزینهٔ ارسال بسته (ریال)', { exact: true }).fill('400000');
  await expect(modal.locator('[data-amount="140000"]').first()).toBeVisible();
  await modal.getByRole('button', { name: 'ثبت نهایی سفارش', exact: true }).click();
  await expect(modal).toHaveCount(0);
  const insta = await db.user.findUniqueOrThrow({ where: { phone: instagramPhone } });
  const instaOrder = await db.order.findFirstOrThrow({ where: { userId: insta.id } });
  assert.equal(instaOrder.shipping, 40000);
  assert.equal(instaOrder.total, 140000);
  assert.equal(instaOrder.addressSnapshot.postalCode, '1234567890');
  await page.getByRole('button', { name: 'لیبل پستی / چاپ', exact: true }).click();
  const label = page.getByRole('dialog').locator('[data-label-sheet]');
  await expect(label.getByText(/هزینهٔ ارسال:/)).toContainText(/ریال/);
  await expect(label).toContainText('نشانی پستی آزمون پلاک ۱۲');
  await page.getByRole('dialog').locator('.ant-modal-close').click();
  // Filter buttons modify URL/backend results and remain usable on a small screen.
  await page.getByRole('button', { name: 'محل خرید', exact: true }).click();
  await page
    .getByRole('region', { name: 'محل خرید', exact: true })
    .getByRole('button', { name: 'حضوری', exact: true })
    .click();
  await expect(page).toHaveURL(/salesChannel=IN_PERSON/);

  await fits(page);
  await page.getByRole('button', { name: 'شیوه ارسال', exact: true }).click();
  await page
    .getByRole('region', { name: 'شیوه ارسال', exact: true })
    .getByRole('button', { name: 'تیپاکس', exact: true })
    .click();
  await expect(page).toHaveURL(/shippingMethod=TIPAX/);

  await page.goto(base + '/admin/users');
  await page.getByRole('button', { name: 'افزودن مشتری', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'افزودن مشتری', exact: true })).toBeVisible();
  await page.getByRole('dialog').locator('.ant-modal-close').click();
  await page.goto(base + '/admin/reports');
  await page.getByRole('button', { name: 'بازه گزارش', exact: true }).hover();
  await page.getByRole('button', { name: 'امروز', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByText('پرداخت موفق درگاه', { exact: true })).toBeVisible();
  await expect(page.getByText('خالص حساب مشتریان', { exact: true })).toBeVisible();
  await fits(page);
  await page.goto(base + '/admin');
  await expect(
    page.getByRole('region', { name: 'مشتریان به تفکیک محل خرید', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'محل خرید', exact: true }).hover();
  await page
    .getByRole('group', { name: 'محل خرید داشبورد', exact: true })
    .getByRole('button', { name: 'حضوری', exact: true })
    .click();
  await page.getByRole('button', { name: 'محل خرید', exact: true }).hover();
  await expect(
    page
      .getByRole('group', { name: 'محل خرید داشبورد' })
      .getByRole('button', { name: 'حضوری', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await fits(page);
  assert.deepEqual(errors, []);
  console.log(
    'Retail browser passed: shipping form persistence, real manual order and receipt ledger, bank separation, print credit, source/carrier/report/dashboard filters and 320–1440px modal fit. Fixture data cleaned; no real SMS or bank request.',
  );
} catch (error) {
  await page?.screenshot({ path: '/tmp/behjati-retail-failure.png', fullPage: true });
  console.error(await page?.locator('main').innerText());
  throw error;
} finally {
  await browser?.close();
  await cleanupAdmin();
}
