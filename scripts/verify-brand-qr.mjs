import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import jsQR from 'jsqr';

const svg = await readFile('apps/storefront/public/images/brand-qr.svg');
const source = svg.toString();
const embedded = Buffer.from(source.match(/base64,([^"\s]+)/)[1], 'base64');
assert.equal(
  createHash('sha256').update(embedded).digest('hex'),
  'f6b41654fb459d038c81c99fd128d9a6f680d0b30007ae47880339f2d6f495a2',
  'Keep the exact supplied PNG, never redraw its QR',
);
for (const size of [128, 200, 320, 720]) {
  for (const grayscale of [false, true]) {
    const raster = sharp(svg).resize({ width: size }).flatten({ background: '#fff' });
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
      'http://sonatibehjati.ir/QR',
      `Decode failed at ${size}px, grayscale=${grayscale}`,
    );
  }
}
console.info(
  'Supplied PNG QR verified at 128–720px, in color and grayscale: http://sonatibehjati.ir/QR',
);
