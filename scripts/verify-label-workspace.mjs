import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { expect } from '@playwright/test';

// Shared real-browser verification: invoked after the invoice regression with its isolated fixtures.
export async function verifyLabelWorkspace(page, db, orderId) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const snapshot = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  await page.getByRole('button', { name: 'لیبل پستی / چاپ', exact: true }).click();
  await page.getByLabel('نام فرستنده', { exact: true }).fill('سنتی بهجتی اردکان SENDER');
  await page.getByLabel('تلفن فرستنده', { exact: true }).fill('09131564876');
  await page
    .getByLabel('نشانی فرستنده', { exact: true })
    .fill('اردکان، نشانی آزمایشی فرستنده SENDER-ADDRESS');
  await page.getByLabel('کد پستی فرستنده', { exact: true }).fill('8951812345');
  await page.getByLabel('نام گیرنده', { exact: true }).fill('گیرنده آزمایشی RECIPIENT');
  await page.getByLabel('تلفن گیرنده', { exact: true }).fill('09123456789');
  await page
    .getByLabel('نشانی گیرنده', { exact: true })
    .fill('تهران، خیابان نمونه، کوچه بهجتی، پلاک ۱۲، واحد ۳ RECIPIENT-ADDRESS');
  await page.getByLabel('کد پستی گیرنده', { exact: true }).fill('1234567890');
  await page
    .getByLabel('محتویات بسته (اختیاری)', { exact: true })
    .fill('ارده ۲ عدد، روغن کنجد ۱ عدد CONTENT');
  await page.getByLabel('وزن بسته', { exact: true }).fill('۲ کیلوگرم');
  await page.getByLabel('روش ارسال / شرکت حمل', { exact: true }).fill('پست پیشتاز');
  await page
    .getByLabel('یادداشت روی بسته (اختیاری)', { exact: true })
    .fill('لطفاً با احتیاط حمل شود NOTE');
  await page.getByLabel('کد رهگیری (اختیاری)', { exact: true }).fill('123456789012345678901234');
  const open = page.getByRole('button', { name: 'چاپ لیبل / PDF', exact: true });
  await open.click();
  const workspace = page.locator('[data-label-workspace]');
  await expect(workspace).toBeVisible();
  await expect(page.locator('#behjati-admin-print')).toHaveCount(1);
  for (const [key, label, width, height] of [
    ['THERMAL', 'لیبل ۱۵ × ۱۰', 150, 100],
    ['A5', 'لیبل A5', 210, 148],
  ]) {
    await workspace.getByRole('button', { name: label, exact: true }).click();
    await expect(
      workspace.getByRole('button', { name: 'چاپ / ذخیره PDF', exact: true }),
    ).toBeEnabled();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.querySelectorAll('[data-label-sheet] img')].map((img) => img.decode()),
      );
    });
    await page.waitForTimeout(200);
    const sheet = workspace.locator('[data-label-sheet]');
    for (const token of [
      'SENDER-ADDRESS',
      'RECIPIENT-ADDRESS',
      'CONTENT',
      'NOTE',
      'پست پیشتاز',
      'nexoraict.ir',
    ])
      await expect(sheet).toContainText(token);
    await expect(sheet.locator('[data-brand-qr]').locator('..')).toHaveAttribute(
      'href',
      'https://sonatibehjati.ir/QR',
    );
    await expect(sheet.getByAltText(/بارکد رهگیری/)).toBeVisible();
    await expect(sheet).not.toContainText('برای پیگیری مرسوله');
    await page.screenshot({ path: `/tmp/behjati-label-${key}.png`, animations: 'disabled' });
    await page.emulateMedia({ media: 'print' });
    const path = `/tmp/behjati-label-${key}.pdf`;
    await page.pdf({ path, preferCSSPageSize: true, printBackground: true });
    const info = execFileSync('pdfinfo', [path], { encoding: 'utf8' });
    assert.equal(Number(info.match(/Pages:\s+(\d+)/)[1]), 1, 'Label fits one physical sheet');
    const dimensions = info.match(/Page size:\s+([\d.]+) x ([\d.]+)/);
    assert.ok(Math.abs((Number(dimensions[1]) * 25.4) / 72 - width) < 1);
    assert.ok(Math.abs((Number(dimensions[2]) * 25.4) / 72 - height) < 1);
    const text = execFileSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8' }).replace(
      /[\u202a-\u202e\u2066-\u2069]/g,
      '',
    );
    for (const token of ['RECIPIENT', 'SENDER', 'CONTENT', 'NOTE', 'nexoraict.ir'])
      assert.ok(text.includes(token), `Printed ${token}`);
    assert.ok(!text.includes('Save as PDF'));
    await page.emulateMedia({ media: 'screen' });
  }
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
  await expect(open).toBeFocused();
  await expect(page.getByLabel('نشانی گیرنده', { exact: true })).toHaveValue(/RECIPIENT-ADDRESS/);
  await expect(page.getByText('تغییرات ذخیره نشده', { exact: true })).toBeVisible();
  assert.deepEqual(
    await db.order.findUniqueOrThrow({ where: { id: orderId } }),
    snapshot,
    'Preview never saves or changes order',
  );
  // Excessive content must not be silently clipped or printed as an incomplete label.
  await page
    .getByLabel('نشانی گیرنده', { exact: true })
    .fill('نشانی بسیار طولانی برای بررسی حفظ اطلاعات و هشدار چاپ '.repeat(11).slice(0, 590));
  await page
    .getByLabel('محتویات بسته (اختیاری)', { exact: true })
    .fill('محتویات آزمایشی طولانی '.repeat(13).slice(0, 290));
  await open.click();
  await workspace.getByRole('button', { name: 'لیبل ۱۵ × ۱۰', exact: true }).click();
  await expect(workspace.getByRole('alert')).toContainText('اطلاعات از یک برگه بیشتر شده');
  await expect(
    workspace.getByRole('button', { name: 'چاپ / ذخیره PDF', exact: true }),
  ).toBeDisabled();
  await workspace.getByRole('button', { name: 'بستن پیش‌نمایش چاپ', exact: true }).click();
  await page.getByRole('dialog').locator('.ant-modal-close').click();
  await page.getByRole('button', { name: 'بستن بدون ذخیره', exact: true }).click();
  await expect(page.locator('#behjati-admin-print')).toHaveCount(0);
  console.log(
    'Label workspace passed: real sender/recipient/content/tracking snapshots, one-page 150×100 and A5 PDFs, portable offline HTML, mobile fit, dirty/focus preservation, oversized-content warning and no order mutations.',
  );
}
