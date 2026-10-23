import { readFile, writeFile } from 'node:fs/promises';
import QRCode from 'qrcode';

// Preserve the exact QR artwork supplied by the store owner.
const current = await readFile('apps/storefront/public/images/brand-qr.svg', 'utf8').catch(
  () => '',
);
if (current.includes('data-qr-source="supplied-')) {
  console.info('Supplied artwork QR preserved; no generic regeneration.');
  process.exit(0);
}
const target = 'https://sonatibehjati.ir/QR';
const { modules } = QRCode.create(target, { errorCorrectionLevel: 'H' });
const margin = 6;
const size = modules.size + margin * 2;
const ink = '#801309';
const cream = '#fbf1da';
const logo = await readFile('apps/storefront/public/images/logo-footer.svg');
const logoUrl = `data:image/svg+xml;base64,${logo.toString('base64')}`;
let shapes = '';
const finders = [
  [0, 0],
  [0, modules.size - 7],
  [modules.size - 7, 0],
];
for (let row = 0; row < modules.size; row++) {
  for (let col = 0; col < modules.size; col++) {
    if (!modules.get(row, col)) continue;
    if (finders.some(([y, x]) => row >= y && row < y + 7 && col >= x && col < x + 7)) continue;
    // Keep timing/alignment/format modules square for reliable scanning.
    shapes += modules.isReserved(row, col)
      ? `<rect x="${col + margin}" y="${row + margin}" width="1" height="1"/>`
      : `<circle cx="${col + margin + 0.5}" cy="${row + margin + 0.5}" r="0.48"/>`;
  }
}
for (const [row, col] of finders) {
  const x = col + margin,
    y = row + margin;
  shapes += `<rect x="${x}" y="${y}" width="7" height="7" rx="0.3"/>`;
  shapes += `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="${cream}"/>`;
  shapes += `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.12"/>`;
}
const center = size / 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 ${size} ${size}">
<title>سنتی بهجتی؛ https://sonatibehjati.ir/QR</title>
<rect width="${size}" height="${size}" rx="2" fill="${cream}"/>
<rect x="0.5" y="0.5" width="${size - 1}" height="${size - 1}" rx="1.8" fill="none" stroke="#801309" stroke-width="0.35"/>
<rect x="1.2" y="1.2" width="${size - 2.4}" height="${size - 2.4}" rx="1.4" fill="none" stroke="#d9a21c" stroke-width="0.15"/>
<g fill="${ink}">${shapes}</g>
<rect x="${center - 3.5}" y="${center - 3.5}" width="7" height="7" rx="0.65" fill="${cream}" stroke="#d9a21c" stroke-width="0.12"/>
<image x="${center - 2.25}" y="${center - 3}" width="4.5" height="6" href="${logoUrl}"/>
</svg>`;
await writeFile('apps/storefront/public/images/brand-qr.svg', svg);
console.info(`Generated branded QR for ${target} (${modules.size} modules, H correction).`);
