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
export async function invoiceFile(
  sheet: HTMLElement,
  name: string,
  pageSize: string,
  margin: string,
) {
  await document.fonts.ready;
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
  const html = `<!doctype html><!-- Lucide icons: ${iconLicense.replaceAll('--', '—')} --><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name}</title><style>${faces.join('\n')}html,body{margin:0;background:white}body{width:max-content;margin:auto}*{box-sizing:border-box}a{color:inherit}@page{size:${pageSize};margin:${margin}}@media print{body{width:auto;margin:0}.invoice-print{width:auto!important;min-height:0!important;padding:0!important}thead{display:table-header-group}tr{break-inside:avoid}}</style></head><body>${clone.outerHTML}</body></html>`;
  return new File([html], `${name}.html`, { type: 'text/html;charset=utf-8' });
}
export function downloadInvoice(file: File) {
  const url = URL.createObjectURL(file),
    link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
