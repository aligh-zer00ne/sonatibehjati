import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const admin = {
    id: 'content-fixture',
    email: 'fixture@example.test',
    role: 'OWNER',
    permissions: [],
    isActive: true,
    gatewayTestEnabled: false,
  };
  let notice = { updatedAt: null, announcement: { enabled: true, text: 'اطلاعیهٔ فروشگاه' } };
  let saved = 0;
  await page.route('**/api/admin', (route) => {
    const { query, variables } = route.request().postDataJSON();
    const op = query.match(/(?:query|mutation)\s+(\w+)/)?.[1];
    let data;
    if (op === 'AdminMe') data = { adminMe: admin };
    else if (op === 'AdminRefresh')
      data = {
        adminRefresh: {
          admin,
          accessToken: 'fixture',
          accessExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
      };
    else if (op === 'AdminAnnouncement') data = { adminHomepageContent: notice };
    else if (op === 'SaveAnnouncement') {
      assert.equal(variables.expectedUpdatedAt, notice.updatedAt);
      notice = { updatedAt: new Date().toISOString(), announcement: variables.input };
      saved++;
      data = { saveAnnouncement: notice };
    } else return route.fulfill({ json: { errors: [{ message: 'Unexpected operation' }] } });
    return route.fulfill({ json: { data } });
  });
  await page.goto('http://localhost:3001/admin/announcement', { waitUntil: 'networkidle' });
  await expect(
    page.getByRole('heading', { name: 'نوار اطلاع‌رسانی سایت', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('هیروسکشن و درباره ما', { exact: true })).toHaveCount(0);
  await page.getByLabel('متن اطلاع‌رسانی', { exact: true }).fill('جشنوارهٔ بلک فرایدی سنتی بهجتی');
  await page.getByRole('button', { name: 'ذخیره نوار اطلاع‌رسانی', exact: true }).click();
  await expect(page.getByText('نوار اطلاع‌رسانی سایت ذخیره شد.', { exact: true })).toBeVisible();
  assert.equal(saved, 1);
  assert.equal(notice.announcement.text, 'جشنوارهٔ بلک فرایدی سنتی بهجتی');
  const nav = page.locator('[data-admin-sidebar] nav');
  await expect(nav.getByRole('button', { expanded: true })).toHaveCount(1);
  await nav.getByRole('button', { name: 'فروش و مشتریان', exact: true }).click();
  await nav.getByRole('button', { name: 'سفارش‌ها', exact: true }).click();
  await expect(nav.getByRole('link', { name: 'سفارش‌های وبسایت', exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'سایر سفارش‌ها', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'جمع کردن منوی مدیریت', exact: true }).click();
  await nav.getByRole('button', { name: 'فروش و مشتریان', exact: true }).click();
  await page.getByRole('menu').getByText('سفارش‌ها', { exact: true }).hover();
  await expect(page.getByRole('link', { name: 'سفارش‌های وبسایت', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'سایر سفارش‌ها', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'باز کردن منوی کناری', exact: true }).click();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (width < 992) {
      await page.getByRole('button', { name: 'باز کردن منوی مدیریت', exact: true }).click();
      const drawer = page.getByRole('dialog');
      await expect(
        drawer.getByRole('button', { name: 'فروش و مشتریان', exact: true }),
      ).toBeVisible();
      await page.keyboard.press('Escape');
    }
  }
  await expect(
    page.locator('footer').getByRole('link', { name: 'nexoraict.ir', exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: '/tmp/behjati-content-navigation.png', fullPage: true });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await expect(
    page.locator('footer').getByRole('link', { name: 'nexoraict.ir', exact: true }),
  ).toBeVisible();
  const qr = await fetch('http://localhost:3000/QR');
  assert.ok((await qr.text()).includes('طراحی توسط'));
  assert.deepEqual(errors, []);
  console.log(
    'Content/navigation passed: editable announcement preview/save, removed hero editor, grouped/collapsed/mobile menus, 320–1440px fit and public/admin/QR designer credits. API writes intercepted.',
  );
} finally {
  await browser.close();
}
