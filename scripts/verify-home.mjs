import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const baseURL = 'http://localhost:3002';
const server = spawn(
  process.execPath,
  [require.resolve('next/dist/bin/next'), 'start', '--port', '3002'],
  { cwd: 'apps/storefront', stdio: 'ignore' },
);
for (let i = 0; i < 100; i++) {
  try {
    if ((await fetch(baseURL)).ok) break;
  } catch {
    /* Wait until the local server accepts connections. */
  }
  await new Promise((resolve) => setTimeout(resolve, 100));
}
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox'],
});
async function scrollAll(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      scrollTo({ top: y, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = 'eager';
    await Promise.all(Array.from(document.images, (image) => image.decode()));
  });
}
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await scrollAll(page);
  await page.screenshot({ path: '/tmp/behjati-current-mobile.png', fullPage: true });
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'Mobile horizontal overflow',
  );
  await page.getByRole('button', { name: 'افزودن حلواارده سنتی به سبد خرید' }).first().click();
  await page.getByRole('button', { name: 'افزایش تعداد حلواارده سنتی' }).first().click();
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(
    await page.locator('[data-product-slug="traditional-halva-500"] output').textContent(),
    '۲',
  );
  await page.getByRole('button', { name: 'سبد خرید، ۲ محصول' }).click();
  await page.getByRole('dialog').waitFor();
  assert.ok((await page.getByRole('dialog').textContent()).includes('۴۹۰٬۰۰۰ تومان'));
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'جستجو در محصولات سنتی بهجتی...' }).click();
  await page.getByLabel('جستجوی محصول').fill('محصول ناموجود');
  await page.getByText('محصولی پیدا نشد').waitFor();
  await page.getByLabel('جستجوی محصول').fill('شکلاتی');
  assert.equal(await page.getByRole('dialog').locator('article[data-product-slug]').count(), 1);
  await page.keyboard.press('Escape');
  await page.locator('#categories button').filter({ hasText: 'روغن ارده' }).click();
  assert.equal(await page.getByRole('dialog').locator('article[data-product-slug]').count(), 1);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'باز کردن فهرست' }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'داستان سنتی بهجتی' }).click();
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await scrollAll(page);
  await page.screenshot({ path: '/tmp/behjati-current-desktop.png', fullPage: true });
  assert.equal(await page.getByRole('navigation', { name: 'ناوبری موبایل' }).isVisible(), false);
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'Desktop horizontal overflow',
  );
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log(
    'Homepage checks passed: RTL, responsive overflow, cart persistence and totals, search, category discovery, menu, desktop navigation, no runtime errors.',
  );
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
