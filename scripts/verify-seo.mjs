import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const require = createRequire(import.meta.url);
const domain = 'https://sonatibehjati.ir';
const processes = [];
let browser;
async function startServer(disabled = false) {
  const probe = createServer();
  await new Promise((resolve) => probe.listen(0, '127.0.0.1', resolve));
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  const child = spawn(
    process.execPath,
    [
      require.resolve('next/dist/bin/next'),
      'start',
      '--hostname',
      '127.0.0.1',
      '--port',
      String(port),
    ],
    {
      cwd: 'apps/storefront',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        SEO_INDEXING_ENABLED: disabled ? 'false' : 'true',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  processes.push(child);
  let logs = '';
  child.stdout.on('data', (chunk) => {
    logs = (logs + chunk).slice(-3000);
  });
  child.stderr.on('data', (chunk) => {
    logs = (logs + chunk).slice(-3000);
  });
  const origin = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error('Preview stopped: ' + logs);
    try {
      if ((await fetch(origin + '/robots.txt')).ok) return origin;
    } catch {
      /* Startup. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Preview unavailable: ' + logs);
}

try {
  const origin = await startServer();
  const robots = await (await fetch(origin + '/robots.txt')).text();
  assert.match(robots, /Allow: \/\n/);
  assert.match(robots, /Sitemap: https:\/\/sonatibehjati.ir\/sitemap.xml/);
  assert.doesNotMatch(robots, /Disallow: \/\s*$/m);
  const sitemapResponse = await fetch(origin + '/sitemap.xml');
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.ok(urls.length > 4, 'Sitemap contains the real public catalog');
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.every((url) => url.startsWith(domain + '/')));
  assert.ok(
    urls.every(
      (url) => !/\/account|\/support|\/checkout|\/payment|\/QR|\/login|\/search/.test(url),
    ),
  );
  const productURL = urls.find((url) => url.includes('/product/'));
  const categoryURL = urls.find((url) => url.includes('/category/'));
  assert.ok(productURL && categoryURL, 'Active products and categories are discoverable');
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  // No JavaScript: verify what a crawler receives in the initial server HTML.
  const context = await browser.newContext({
    javaScriptEnabled: false,
    userAgent: 'Googlebot',
    baseURL: origin,
  });
  const page = await context.newPage();
  const titles = new Set();
  for (const path of [
    '/',
    '/shop',
    '/about',
    '/faq',
    new URL(categoryURL).pathname,
    new URL(productURL).pathname,
  ]) {
    const response = await page.goto(origin + path, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200, path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
    assert.equal(await page.locator('h1').count(), 1, path + ' has one main heading');
    const title = await page.title();
    assert.ok(title.includes('سنتی بهجتی'), `${path}: received title ${title}`);
    assert.ok(!titles.has(title), path + ' has a distinct title');
    titles.add(title);
    assert.equal(
      new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).href,
      new URL(domain + path).href,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S{5}/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index, follow/);
    assert.equal(
      new URL(await page.locator('meta[property="og:url"]').getAttribute('content')).href,
      new URL(domain + path).href,
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'fa_IR');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    const graph = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).flatMap((value) => JSON.parse(value));
    assert.ok(graph.length > 0, path + ' has server-rendered structured data');
    if (path === '/') {
      assert.equal(title, 'سنتی بهجتی اردکان | خرید ارده و حلواارده');
      for (const type of ['OnlineStore', 'WebSite']) {
        const node = graph.find((entry) => entry['@type'] === type);
        assert.equal(node.name, 'سنتی بهجتی');
        assert.deepEqual(node.alternateName, ['سنتی بهجتی اردکان', 'بهجتی اردکان', 'بهجتی']);
        assert.equal(node.url, domain + '/');
      }
      for (const [rel, dimensions] of [
        ['icon', 192],
        ['apple-touch-icon', 180],
      ]) {
        const link = page.locator(`head link[rel="${rel}"][type="image/png"]`).first();
        await expect(link).toHaveAttribute('type', 'image/png');
        await expect(link).toHaveAttribute('sizes', `${dimensions}x${dimensions}`);
        const response = await fetch(new URL(await link.getAttribute('href'), origin));
        assert.equal(response.status, 200);
        assert.match(response.headers.get('content-type'), /image\/png/);
        assert.doesNotMatch(response.headers.get('x-robots-tag') ?? '', /noindex/);
        const png = Buffer.from(await response.arrayBuffer());
        assert.equal(png.subarray(1, 4).toString(), 'PNG');
        assert.equal(png.readUInt32BE(16), dimensions);
        assert.equal(png.readUInt32BE(20), dimensions);
      }
      await expect(page.locator('head link[rel="icon"]').first()).toHaveAttribute(
        'sizes',
        '192x192',
      );
      const legacyIcon = await fetch(origin + '/favicon.ico');
      assert.equal(legacyIcon.status, 200);
      assert.equal(
        Buffer.from(await legacyIcon.arrayBuffer())
          .subarray(0, 4)
          .toString('hex'),
        '00000100',
      );
      // The owner removed the pre-footer About/FAQ links; retain the story menu
      // and verify the separate informational pages remain discoverable in XML.
      assert.ok(await page.locator('a[href="/#story"]').count());
      assert.ok(urls.includes(domain + '/about') && urls.includes(domain + '/faq'));
      assert.ok(!(await page.textContent('main')).includes('فروش آنلاین هنوز فعال نیست'));
    }
    if (path.includes('/product/')) {
      const product = graph.find((node) => node['@type'] === 'Product');
      assert.ok(product && product.image.length);
      assert.equal(product.offers.priceCurrency, 'IRR');
      const visiblePrice = await page
        .locator('main > section')
        .first()
        .locator('[data-product-price] p[aria-label="قیمت فعلی"]')
        .textContent();
      const toman = Number(
        visiblePrice.replace(/[۰-۹]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)).replace(/\D/g, ''),
      );
      assert.equal(
        product.offers.price,
        toman * 10,
        'Machine-readable price matches the visible price',
      );
      const crumb = graph.find((node) => node['@type'] === 'BreadcrumbList');
      assert.equal(crumb.itemListElement.at(-1).item, product.url);
    }
    if (path === '/faq') {
      const faq = graph.find((node) => node['@type'] === 'FAQPage');
      assert.equal(faq.mainEntity.length, await page.locator('article h2').count());
      for (const question of faq.mainEntity) {
        assert.ok((await page.textContent('article')).includes(question.name));
        assert.ok((await page.textContent('article')).includes(question.acceptedAnswer.text));
      }
    }
  }
  for (const path of ['/shop?sort=PRICE_ASC', '/shop?q=test', '/shop?size=1&page=2']) {
    await page.goto(origin + path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', domain + '/shop');
  }
  const missing = await page.goto(origin + '/product/seo-missing-product-404', {
    waitUntil: 'domcontentloaded',
  });
  assert.equal(missing.status(), 404);
  const invalidPage = await page.goto(origin + '/shop?page=10000', {
    waitUntil: 'domcontentloaded',
  });
  assert.equal(invalidPage.status(), 404);
  for (const path of [
    '/login',
    '/account',
    '/cart',
    '/checkout',
    '/favorites',
    '/support',
    '/search',
  ]) {
    const response = await fetch(origin + path, { redirect: 'manual' });
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
  }
  const qr = await readFile('apps/storefront/public/qr.html', 'utf8');
  for (const path of ['/QR', '/qr', '/qr.html']) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
    assert.equal(await response.text(), qr, 'QR design is preserved exactly');
  }
  const llms = await fetch(origin + '/llms.txt');
  assert.equal(llms.status, 200);
  assert.match(await llms.text(), /https:\/\/sonatibehjati.ir\/about/);
  await context.close();
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  for (const path of ['/about', '/faq']) {
    for (const width of [320, 390, 1440]) {
      await mobilePage.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
      await mobilePage.goto(origin + path, { waitUntil: 'networkidle' });
      assert.ok(
        await mobilePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        'No horizontal overflow: ' + path + ' at ' + width,
      );
      if (width === 390)
        await mobilePage.screenshot({
          path: `/tmp/behjati-seo-${path.slice(1)}-mobile.png`,
          fullPage: true,
          animations: 'disabled',
        });
    }
  }
  await mobile.close();
  const disabled = await startServer(true);
  assert.match(await (await fetch(disabled + '/robots.txt')).text(), /Disallow: \/\s*$/m);
  assert.doesNotMatch(await (await fetch(disabled + '/sitemap.xml')).text(), /<loc>/);
  const optOut = await browser.newPage({ javaScriptEnabled: false, userAgent: 'Googlebot' });
  await optOut.goto(disabled + '/about', { waitUntil: 'domcontentloaded' });
  await expect(optOut.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  console.log(
    'SEO/GEO verified: crawlable server HTML, real catalog sitemap, per-page metadata/canonicals, truthful prices/schema, visible FAQ answers, private/QR noindex, unchanged QR, responsive pages, and staging opt-out. No data, SMS or payment mutations performed.',
  );
} finally {
  await browser?.close();
  for (const child of processes) child.kill('SIGTERM');
}
