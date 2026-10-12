import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import sharp from 'sharp';
import { chromium, expect } from '@playwright/test';
import { startAPI, startStorefront, db, origin, adminOrigin } from './auth-harness.mjs';
import { createAdmin, startAdmin, admins, cleanupAdmin } from './admin-harness.mjs';
let browser;
let previous;
const uploaded = [];
const marker = `هیرو ${randomBytes(5).toString('hex')}`;
try {
  await startAPI();
  await startStorefront();
  await startAdmin();
  previous = await db.homepageContent.findUnique({ where: { id: 'homepage' } });
  const owner = await createAdmin();
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  async function login(tab, user) {
    await tab.goto(adminOrigin + '/login');
    await tab.getByLabel('ایمیل مدیر', { exact: true }).fill(user.email);
    await tab.getByLabel('رمز ورود', { exact: true }).fill(user.password);
    await tab.getByRole('button', { name: 'ورود به پنل', exact: true }).click();
  }
  await login(page, owner);
  await expect(page).toHaveURL(adminOrigin + '/admin');
  await page.goto(adminOrigin + '/admin/accounts');
  const staffEmail = `config-ui-${randomBytes(6).toString('hex')}@example.test`;
  const staffPassword = randomBytes(20).toString('hex');
  await page.getByLabel('ایمیل همکار', { exact: true }).fill(staffEmail);
  await page.getByLabel('رمز اولیه (حداقل ۱۲ نویسه)', { exact: true }).fill(staffPassword);
  await page.getByRole('checkbox', { name: 'پشتیبانی و تیکت‌ها', exact: true }).check();
  await page.getByRole('button', { name: 'ساخت حساب همکار', exact: true }).click();
  await expect(page.getByText(staffEmail, { exact: true })).toBeVisible();
  const staff = await db.admin.findUniqueOrThrow({ where: { email: staffEmail } });
  admins.push(staff);
  const colleague = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  colleague.on('pageerror', (e) => errors.push(e.message));
  await login(colleague, { email: staffEmail, password: staffPassword });
  await expect(colleague).toHaveURL(adminOrigin + '/admin/tickets');
  await expect(colleague.locator('aside nav').getByRole('link')).toHaveCount(2);
  for (const path of [
    'products',
    'orders',
    'users',
    'reports',
    'accounts',
    'coupons',
    'homepage',
  ]) {
    await colleague.goto(adminOrigin + '/admin/' + path);
    await expect(colleague).toHaveURL(adminOrigin + '/admin/tickets');
  }
  const row = page.getByRole('row').filter({ hasText: staffEmail });
  await row.getByRole('button', { name: 'تعیین دسترسی‌ها', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('checkbox', { name: 'پشتیبانی و تیکت‌ها', exact: true }).uncheck();
  await dialog.getByRole('checkbox', { name: 'هیروسکشن و درباره ما', exact: true }).check();
  await dialog.getByRole('button', { name: 'ذخیره دسترسی‌ها', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await colleague.reload();
  await expect(colleague).toHaveURL(/\/login$/);
  await login(colleague, { email: staffEmail, password: staffPassword });
  await expect(colleague).toHaveURL(adminOrigin + '/admin/homepage');
  await expect(colleague.locator('aside nav').getByRole('link')).toHaveCount(2);
  const cards = colleague
    .locator('.ant-card')
    .filter({ has: colleague.getByText(/^اسلاید \d+$/, { exact: true }) });
  const first = cards.first();
  await first.getByLabel('عنوان', { exact: true }).fill(marker);
  await first.getByLabel('متن اسلاید', { exact: true }).fill('متن دلخواه اسلایدر از پنل مدیریت');
  await colleague.getByLabel('عنوان درباره ما', { exact: true }).fill('درباره ما از پنل');
  const longStory = 'این متن از پنل مدیریت ذخیره شده است. '.repeat(15);
  await colleague.getByLabel('متن درباره ما', { exact: true }).fill(longStory);
  const image = await sharp({
    create: { width: 500, height: 700, channels: 3, background: '#c49b42' },
  })
    .png()
    .toBuffer();
  for (const label of [
    'عکس موبایل اسلاید 1',
    'عکس دسکتاپ اسلاید 1',
    'عکس موبایل درباره ما',
    'عکس دسکتاپ درباره ما',
  ]) {
    const response = colleague.waitForResponse(
      (r) => r.url().includes('/api/admin/uploads') && r.request().method() === 'POST',
    );
    await colleague
      .getByLabel('آپلود ' + label, { exact: true })
      .setInputFiles({ name: 'homepage-test.png', mimeType: 'image/png', buffer: image });
    const result = await response;
    assert.equal(result.status(), 201);
    uploaded.push((await result.json()).url);
    await expect(
      colleague.getByRole('button', { name: 'انتخاب ' + label, exact: true }),
    ).not.toHaveClass(/ant-btn-loading/);
  }
  const originalCount = await cards.count();
  await colleague.getByRole('button', { name: 'افزودن اسلاید', exact: true }).click();
  await expect(cards).toHaveCount(originalCount + 1);
  await cards.last().getByRole('button', { name: 'حذف اسلاید', exact: true }).click();
  await expect(cards).toHaveCount(originalCount);
  await cards.nth(1).getByRole('button', { name: 'بالاتر', exact: true }).click();
  await cards.nth(0).getByRole('button', { name: 'پایین‌تر', exact: true }).click();
  await colleague.getByRole('button', { name: 'ذخیره هیروسکشن و درباره ما', exact: true }).click();
  await expect(colleague.getByText('محتوای صفحه اصلی ذخیره شد.', { exact: true })).toBeVisible();
  await colleague.reload();
  await expect(cards.first().getByLabel('عنوان', { exact: true })).toHaveValue(marker);
  await expect(colleague.getByLabel('متن درباره ما', { exact: true })).toHaveValue(
    longStory.trim(),
  );
  const shop = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  shop.on('pageerror', (e) => errors.push(e.message));
  for (const width of [320, 390, 768, 1440]) {
    await shop.setViewportSize({ width, height: 900 });
    await shop.goto(origin + '/');
    await expect(shop.getByRole('heading', { name: marker, exact: true })).toBeVisible();
    await expect(shop.locator('#story')).toContainText(longStory.trim());
    const imageUrl = width >= 480 ? uploaded[1] : uploaded[0];
    // Check the rendered active slide rather than a guessed resized file name.
    const imgs = shop.locator('[aria-roledescription="اسلاید"]').first().locator('img');
    await expect.poll(() => imgs.evaluate((img) => img.currentSrc)).toContain(imageUrl);
    await imgs.evaluate((img) => img.decode());
    assert.ok(
      await shop.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      ),
      `Homepage overflow at ${width}px`,
    );
    const storyBounds = await shop.locator('[data-slot="story-copy"]').boundingBox();
    const storyOuter = await shop.locator('#story').boundingBox();
    assert.ok(
      storyBounds.y + storyBounds.height <= storyOuter.y + storyOuter.height + 1,
      'Long about text must fit',
    );
    if (width === 390) {
      const nav = shop.getByRole('navigation', { name: 'ناوبری موبایل', exact: true });
      await expect(nav.getByRole('link')).toHaveCount(6);
      const support = nav.getByRole('link', { name: 'پشتیبانی', exact: true });
      await support.click();
      await expect(shop).toHaveURL(origin + '/support');
      await expect(nav.getByRole('link', { name: 'پشتیبانی', exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      );
    }
  }
  for (const width of [320, 390, 768, 1440]) {
    await colleague.setViewportSize({ width, height: 1000 });
    assert.ok(
      await colleague.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      ),
      `Editor overflow at ${width}px`,
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    'Owner-selected staff permissions, direct-route guards, revoked session, homepage-only uploads, slide controls, saved text/images, responsive long about text and mobile support navigation passed.',
  );
} finally {
  await browser?.close();
  const current = await db.homepageContent.findUnique({ where: { id: 'homepage' } });
  if (current?.data?.slides?.[0]?.title === marker) {
    if (previous)
      await db.homepageContent.update({
        where: { id: 'homepage' },
        data: { data: previous.data, updatedAt: previous.updatedAt },
      });
    else await db.homepageContent.delete({ where: { id: 'homepage' } });
  }
  for (const url of uploaded) await unlink('apps/api' + url).catch(() => {});
  await cleanupAdmin();
}
