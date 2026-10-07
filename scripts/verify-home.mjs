import { chromium, expect } from '@playwright/test';
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
    await Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
}
async function closePanel(page) {
  await page.keyboard.press('Escape');
  await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'hidden' });
}
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  // The official seal is external; exercise its fallback without making UI checks depend on it.
  await page.route('https://trustseal.enamad.ir/**', (route) => route.abort());
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  const hero = page.getByRole('region', { name: 'تصاویر محصولات کنجدی' });
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('سنتی بهجتی');
  await hero.getByRole('button', { name: 'اسلاید بعدی', exact: true }).click();
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('طلای کنجد');
  await expect(hero.getByRole('link', { name: 'مشاهده روغن‌های کنجد' })).toHaveAttribute(
    'href',
    '/category/oil',
  );
  await hero.getByRole('button', { name: 'اسلاید بعدی', exact: true }).click();
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('طعم‌های تازه');
  await expect(hero.getByRole('link', { name: 'کشف ارده‌های طعم‌دار' })).toHaveAttribute(
    'href',
    '/category/tahini',
  );
  await hero.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('سنتی بهجتی');
  assert.equal(
    await page.locator('#story #ardakan').count(),
    1,
    'Both existing story anchors must reach the unified section',
  );
  assert.deepEqual(
    await page.locator('main section[id]').evaluateAll((sections) => sections.map(({ id }) => id)),
    ['categories', 'products', 'story', 'all-products', 'shopping-banner'],
    'The merged story must follow bestsellers and the shopping banner must follow the catalog',
  );
  await expect(page.locator('#shopping-banner').getByRole('link')).toHaveAttribute('href', '/shop');
  const icon = await page.locator('link[rel="icon"][href^="/favicon.ico"]').getAttribute('href');
  assert.ok(icon, 'Branded favicon link is missing');
  const iconResponse = await page.request.get(`${baseURL}${icon}`);
  assert.equal(iconResponse.status(), 200);
  assert.ok((await iconResponse.body()).byteLength > 100);
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
  await expect(page.getByRole('dialog')).toContainText('۴۹۰٬۰۰۰ تومان');
  await closePanel(page);
  await page.getByRole('button', { name: 'جستجو در محصولات سنتی بهجتی...' }).click();
  await page.getByLabel('جستجوی محصول').fill('محصول ناموجود');
  await page.getByText('محصولی پیدا نشد').waitFor();
  await page.getByLabel('جستجوی محصول').fill('شکلاتی');
  assert.equal(await page.getByRole('dialog').locator('article[data-product-slug]').count(), 1);
  await closePanel(page);
  await page.locator('#categories a[href="/category/oil"]').click();
  await expect(page).toHaveURL(`${baseURL}/category/oil`);
  await expect(page.locator('main article[data-product-slug="sesame-oil-250"]')).toBeVisible();
  const oilSlugs = await page
    .locator('main article[data-product-slug]')
    .evaluateAll((products) => products.map((product) => product.dataset.productSlug));
  assert.ok(
    oilSlugs.every((slug) => slug.startsWith('sesame-oil-')),
    'Oil category must only show oil products',
  );
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'باز کردن فهرست' }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'داستان سنتی بهجتی' }).click();
  await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'hidden' });
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await scrollAll(page);
  await page.screenshot({ path: '/tmp/behjati-current-desktop.png', fullPage: true });
  await expect(hero.locator('picture img').first()).toHaveJSProperty('complete', true);
  assert.ok(
    (
      await hero
        .locator('picture img')
        .first()
        .evaluate((image) => image.currentSrc)
    ).includes('hero-tahini-wide-v4.webp'),
    'Desktop must use the panoramic image instead of cropping the mobile photograph',
  );
  assert.equal(await page.getByRole('navigation', { name: 'ناوبری موبایل' }).isVisible(), false);
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'Desktop horizontal overflow',
  );
  const product = page.locator('article[data-product-slug="sesame-oil-250"]').first();
  const card = product.locator('[data-slot="card"]');
  await product.scrollIntoViewIfNeeded();
  await product.hover();
  await expect(card).toHaveCSS('translate', '0px -8px');
  await expect(product.locator('img')).toHaveCSS('scale', '1.08');
  await page.screenshot({ path: '/tmp/behjati-current-hover.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(card).toHaveCSS('translate', 'none');
  await expect(card).toHaveCSS('transition-property', 'none');
  await expect(product.locator('img')).toHaveCSS('scale', 'none');
  await expect(page.locator('section[aria-labelledby="hero-title"]')).toHaveCSS(
    'animation-name',
    'none',
  );
  await page.getByRole('button', { name: 'سبد خرید، ۲ محصول' }).click();
  await expect(page.getByRole('dialog')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('[data-slot="dialog-overlay"]')).toHaveCSS('animation-name', 'none');
  await closePanel(page);
  for (const width of [320, 375, 480, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await hero.getByRole('button', { name: 'نمایش اسلاید ۱: ارده ممتاز', exact: true }).click();
    await hero
      .locator('picture img')
      .first()
      .evaluate((image) => image.decode());
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Horizontal overflow at ${width}px`,
    );
    const headingSize = await hero.getByRole('heading', { level: 1 }).evaluate((heading) => ({
      height: heading.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(getComputedStyle(heading).lineHeight),
    }));
    assert.ok(
      headingSize.height <= headingSize.lineHeight + 1,
      `Brand heading wraps at ${width}px`,
    );
    const expectedImage = width >= 1024 ? 'hero-tahini-wide-v4.webp' : 'hero-tahini-scene.webp';
    assert.ok(
      (
        await hero
          .locator('picture img')
          .first()
          .evaluate((image) => image.currentSrc)
      ).includes(expectedImage),
      `Incorrect art direction at ${width}px`,
    );
    await hero.screenshot({ path: `/tmp/behjati-hero-v4-${width}.png` });
    await page.locator('#story').screenshot({ path: `/tmp/behjati-story-v4-${width}.png` });
    const banner = page.locator('#shopping-banner');
    await banner.locator('img').evaluate((image) => image.decode());
    await banner.screenshot({ path: `/tmp/behjati-shopping-v4-${width}.png` });
    await hero
      .getByRole('button', { name: 'نمایش اسلاید ۳: ارده‌های طعم‌دار', exact: true })
      .click();
    const copyBox = await hero.locator('[data-slot="hero-copy"]').boundingBox();
    const controlsBox = await hero.locator('[aria-label="کنترل اسلایدر"]').boundingBox();
    assert.ok(
      copyBox.y + copyBox.height <= controlsBox.y + 1,
      `Hero copy overlaps controls at ${width}px`,
    );
  }
  const noJS = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  await noJS.route('https://trustseal.enamad.ir/**', (route) => route.abort());
  const staticPage = await noJS.newPage();
  await staticPage.goto(baseURL, { waitUntil: 'networkidle' });
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible();
  for (const reveal of await staticPage.locator('[data-slot="reveal"]').all()) {
    await expect(reveal).toHaveCSS('opacity', '1');
  }
  await noJS.close();
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log(
    'Homepage checks passed: synchronized hero copy and links, keyboard slide navigation, desktop art direction, unified story anchors and section order, shopping banner, RTL, responsive overflow, cart persistence and totals, search, category discovery, menu, desktop navigation, hover lift and image zoom, reduced motion, visible content without JavaScript, no runtime errors.',
  );
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
