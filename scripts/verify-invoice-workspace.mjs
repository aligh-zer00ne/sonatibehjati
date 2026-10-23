import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chromium, expect } from '@playwright/test';
import { verifyLabelWorkspace } from './verify-label-workspace.mjs';
import { startAPI, db, adminOrigin } from './auth-harness.mjs';
import {
  createAdmin,
  loginAdmin,
  createCustomer,
  createOrderFixture,
  startAdmin,
  cleanupAdmin,
} from './admin-harness.mjs';

let browser, page;
try {
  await startAPI();
  await startAdmin();
  const admin = await createAdmin(),
    session = await loginAdmin(admin),
    customer = await createCustomer();
  const product = await db.product.findFirstOrThrow({ where: { isActive: true } });
  const order = await createOrderFixture(customer, product);
  await db.orderItem.deleteMany({ where: { orderId: order.id } });
  const lines = Array.from({ length: 36 }, (_, i) => ({
    orderId: order.id,
    productId: product.id,
    productTitle: `محصول کنجدی با عنوان طولانی برای بررسی چاپ و خوانایی ITEM-${String(i + 1).padStart(3, '0')}`,
    productWeight: 'بستهٔ یک کیلوگرمی',
    unitPrice: 123456,
    quantity: 2,
    lineSubtotal: 246912,
    discountAmount: 1234,
    lineTotal: 245678,
  }));
  await db.orderItem.createMany({ data: lines });
  const subtotal = 246912 * 36,
    discount = 1234 * 36,
    shipping = 78900,
    total = subtotal - discount + shipping;
  await db.order.update({
    where: { id: order.id },
    data: {
      salesChannel: 'INSTAGRAM',
      status: 'PROCESSING',
      shippingMethod: 'POST',
      subtotal,
      discount,
      shipping,
      total,
      offlinePaidAmount: 50000,
      addressSnapshot: {
        ...customer.snapshot,
        postalAddress:
          'خیابان نمونه و نشانی طولانی برای آزمون شکستن خطوط در رسید حرارتی، کوچهٔ بهجتی، پلاک ۱۲، واحد ۳',
      },
    },
  });
  const snapshot = await db.order.findUniqueOrThrow({
    where: { id: order.id },
    include: { items: true },
  });
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addCookies(
    session.cookies.split('; ').map((v) => {
      const i = v.indexOf('=');
      return { name: v.slice(0, i), value: v.slice(i + 1), url: adminOrigin };
    }),
  );
  page = await context.newPage();
  const errors = [],
    mutations = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (r.url().endsWith('/api/admin') && /^mutation\b/.test(r.postDataJSON()?.query ?? ''))
      mutations.push(r.postDataJSON().query);
  });
  await page.goto(`${adminOrigin}/admin/orders/${order.id}`);
  const opener = page.getByRole('button', { name: 'چاپ فاکتور / PDF', exact: true });
  await opener.click();
  const workspace = page.locator('[data-invoice-workspace]');
  await expect(workspace).toBeVisible();
  await expect(page.getByRole('heading', { name: 'پیش‌نمایش چاپ', exact: true })).toBeVisible();
  assert.equal(Math.round((await workspace.boundingBox()).width), 1440);
  await page.evaluate(() => {
    window.print = () => {
      window.__printCalls = (window.__printCalls ?? 0) + 1;
    };
  });
  const beforeMutations = mutations.length;
  for (const [format, label, widthMm, heightMm] of [
    ['A5', 'فاکتور A5', 148, 210],
    ['A4', 'فاکتور A4', 210, 297],
    ['THERMAL', 'رسید ۸ سانتی', 80, null],
  ]) {
    await workspace.getByRole('button', { name: label, exact: true }).click();
    const sheet = page.locator(`[data-invoice] [data-invoice-sheet="${format}"]`);
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('[data-invoice-line]')).toHaveCount(36);
    await expect(sheet.locator('[data-invoice-totals] [data-amount]').last()).toHaveAttribute(
      'data-amount',
      String(total),
    );
    await expect(sheet).toContainText('دریافت ثبت‌شده در فروشگاه');
    await expect(sheet).toContainText('هزینه ارسال');
    const coloredText = await sheet
      .locator('p,b,th,td,h1,h2,a,dt,dd,span')
      .evaluateAll((elements) =>
        elements
          .filter((el) => {
            const rgb = getComputedStyle(el)
              .color.match(/[\d.]+/g)
              ?.slice(0, 3)
              .map(Number);
            return rgb?.length === 3 && (rgb[0] !== rgb[1] || rgb[1] !== rgb[2]);
          })
          .map((el) => ({ text: el.textContent.slice(0, 50), color: getComputedStyle(el).color })),
      );
    assert.deepEqual(coloredText, [], `${format}: monochrome text stays legible without color ink`);
    await expect(sheet.locator('thead')).toHaveCSS('color', 'rgb(17, 17, 17)');
    if (format === 'THERMAL') {
      await expect(sheet).not.toContainText('نشانی:');
      await expect(sheet).not.toContainText('کد پستی:');
      await expect(sheet.getByRole('columnheader')).toHaveText([
        'نام کالا',
        'تعداد',
        'فی واحد',
        'مبلغ کل',
      ]);
    } else if (format === 'A4')
      await expect(sheet).toContainText(
        '1234567890'.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]),
      );
    await expect(
      sheet.getByRole('link').filter({ has: page.locator('[data-brand-qr]') }),
    ).toHaveAttribute('href', 'https://sonatibehjati.ir/QR');
    assert.ok(Math.abs((await sheet.evaluate((el) => el.offsetWidth)) - (widthMm * 96) / 25.4) < 1);
    for (const el of await sheet
      .locator('table, [data-invoice-line], [data-invoice-totals]')
      .all()) {
      assert.ok(
        await el.evaluate((node) => node.scrollWidth <= node.clientWidth + 2),
        `${format}: content fits its paper`,
      );
    }
    const calls = await page.evaluate(() => window.__printCalls ?? 0);
    await workspace.getByRole('button', { name: 'چاپ / ذخیره PDF', exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.__printCalls)).toBe(calls + 1);
    await page.screenshot({
      path: `/tmp/behjati-invoice-${format}-desktop.png`,
      fullPage: false,
      animations: 'disabled',
    });
    await page.emulateMedia({ media: 'print' });
    await expect(workspace).toBeHidden();
    await expect(page.locator('#behjati-admin-print')).toBeVisible();
    const file = `/tmp/behjati-invoice-${format}.pdf`;
    await page.pdf({
      path: file,
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: false,
    });
    const info = execFileSync('pdfinfo', [file], { encoding: 'utf8' });
    if (format === 'A5') {
      const noBackground = '/tmp/behjati-invoice-A5-no-background.pdf';
      await page.pdf({
        path: noBackground,
        preferCSSPageSize: true,
        printBackground: false,
        displayHeaderFooter: false,
      });
      const plain = execFileSync('pdftotext', ['-layout', noBackground, '-'], {
        encoding: 'utf8',
      }).replace(/[\u202a-\u202e\u2066-\u2069]/g, '');
      assert.match(plain, /ITEM-\s*001/);
      assert.match(plain, /ITEM-\s*036/);
    }
    const dimensions = info.match(/Page size:\s+([\d.]+) x ([\d.]+)/);
    assert.ok(dimensions && Math.abs(Number(dimensions[1]) - (widthMm * 72) / 25.4) < 1);
    if (heightMm) {
      assert.ok(Math.abs(Number(dimensions[2]) - (heightMm * 72) / 25.4) < 1);
      assert.ok(Number(info.match(/Pages:\s+(\d+)/)[1]) > 1, 'Long paper invoices paginate');
    } else
      assert.equal(Number(info.match(/Pages:\s+(\d+)/)[1]), 1, 'Receipt grows with all its lines');
    const text = execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
    assert.ok(
      /ITEM-\s*001/.test(text.replace(/[\u202a-\u202e\u2066-\u2069]/g, '')) &&
        /ITEM-\s*036/.test(text.replace(/[\u202a-\u202e\u2066-\u2069]/g, '')),
      'First and last lines survive printing',
    );
    assert.ok(
      text.includes(new Intl.NumberFormat('fa-IR').format(total * 10)),
      'Exact rial total survives printing',
    );
    assert.ok(text.includes('nexoraict.ir'));
    assert.ok(!text.includes(admin.email) && !text.includes('Save as PDF'));
    await page.emulateMedia({ media: 'screen' });
  }
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    workspace.getByRole('button', { name: 'ذخیره فایل فاکتور', exact: true }).click(),
  ]);
  await download.saveAs('/tmp/behjati-invoice-export.html');
  const exported = await (
    await import('node:fs/promises')
  ).readFile('/tmp/behjati-invoice-export.html', 'utf8');
  assert.ok(
    exported.includes('ITEM-036') &&
      exported.includes('data:image/') &&
      exported.includes('base64'),
  );
  assert.ok(!exported.includes('<script') && !exported.includes(admin.email));
  const portable = await context.newPage();
  await portable.route('**/*', (route) => route.abort());
  await portable.setContent(exported);
  await expect(portable.locator('[data-invoice-line]')).toHaveCount(36);
  assert.ok(
    await portable
      .locator('img')
      .evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)),
  );
  await portable.close();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const label of ['فاکتور A4', 'رسید ۸ سانتی']) {
      await workspace.getByRole('button', { name: label, exact: true }).click();
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
        .toBeLessThanOrEqual(1);
      const sheet = page.locator('[data-invoice]');
      await expect
        .poll(async () => {
          const box = await sheet.boundingBox();
          return box.x >= 0 && box.x + box.width <= width + 1;
        })
        .toBe(true);
    }
    if (width === 390)
      await page.screenshot({
        path: '/tmp/behjati-invoice-thermal-mobile.png',
        fullPage: false,
        animations: 'disabled',
      });
  }
  await workspace.getByRole('button', { name: 'فاکتور A4', exact: true }).click();
  await workspace.getByRole('button', { name: 'بزرگ‌نمایی', exact: true }).click();
  const zoomed = await workspace.getByLabel('درصد بزرگ‌نمایی', { exact: true }).innerText();
  await workspace.getByRole('button', { name: 'اندازهٔ مناسب', exact: true }).click();
  assert.notEqual(
    await workspace.getByLabel('درصد بزرگ‌نمایی', { exact: true }).innerText(),
    zoomed,
  );
  await page.keyboard.press('Escape');
  await expect(workspace).toBeHidden();
  await expect(opener).toBeFocused();
  await opener.click();
  await expect(workspace.getByRole('button', { name: 'فاکتور A4', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await workspace.getByRole('button', { name: 'بستن پیش‌نمایش چاپ', exact: true }).click();
  // A label retains its independent 150x100mm print configuration.
  await page.getByRole('button', { name: 'لیبل پستی / چاپ', exact: true }).click();
  await expect(page.locator('[data-label-workspace] [data-label-sheet]')).toBeVisible();
  await expect(page.getByText('شخصی‌سازی لیبل', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(page.locator('[data-label-workspace]')).toBeVisible();
  assert.match(
    await page.locator('#behjati-admin-print style').textContent(),
    /size: 150mm 100mm; margin: 4mm/,
  );
  for (const label of ['لیبل A5', 'لیبل ۱۵ × ۱۰']) {
    const labelWorkspace = page.locator('[data-label-workspace]');
    await labelWorkspace.getByRole('button', { name: label, exact: true }).click();
    await expect(labelWorkspace.locator('[data-label-item]')).toHaveCount(36);
    await page.evaluate(() => document.fonts.ready);
    await expect(
      labelWorkspace.getByRole('button', { name: 'چاپ / ذخیره PDF', exact: true }),
    ).toBeEnabled();
    await page.emulateMedia({ media: 'print' });
    const path =
      label === 'لیبل A5'
        ? '/tmp/behjati-label-long-A5.pdf'
        : '/tmp/behjati-label-long-THERMAL.pdf';
    await page.pdf({ path, preferCSSPageSize: true, printBackground: true });
    const text = execFileSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8' }).replace(
      /[\u202a-\u202e\u2066-\u2069]/g,
      '',
    );
    for (let item = 1; item <= 36; item++)
      assert.ok(
        new RegExp(`ITEM-\\s*${String(item).padStart(3, '0')}`).test(text),
        `Long label retains item ${item}`,
      );
    await page.emulateMedia({ media: 'screen' });
  }
  await page.getByRole('button', { name: 'بستن پیش‌نمایش چاپ', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  assert.equal(
    mutations.length,
    beforeMutations,
    'No mutations from invoice/format/zoom/print/label preview',
  );
  assert.deepEqual(
    await db.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true } }),
    snapshot,
    'Printing never changes stored invoice',
  );
  const short = await createOrderFixture(customer, product);
  await page.goto(`${adminOrigin}/admin/orders/${short.id}`);
  await page.getByRole('button', { name: 'چاپ فاکتور / PDF', exact: true }).click();
  for (const [key, label] of [
    ['A5', 'فاکتور A5'],
    ['A4', 'فاکتور A4'],
    ['THERMAL', 'رسید ۸ سانتی'],
  ]) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(`[data-invoice] [data-invoice-sheet="${key}"]`)).toBeVisible();
    await page.screenshot({
      path: `/tmp/behjati-invoice-reference-${key}.png`,
      fullPage: false,
      animations: 'disabled',
    });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
      path: `/tmp/behjati-invoice-reference-${key}.pdf`,
      preferCSSPageSize: true,
      printBackground: true,
    });
    const info = execFileSync('pdfinfo', [`/tmp/behjati-invoice-reference-${key}.pdf`], {
      encoding: 'utf8',
    });
    assert.equal(Number(info.match(/Pages:\s+(\d+)/)[1]), 1, 'Normal invoices fit one sheet');
    await page.emulateMedia({ media: 'screen' });
  }
  await page.getByRole('button', { name: 'بستن پیش‌نمایش چاپ', exact: true }).click();
  await verifyLabelWorkspace(page, db, short.id);
  assert.deepEqual(errors, []);
  console.log(
    'Invoice workspace passed: full-screen A4/A5/80mm, exact saved rial totals/discounts/shipping/receipts, long Persian text, first/last lines, real multipage PDFs and measured roll, toolbar exclusion, zoom/fit at 320–1440px, Escape/focus return, format preference, untouched label page size and zero invoice mutations. No SMS/bank call.',
  );
} catch (e) {
  await page?.screenshot({ path: '/tmp/behjati-invoice-failure.png', fullPage: false });
  throw e;
} finally {
  await browser?.close();
  await cleanupAdmin();
}
