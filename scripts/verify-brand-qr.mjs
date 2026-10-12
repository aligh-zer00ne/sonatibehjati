import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import jsQR from 'jsqr';

const svg = await readFile('apps/storefront/public/images/brand-qr.svg');
for (const size of [128, 200, 320, 720]) {
  for (const grayscale of [false, true]) {
    const raster = sharp(svg).resize(size, size).flatten({ background: '#fff' });
    const { data, info } = await raster.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (grayscale) {
      for (let pixel = 0; pixel < data.length; pixel += 4) {
        const gray = Math.round(
          data[pixel] * 0.299 + data[pixel + 1] * 0.587 + data[pixel + 2] * 0.114,
        );
        data[pixel] = data[pixel + 1] = data[pixel + 2] = gray;
      }
    }
    const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height);
    assert.equal(
      decoded?.data,
      'https://sonatibehjati.ir/QR',
      `Decode failed at ${size}px, grayscale=${grayscale}`,
    );
  }
}
console.info(
  'Branded QR verified at 128–720px, in color and grayscale: https://sonatibehjati.ir/QR',
);
