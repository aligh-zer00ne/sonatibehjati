import assert from 'node:assert/strict';
import { expect } from '@playwright/test';

/** Desktop grouped sidebar, tabbed scoped search and the mobile/tablet bottom bar. */
export async function verifyAdminNavigation(page) {
  const sidebar = page.locator('[data-admin-sidebar]');
  const nav = page.locator('#admin-sidebar-navigation');
  for (const width of [1100, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(sidebar).toBeVisible();
    await expect(page.locator('#admin-bottom-navigation')).toBeHidden();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
    for (const el of await nav.getByRole('link').all()) {
      if (!(await el.isVisible())) continue;
      assert.ok(await el.evaluate((node) => parseFloat(getComputedStyle(node).fontSize) >= 12));
    }
  }
  await expect(nav.getByRole('link', { name: 'سفارش‌های وبسایت', exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'سایر سفارش‌ها', exact: true })).toBeVisible();
  for (const [name, id, expected] of [
    ['فروش و مشتریان', 'sales', 6],
    ['محصولات و تخفیف‌ها', 'catalog', 3],
    ['ارتباط با مشتری', 'communication', 2],
    ['تنظیمات مدیریت', 'settings', 6],
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
    const cardHeight = (await card.boundingBox()).height;
    assert.ok(cardHeight >= 160 && cardHeight <= 300, 'compact module card');
    assert.ok(
      await card.locator('p').evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 14),
      'readable module description',
    );
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
  await expect(nav.getByRole('link', { name: 'محصولات', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  // The search scope defaults to the current page and can be switched from its tabs.
  const search = page.getByRole('combobox', { name: 'جستجو در محصولات', exact: true });
  await search.fill('کنجد');
  await expect(page.getByRole('tab', { name: 'محصولات', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.getByRole('tab', { name: 'سفارش‌ها', exact: true }).click();
  await expect(
    page.getByRole('combobox', { name: 'جستجو در سفارش‌ها', exact: true }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'محصولات', exact: true }).click();
  await search.press('Enter');
  await expect(page).toHaveURL(/\/admin\/products\?search=/);
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(sidebar).toBeHidden();
    const bottom = page.locator('#admin-bottom-navigation');
    await bottom.getByRole('link', { name: 'فروش', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/sections\/sales$/);
    for (const link of await bottom.getByRole('link').all()) {
      const box = await link.boundingBox();
      assert.ok(box && box.x >= 0 && box.x + box.width <= width + 1 && box.height >= 44);
    }
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
