import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
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
  await page.evaluate(async () => {
    const visibleImages = Array.from(document.images).filter((image) => !image.closest('[inert]'));
    for (const image of visibleImages) image.loading = 'eager';
    await Promise.race([
      Promise.all(visibleImages.map((image) => image.decode())),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                'Image decode timed out: ' +
                  Array.from(document.images)
                    .filter((image) => !image.complete)
                    .map((image) => image.currentSrc || image.src)
                    .join(', '),
              ),
            ),
          20000,
        ),
      ),
    ]);
    await Promise.race([
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => {})),
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Animations did not settle')), 15000),
      ),
    ]);
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
  await page.goto(baseURL, { waitUntil: 'load' });
  const hero = page.getByRole('region', { name: 'تصاویر محصولات کنجدی' });
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('سنتی بهجتی');
  await hero.getByRole('button', { name: 'نمایش اسلاید ۲: روغن کنجد', exact: true }).click();
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('طلای کنجد');
  await expect(hero.getByRole('link', { name: 'دیدن روغن‌ها' })).toHaveAttribute(
    'href',
    '/category/oil',
  );
  await hero.getByRole('button', { name: 'نمایش اسلاید ۳: ارده‌های طعم‌دار', exact: true }).click();
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('طعم‌های تازه');
  await expect(hero.getByRole('link', { name: 'کشف طعم‌ها' })).toHaveAttribute(
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
    [
      'categories',
      'products',
      'story',
      'products-tahini',
      'products-halva',
      'products-oil',
      'products-traditional-sweets',
      'products-sesame',
    ],
    'The merged story must follow bestsellers; the promotional banner is now the footer',
  );
  await expect(page.getByRole('region', { name: 'آشنایی با سنتی بهجتی' })).toHaveCount(0);
  await expect(page.locator('#story')).not.toContainText('داستان سنتی بهجتی و اردکان');
  await expect(page.locator('#story')).toContainText('بیش از ۱۰ سال سابقه');
  for (const slug of ['tahini', 'halva', 'oil', 'traditional-sweets', 'sesame']) {
    const row = page.locator(`#products-${slug}`);
    for (const card of await row.locator('article[data-product-slug]').all())
      await expect(card.locator('a[href^="/category/"]')).toHaveCount(0);
    const cards = await row
      .locator('article[data-product-slug]')
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().y));
    assert.ok(
      cards.every((y) => Math.abs(y - cards[0]) < 1),
      `Category ${slug} must stay on one horizontal row`,
    );
  }
  await expect(page.locator('footer nav a')).toHaveText(['خانه', 'محصولات', 'درباره ما']);
  await expect(page.locator('footer [data-footer-mascot]')).toHaveCount(1);
  const icon = await page.locator('link[rel="icon"][href^="/icon.png"]').getAttribute('href');
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
  await page.reload({ waitUntil: 'load' });
  assert.equal(
    await page.locator('[data-product-slug="traditional-halva-500"] output').first().textContent(),
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
  await page.goto(baseURL, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'باز کردن فهرست' }).click();
  assert.equal(await page.getByRole('dialog').locator('a[href="/#ardakan"]').count(), 0);
  assert.equal(await page.getByRole('dialog').locator('a[href="/#story"]').count(), 1);
  await page.getByRole('dialog').getByRole('link', { name: 'داستان سنتی بهجتی و اردکان' }).click();
  await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'hidden' });
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(baseURL, { waitUntil: 'load' });
  await scrollAll(page);
  await page.screenshot({ path: '/tmp/behjati-current-desktop.png', fullPage: true });
  await expect(hero.locator('picture img').first()).toHaveJSProperty('complete', true);
  assert.ok(
    (
      await hero
        .locator('picture img')
        .first()
        .evaluate((image) => image.currentSrc)
    ).includes('hero-tahini-desktop-v6'),
    'Desktop must use its dedicated composition instead of cropping the mobile photograph',
  );
  assert.equal(await page.getByRole('navigation', { name: 'ناوبری موبایل' }).isVisible(), false);
  const actions = await page
    .locator('[data-slot="header-actions"] > *')
    .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
  assert.equal(actions.length, 2);
  assert.ok(
    Math.abs(actions[0].x - (actions[1].x + actions[1].width)) < 1,
    'Desktop account and cart controls must be adjacent',
  );

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
  for (const width of [320, 375, 390, 480, 600, 640, 768, 1024, 1440]) {
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
    const expectedImage = width >= 480 ? 'hero-tahini-desktop-v6' : 'hero-tahini-mobile-v6';
    assert.ok(
      (
        await hero
          .locator('picture img')
          .first()
          .evaluate((image) => image.currentSrc)
      ).includes(expectedImage),
      `Incorrect art direction at ${width}px`,
    );
    await hero.screenshot({ path: `/tmp/behjati-hero-v6-${width}.png` });
    await page.locator('#story').screenshot({ path: `/tmp/behjati-story-v6-${width}.png` });
    const footer = page.locator('footer');
    await footer.locator('[data-footer-mascot]').evaluate((image) => image.decode());
    await footer.screenshot({ path: `/tmp/behjati-footer-${width}.png` });
    const footerBox = await footer.locator('[data-slot="footer-banner-background"]').boundingBox();
    const outlineBox = await footer.locator('[data-slot="footer-ardakan"]').boundingBox();
    assert.ok(
      Math.abs(outlineBox.x - footerBox.x - 1) < 1,
      `Footer skyline must start at the left edge at ${width}px`,
    );
    assert.ok(
      Math.abs(outlineBox.width - footerBox.width + 2) < 1,
      `Footer skyline must fill the panel width at ${width}px`,
    );
    await expect(footer.locator('[data-slot="footer-banner-background"]')).toHaveCSS(
      'background-image',
      /^radial-gradient\(at (?:0px 100%|left bottom), rgb\(188, 48, 52\) 0(?:px|%), rgb\(152, 28, 41\) 45%, rgb\(109, 16, 34\) 100%\)$/,
    );
    const mascotBox = await footer.locator('[data-footer-mascot]').locator('..').boundingBox();
    const badgeBox = await footer.locator('[aria-label="نشان‌های اعتماد و پرداخت"]').boundingBox();
    const navBox = await footer.locator('nav').boundingBox();
    const socialBox = await footer
      .locator('[aria-label="شبکه‌های اجتماعی سنتی بهجتی"]')
      .boundingBox();
    const center = footerBox.x + footerBox.width / 2;
    assert.ok(Math.abs(mascotBox.x - footerBox.x - 1) < 1, `Boy must align left at ${width}px`);
    assert.ok(
      Math.abs(mascotBox.y + mascotBox.height - footerBox.y - footerBox.height + 1) < 1,
      `Boy must align with the panel bottom at ${width}px`,
    );
    assert.ok(
      badgeBox.x + badgeBox.width / 2 > center &&
        navBox.x + navBox.width / 2 > center &&
        socialBox.x + socialBox.width / 2 > center,
      `Footer navigation, social and trust items must sit to the right at ${width}px`,
    );
    assert.ok(
      badgeBox.y + badgeBox.height <= socialBox.y && socialBox.y + socialBox.height <= navBox.y,
      `Footer must stack badges above social icons above links at ${width}px`,
    );
    assert.ok(Math.abs(footerBox.width - width) < 2, `Footer must span the viewport at ${width}px`);
    const brandBox = await footer.locator('[data-slot="footer-brand"]').boundingBox();
    assert.ok(
      Math.abs(brandBox.x + brandBox.width / 2 - center) < 1,
      `Footer branding must be centered at ${width}px`,
    );
    assert.ok(
      brandBox.y + brandBox.height <= badgeBox.y,
      `Footer branding must sit above the trust row at ${width}px`,
    );
    await expect(footer.locator('[data-slot="footer-brand"]')).toContainText(
      'فروشگاه سنتی بهجتی اردکان',
    );
    for (const badge of await footer
      .locator('[aria-label="نشان‌های اعتماد و پرداخت"] > div')
      .all()) {
      const rect = await badge.boundingBox();
      assert.ok(
        rect.width <= 48 && rect.height <= 48,
        `Trust badges must be compact at ${width}px`,
      );
    }
    if (width < 768) {
      assert.ok(
        badgeBox.x >= mascotBox.x + mascotBox.width || badgeBox.y + badgeBox.height <= mascotBox.y,
        `Mobile badges must not overlap the boy at ${width}px`,
      );
      assert.ok(
        socialBox.x >= mascotBox.x + mascotBox.width,
        `Mobile social icons must not overlap the boy at ${width}px`,
      );
      const heroBox = await hero.boundingBox();
      assert.ok(
        Math.abs(heroBox.width - width) < 2,
        `Mobile hero must span the viewport at ${width}px`,
      );
      assert.equal(
        heroBox.height,
        width >= 640 ? 200 : width >= 480 ? 275 : width >= 375 ? 250 : 240,
        `Mobile hero height must be half its original height at ${width}px`,
      );
      assert.equal(
        (await page.locator('#story').boundingBox()).height,
        width >= 640 ? 200 : width >= 480 ? 250 : width >= 375 ? 230 : 215,
        `Mobile story height must be half its original height at ${width}px`,
      );
    }
    if (width === 1440) {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await footer.locator('nav a').first().hover();
      await expect(footer.locator('[data-footer-mascot]')).toHaveCSS('translate', '0px -4px');
      await expect(footer.locator('[data-footer-mascot]')).toHaveCSS('rotate', '-2deg');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(footer.locator('[data-footer-mascot]')).toHaveCSS('translate', 'none');
      await expect(footer.locator('[data-footer-mascot]')).toHaveCSS('rotate', 'none');
    }
    for (const social of await footer
      .locator('[aria-label="شبکه‌های اجتماعی سنتی بهجتی"] > span')
      .all())
      await expect(social).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    const storyBox = await page.locator('#story').boundingBox();
    const storyCopy = await page.locator('[data-slot="story-copy"]').boundingBox();
    assert.ok(
      storyCopy.y >= storyBox.y && storyCopy.y + storyCopy.height < storyBox.y + storyBox.height,
      `Story copy must stay on the image at ${width}px`,
    );
    await expect(page.locator('[data-slot="story-copy"]')).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
    const storySource = await page.locator('#story img').evaluate((image) => image.currentSrc);
    assert.ok(storySource.includes(width >= 640 ? 'story-desktop-v6' : 'story-mobile-v6'));
    assert.equal(
      await page.locator('a[href="/#ardakan"]').count(),
      0,
      'The old separate Ardakan menu entry must be removed',
    );
    for (const [index, label] of ['ارده ممتاز', 'روغن کنجد', 'ارده‌های طعم‌دار'].entries()) {
      await hero
        .getByRole('button', {
          name: `نمایش اسلاید ${['۱', '۲', '۳'][index]}: ${label}`,
          exact: true,
        })
        .click();
      const copy = hero.locator('[data-slot="hero-copy"]');
      const copyBox = await copy.boundingBox();
      const imageBox = await hero.boundingBox();
      const controlsBox = await hero.locator('[aria-label="کنترل اسلایدر"]').boundingBox();
      assert.ok(
        copyBox.y >= imageBox.y && copyBox.y + copyBox.height <= imageBox.y + imageBox.height,
        `Hero copy must stay over the photograph at ${width}px, slide ${index + 1}`,
      );
      assert.ok(
        copyBox.y + copyBox.height <= controlsBox.y + 1,
        `Hero copy overlaps controls at ${width}px, slide ${index + 1}`,
      );
      assert.ok(
        await copy.evaluate((node) => node.scrollWidth <= node.clientWidth),
        `Hero copy clips horizontally at ${width}px, slide ${index + 1}`,
      );
      await expect(copy).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(copy).toHaveCSS('border-top-width', '0px');
      if (width < 768) {
        assert.ok(
          copyBox.x >= imageBox.x + imageBox.width * 0.5,
          `Mobile copy must stay to the right of the product group at ${width}px`,
        );
      }
      if ([320, 390, 480, 768, 1440].includes(width)) {
        await hero
          .locator('picture img')
          .nth(index)
          .evaluate((image) => image.decode());
        await hero.screenshot({ path: `/tmp/behjati-hero-v6-${width}-slide-${index + 1}.png` });
      }
    }
  }
  const qualityReport = [];
  for (const [viewportWidth, dpr] of [
    [390, 3],
    [768, 2],
    [1440, 2],
  ]) {
    const retina = await browser.newContext({
      viewport: { width: viewportWidth, height: 1000 },
      deviceScaleFactor: dpr,
      reducedMotion: 'reduce',
    });
    await retina.route('https://trustseal.enamad.ir/**', (route) => route.abort());
    const qualityPage = await retina.newPage();
    await qualityPage.goto(baseURL, { waitUntil: 'load' });
    for (const selector of ['[aria-label="تصاویر محصولات کنجدی"] picture img', '#story img']) {
      const image = qualityPage.locator(selector).first();
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((node) => node.decode());
      const info = await image.evaluate((node) => ({
        src: node.currentSrc,
        width: node.clientWidth,
        height: node.clientHeight,
      }));
      const pathname = new URL(info.src).pathname;
      assert.ok(
        pathname.startsWith('/images/home/'),
        'Editorial artwork must avoid a second lossy optimization pass',
      );
      const response = await qualityPage.request.get(info.src);
      const bytes = await response.body();
      assert.deepEqual(
        bytes,
        await readFile(`apps/storefront/public${pathname}`),
        'The browser must receive the exact prepared WebP',
      );
      const metadata = await sharp(bytes).metadata();
      const coverWidth = Math.max(info.width, (info.height * metadata.width) / metadata.height);
      const effectiveDpr = metadata.width / coverWidth;
      assert.ok(
        effectiveDpr >= dpr * 0.94,
        `Insufficient native image detail: ${selector} at ${viewportWidth}px/${dpr}x (${effectiveDpr.toFixed(2)}x available)`,
      );
      qualityReport.push({
        viewportWidth,
        dpr,
        selector,
        ...info,
        decodedWidth: metadata.width,
        decodedHeight: metadata.height,
        requiredWidth: Math.ceil(coverWidth * dpr),
        effectiveDpr: Number(effectiveDpr.toFixed(2)),
      });
    }
    await retina.close();
  }
  await writeFile('/tmp/behjati-quality-after-v6.json', JSON.stringify(qualityReport, null, 2));
  const noJS = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  await noJS.route('https://trustseal.enamad.ir/**', (route) => route.abort());
  const staticPage = await noJS.newPage();
  await staticPage.goto(baseURL, { waitUntil: 'load' });
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible();
  for (const reveal of await staticPage.locator('[data-slot="reveal"]').all()) {
    await expect(reveal).toHaveCSS('opacity', '1');
  }
  await noJS.close();
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log(
    'Homepage checks passed: synchronized hero copy and links, keyboard slide navigation, responsive editorial art direction, compact full-width mobile hero with side-by-side copy and products, native image delivery and retina pixel density, unified story menus, anchors and section order, banner-style footer with full-width skyline, right-side stacked badges, links and social icons, top-center branding, compact badges, bottom-left mascot and hover/reduced-motion behavior, transparent social icons, RTL, responsive overflow, cart persistence and totals, search, category discovery, menu, desktop navigation, hover lift and image zoom, reduced motion, visible content without JavaScript, no runtime errors.',
  );
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
