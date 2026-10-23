import iconLicense from 'lucide-react/LICENSE?raw';
// A self-contained copy of the current invoice only; no app scripts, sessions or admin UI.
const properties = [
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'overflow',
  'background-image',
  'background-size',
  'transform',
  'transform-origin',
  'opacity',
  'box-shadow',
  'display',
  'box-sizing',
  'width',
  'min-width',
  'max-width',
  'height',
  'max-height',
  'min-height',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'text-align',
  'direction',
  'color',
  'background-color',
  'border-collapse',
  'table-layout',
  'vertical-align',
  'white-space',
  'overflow-wrap',
  'word-break',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-radius',
  'grid-template-columns',
  'grid-column',
  'gap',
  'flex-direction',
  'align-items',
  'justify-content',
  'flex-shrink',
  'object-fit',
  'object-position',
  'text-decoration',
  'filter',
  'break-inside',
];
async function embed(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('فایل‌های برگه دریافت نشدند.');
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('ساخت فایل انجام نشد.'));
    reader.readAsDataURL(blob);
  });
}
async function embeddedSheet(sheet: HTMLElement) {
  await document.fonts.ready;
  await Promise.all([...sheet.querySelectorAll('img')].map((image) => image.decode()));
  const clone = sheet.cloneNode(true) as HTMLElement;
  const source = [sheet, ...sheet.querySelectorAll<HTMLElement>('*')];
  const targets = [clone, ...clone.querySelectorAll<HTMLElement>('*')];
  source.forEach((node, index) => {
    const style = getComputedStyle(node),
      target = targets[index];
    if (!target?.style) return;
    for (const property of properties)
      target.style.setProperty(property, style.getPropertyValue(property));
  });
  const images = Array.from(clone.querySelectorAll<HTMLImageElement>('img'));
  await Promise.all(
    images.map(async (image) => {
      image.src = await embed(image.src);
      image.removeAttribute('srcset');
      image.removeAttribute('loading');
    }),
  );
  const faces: string[] = [];
  for (const stylesheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = stylesheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (rule.type !== CSSRule.FONT_FACE_RULE || !rule.cssText.includes('Vazirmatn')) continue;
      let css = rule.cssText;
      for (const match of Array.from(css.matchAll(/url\(["']?([^\s"')]+)["']?\)/g))) {
        if (!match[1]) continue;
        const url = new URL(match[1], stylesheet.href ?? document.baseURI).href;
        css = css.replace(match[0], `url("${await embed(url)}")`);
      }
      faces.push(css);
    }
  }
  clone.className = 'invoice-print';
  return { clone, faces };
}
export async function invoiceFile(
  sheet: HTMLElement,
  name: string,
  pageSize: string,
  margin: string,
) {
  const { clone, faces } = await embeddedSheet(sheet);
  const html = `<!doctype html><!-- Lucide icons: ${iconLicense.replaceAll('--', '—')} --><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name}</title><style>${faces.join('\n')}html,body{margin:0;background:white}body{width:max-content;margin:auto}*{box-sizing:border-box}a{color:inherit}@page{size:${pageSize};margin:${margin}}@media print{body{width:auto;margin:0}.invoice-print{width:auto!important;min-height:0!important;padding:0!important}thead{display:table-header-group}tr{break-inside:avoid}}</style></head><body>${clone.outerHTML}</body></html>`;
  return new File([html], `${name}.html`, { type: 'text/html;charset=utf-8' });
}

/** Rasterize only the selected paper, at its physical layout size, without the UI or zoom. */
export async function invoiceImage(sheet: HTMLElement, name: string) {
  const { clone, faces } = await embeddedSheet(sheet);
  const width = Math.ceil(sheet.offsetWidth),
    height = Math.ceil(sheet.scrollHeight);
  // Never silently crop a long receipt or export an empty canvas.
  if (!width || !height || width > 16000 || height > 16000)
    throw new Error('این برگه برای یک تصویر بیش از حد بلند است؛ از گزینهٔ PDF استفاده کنید.');
  const scale = Math.min(2, 16000 / width, 16000 / height, Math.sqrt(32000000 / (width * height)));
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.margin = '0';
  clone.style.transform = 'none';
  const documentNode = document.createElement('div');
  documentNode.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  documentNode.style.cssText = `width:${width}px;height:${height}px;background:white;`;
  const style = document.createElement('style');
  style.textContent = faces.join('\n');
  documentNode.append(style, clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(documentNode)}</foreignObject></svg>`;
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('تصویر برگه آماده نشد.'));
    reader.readAsDataURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  });
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('مرورگر امکان ساخت تصویر ندارد؛ از گزینهٔ PDF استفاده کنید.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error('ذخیرهٔ تصویر انجام نشد.'))),
      'image/png',
    ),
  );
  return new File([blob], `${name}.png`, { type: 'image/png' });
}
export function downloadInvoice(file: File) {
  const url = URL.createObjectURL(file),
    link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
