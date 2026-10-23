import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import jsQR from 'jsqr';
import { expect } from '@playwright/test';

export async function verifySharedPrintImage(page, workspace, kind) {
  const button = workspace.getByRole('button', {
    name: `اشتراک فایل ${kind === 'invoice' ? 'فاکتور' : 'لیبل'}`,
    exact: true,
  });
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false }),
  );
  const download = page.waitForEvent('download');
  await button.click();
  const file = await download;
  assert.match(file.suggestedFilename(), /\.png$/);
  const path = `/tmp/behjati-shared-${kind}.png`;
  await file.saveAs(path);
  const bytes = await readFile(path);
  assert.deepEqual(
    [...bytes.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
    'A real PNG, never HTML/JSON',
  );
  const metadata = await sharp(bytes).metadata();
  const sheet = workspace.locator(
    kind === 'invoice' ? '[data-invoice-sheet]' : '[data-label-sheet]',
  );
  const position = await sheet.evaluate((el) => {
    const rect = el.getBoundingClientRect(),
      qr = el.querySelector('[data-brand-qr]').getBoundingClientRect();
    const scale = rect.width / parseFloat(getComputedStyle(el).width);
    return {
      width: Math.ceil(el.offsetWidth),
      height: Math.ceil(el.scrollHeight),
      x: (qr.x - rect.x) / scale,
      y: (qr.y - rect.y) / scale,
      w: qr.width / scale,
      h: qr.height / scale,
    };
  });
  assert.ok(
    metadata.width >= position.width && metadata.height >= position.height,
    'Full unzoomed paper retained',
  );
  const scale = metadata.width / position.width;
  const left = Math.max(0, Math.floor(position.x * scale) - 10),
    top = Math.max(0, Math.floor(position.y * scale) - 10);
  const crop = {
    left,
    top,
    width: Math.min(metadata.width - left, Math.ceil(position.w * scale) + 20),
    height: Math.min(metadata.height - top, Math.ceil(position.h * scale) + 20),
  };
  const { data, info } = await sharp(bytes)
    .extract(crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.equal(
    jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data,
    'http://sonatibehjati.ir/QR',
    'Supplied QR survives image sharing',
  );
  await expect(button).toBeEnabled();
  await page.evaluate(() => {
    delete window.__sharedPrint;
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async ({ files }) => {
        const file = files[0];
        window.__sharedPrint = {
          type: file.type,
          name: file.name,
          size: file.size,
          signature: [...new Uint8Array(await file.slice(0, 8).arrayBuffer())],
        };
      },
    });
  });
  await button.click();
  await expect.poll(() => page.evaluate(() => window.__sharedPrint?.type)).toBe('image/png');
  const shared = await page.evaluate(() => window.__sharedPrint);
  assert.match(shared.name, /\.png$/);
  assert.ok(shared.size > 5000);
  assert.deepEqual(shared.signature, [137, 80, 78, 71, 13, 10, 26, 10]);
  await expect(button).toBeEnabled();
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false }),
  );
}
