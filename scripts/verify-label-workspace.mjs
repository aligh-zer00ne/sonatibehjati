import { verifySharedPrintImage } from './shared-print-image-checks.mjs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { expect } from '@playwright/test';

// Runs with the invoice suite's isolated API, administrator and temporary order.
export async function verifyLabelWorkspace(page, db, orderId) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });
  await db.order.update({
    where: { id: orderId },
    data: {
      shippingWeightGrams: 2000,
      shippingMethod: 'POST',
      addressSnapshot: {
        ...order.addressSnapshot,
        recipientName: 'گیرنده سفارش RECIPIENT',
        recipientPhone: '09123456789',
        postalAddress: 'تهران، خیابان نمونه، کوچه بهجتی، پلاک ۱۲، واحد ۳ ORDER-ADDRESS',
        postalCode: '1234567890',
      },
    },
  });
  const saved = {
    senderName: 'سنتی بهجتی اردکان SENDER',
    senderPhone: '09131564876',
    senderAddress: 'اردکان، نشانی ثبت‌شده فرستنده SENDER-ADDRESS',
    senderPostalCode: '8951812345',
    recipientName: 'STALE-RECIPIENT',
    recipientPhone: '09999999999',
    recipientAddress: 'STALE-ADDRESS',
    recipientPostalCode: '9999999999',
    carrier: 'STALE-CARRIER',
    packageWeight: 'STALE-WEIGHT',
    packageContent: 'STALE-CONTENT',
    trackingNumber: '123456789012345678901234',
    note: 'با احتیاط حمل شود NOTE',
    paperSize: 'THERMAL',
  };
  await db.orderShippingLabel.create({ data: { orderId, data: saved } });
  await page.reload();
  const snapshot = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true, shippingLabel: true },
  });
  const open = page.getByRole('button', { name: 'لیبل پستی / چاپ', exact: true });
  await open.click();
  const workspace = page.locator('[data-label-workspace]');
  await expect(workspace).toBeVisible();
  await expect(page.locator('[data-label-workspace]')).toHaveCount(1);
  await expect(page.getByText('شخصی‌سازی لیبل', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'ذخیره لیبل سفارش', exact: true })).toHaveCount(0);
  await expect(workspace.locator('input, textarea')).toHaveCount(0);
  await expect(page.locator('#behjati-admin-print')).toHaveCount(1);
  for (const [key, label, width, height] of [
    ['THERMAL', 'لیبل ۱۵ × ۱۰', 150, 100],
    ['A5', 'لیبل A5', 210, 148],
  ]) {
    await workspace.getByRole('button', { name: label, exact: true }).click();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.querySelectorAll('[data-label-sheet] img')].map((img) => img.decode()),
      );
    });
    await page.waitForTimeout(150);
    const sheet = workspace.locator('[data-label-sheet]');
    for (const token of [
      'SENDER-ADDRESS',
      'ORDER-ADDRESS',
      'RECIPIENT',
      'NOTE',
      'nexoraict.ir',
      '۲٬۰۰۰ گرم',
      'پست',
    ])
      await expect(sheet).toContainText(token);
    for (const token of [
      'STALE-RECIPIENT',
      'STALE-ADDRESS',
      'STALE-CONTENT',
      'STALE-WEIGHT',
      'STALE-CARRIER',
      'برای پیگیری مرسوله',
    ])
      await expect(sheet).not.toContainText(token);
    await expect(sheet.locator('[data-label-item]')).toHaveCount(order.items.length);
    await expect(sheet.locator('[data-brand-qr]').locator('..')).toHaveAttribute(
      'href',
      'https://sonatibehjati.ir/QR',
    );
    await expect(sheet.getByAltText(/بارکد رهگیری/)).toBeVisible();
    await page.screenshot({ path: `/tmp/behjati-label-${key}.png`, animations: 'disabled' });
    await page.emulateMedia({ media: 'print' });
    const path = `/tmp/behjati-label-${key}.pdf`;
    await page.pdf({ path, preferCSSPageSize: true, printBackground: true });
    const info = execFileSync('pdfinfo', [path], { encoding: 'utf8' });
    assert.equal(
      Number(info.match(/Pages:\s+(\d+)/)[1]),
      1,
      'Normal label fits one physical sheet',
    );
    const dimensions = info.match(/Page size:\s+([\d.]+) x ([\d.]+)/);
    assert.ok(Math.abs((Number(dimensions[1]) * 25.4) / 72 - width) < 1);
    assert.ok(Math.abs((Number(dimensions[2]) * 25.4) / 72 - height) < 1);
    const text = execFileSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8' }).replace(
      /[\u202a-\u202e\u2066-\u2069]/g,
      '',
    );
    for (const token of ['RECIPIENT', 'SENDER', 'NOTE', 'nexoraict.ir'])
      assert.ok(text.includes(token), `Printed ${token}`);
    assert.ok(!text.includes('Save as PDF'));
    await page.emulateMedia({ media: 'screen' });
  }
  await verifySharedPrintImage(page, workspace, 'label');
  const download = page.waitForEvent('download');
  await workspace.getByRole('button', { name: 'ذخیره فایل لیبل', exact: true }).click();
  await (await download).saveAs('/tmp/behjati-label-export.html');
  const offline = await page.context().newPage();
  await offline.route('http**/*', (route) => route.abort());
  await offline.goto('file:///tmp/behjati-label-export.html');
  assert.equal(await offline.locator('script').count(), 0);
  assert.ok(
    await offline
      .locator('img')
      .evaluateAll((images) => images.every((img) => img.complete && img.naturalWidth > 0)),
  );
  await offline.close();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await workspace.getByRole('button', { name: 'اندازهٔ مناسب', exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      .toBe(true);
    await expect(
      workspace.getByRole('button', { name: 'بستن پیش‌نمایش چاپ', exact: true }),
    ).toBeInViewport();
    if (width === 390)
      await page.screenshot({ path: '/tmp/behjati-label-mobile.png', animations: 'disabled' });
  }
  await page.keyboard.press('Escape');
  await expect(workspace).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'جزئیات سفارش', exact: true })).toBeVisible();
  await expect(open).toBeFocused();
  await expect(page.locator('#behjati-admin-print')).toHaveCount(0);
  assert.deepEqual(
    await db.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: true, shippingLabel: true },
    }),
    snapshot,
    'Opening/format/export/printing never changes order or saved label',
  );
  console.log(
    'Direct label workspace passed: one dialog/no editor, actual order address/carrier/weight/items over stale label overrides, saved sender/tracking, one-page 150×100/A5 PDFs, offline HTML, mobile fit, Escape/focus and no writes.',
  );
}
