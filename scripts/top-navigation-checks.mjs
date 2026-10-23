import assert from 'node:assert/strict';
import { expect } from '@playwright/test';

export async function verifyTopNavigation(page) {
  await expect(page.locator('[data-admin-sidebar]')).toHaveCount(0);
  const nav = page.locator('#admin-desktop-navigation');
  for (const width of [1100, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(nav).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
    for (const el of await nav.getByRole('link').all()) {
      const box = await el.boundingBox();
      assert.ok(box && box.x >= 0 && box.x + box.width <= width && box.height >= 56);
      assert.ok(await el.evaluate((node) => node.scrollWidth <= node.clientWidth + 1));
      assert.ok(await el.evaluate((node) => parseFloat(getComputedStyle(node).fontSize) >= 14));
    }
  }
  const topbar = page.locator('[data-admin-topbar]');
  assert.ok((await topbar.boundingBox()).height >= 125);
  assert.ok((await topbar.getByAltText('سنتی بهجتی', { exact: true }).boundingBox()).height >= 76);
  for (const [name, id, expected] of [
    ['فروش و مشتریان', 'sales', 6],
    ['محصولات و تخفیف‌ها', 'catalog', 2],
    ['ارتباط با مشتری', 'communication', 2],
    ['تنظیمات مدیریت', 'settings', 4],
  ]) {
    const link = nav.getByRole('link', { name, exact: true });
    await link.focus();
    await link.press('Enter');
    await expect(page).toHaveURL(new RegExp(`/admin/sections/${id}$`));
    const section = page.locator(`[data-admin-section="${id}"]`);
    await expect(section.getByRole('heading', { name, exact: true, level: 1 })).toBeVisible();
    await expect(page.locator('[data-admin-dashboard]')).toHaveCount(0);
    await expect(section.locator('[data-admin-navigation-card]')).toHaveCount(expected);
    const card = section.locator('[data-admin-navigation-card]').first();
    assert.ok((await card.boundingBox()).height >= 220);
    assert.equal(
      await card.evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(255, 255, 255)',
    );
    await page.reload();
    await expect(section).toBeVisible();
    await page.screenshot({
      path: `/tmp/behjati-section-${id}-1440.png`,
      animations: 'disabled',
      fullPage: false,
    });
  }
  await nav.getByRole('link', { name: 'محصولات و تخفیف‌ها', exact: true }).click();
  await page
    .locator('[data-admin-section]')
    .getByRole('link', { name: 'محصولات', exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  const search = page.getByRole('combobox', { name: 'محدوده جستجوی مدیریت', exact: true });
  await expect(search).toBeVisible();
  await page.getByLabel('جستجوی پنل مدیریت', { exact: true }).fill('کنجد');
  await page.getByLabel('جستجوی پنل مدیریت', { exact: true }).press('Enter');
  await expect(page).toHaveURL(/\/admin\/products\?search=/);
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await page.getByRole('button', { name: 'باز کردن منوی مدیریت', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'منوی مدیریت', exact: true });
    await drawer.getByRole('link', { name: 'فروش و مشتریان', exact: true }).click();
    await expect(drawer).toBeHidden();
    await expect(page).toHaveURL(/\/admin\/sections\/sales$/);
    const cards = page.locator('[data-admin-section="sales"] [data-admin-navigation-card]');
    await expect(cards).toHaveCount(6);
    for (const card of await cards.all()) {
      const box = await card.boundingBox();
      assert.ok(box && box.x >= 0 && box.x + box.width <= width + 1);
    }
    if (width === 390)
      await page.screenshot({
        path: '/tmp/behjati-section-sales-390.png',
        fullPage: true,
        animations: 'disabled',
      });
    await page
      .locator('[data-admin-section]')
      .getByRole('link', { name: 'سایر سفارش‌ها', exact: true })
      .click();
    await expect(page).toHaveURL(/\/admin\/orders\/manual$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/admin\/sections\/sales$/);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await nav.getByRole('link', { name: 'داشبورد', exact: true }).click();
  await expect(page.locator('[data-admin-dashboard]')).toBeVisible();
}
