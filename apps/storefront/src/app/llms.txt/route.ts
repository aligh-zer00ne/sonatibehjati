import { absoluteUrl, SITE_DESCRIPTION } from '@/lib/seo';

// An optional discovery index, not a substitute for crawlable HTML or a ranking signal.
export function GET() {
  const links = [
    ['فروشگاه سنتی بهجتی', '/'],
    ['دربارهٔ مجموعه و راه‌های تماس', '/about'],
    ['فهرست محصولات؛ مرجع مشخصات و قیمت فعلی هر محصول', '/shop'],
    ['پرسش‌های متداول خرید و پرداخت', '/faq'],
    ['نقشهٔ سایت و نشانی محصولات', '/sitemap.xml'],
  ];
  return new Response(
    `# سنتی بهجتی اردکان\n\n> ${SITE_DESCRIPTION}\n\n## صفحات رسمی\n\n${links.map(([title, path]) => `- [${title}](${absoluteUrl(path!)})`).join('\n')}\n`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Robots-Tag': 'noindex',
      },
    },
  );
}
