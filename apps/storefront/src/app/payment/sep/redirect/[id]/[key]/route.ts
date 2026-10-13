import { randomBytes } from 'node:crypto';
import { paymentApi } from '@/lib/payment/server';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; key: string }> },
) {
  try {
    const { id, key } = await params;
    const data = await paymentApi<{ token: string | null; resultUrl: string }>('redirect', id, key);
    if (data.resultUrl !== `/payment/sep/result/${id}/${key}`) throw new Error('Invalid result');
    if (!data.token)
      return new Response(null, {
        status: 303,
        headers: { Location: data.resultUrl, 'Cache-Control': 'no-store' },
      });
    if (!/^[\w+/=-]{1,512}$/.test(data.token)) throw new Error('Invalid token');
    const nonce = randomBytes(24).toString('base64');
    const html = `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>انتقال به درگاه سامان</title><body><h1>در حال انتقال به درگاه سامان…</h1><form id="gateway" action="https://sep.shaparak.ir/OnlinePG/OnlinePG" method="post"><input type="hidden" name="Token" value="${data.token}"><button type="submit">ادامه به درگاه پرداخت</button></form><script nonce="${nonce}">document.getElementById('gateway').submit();</script></body></html>`;
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Referrer-Policy': 'origin',
        'X-Robots-Tag': 'noindex, nofollow',
        'Content-Security-Policy': `default-src 'none'; form-action https://sep.shaparak.ir; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`,
      },
    });
  } catch {
    return new Response('اتصال به درگاه انجام نشد. به جزئیات سفارش برگردید و دوباره تلاش کنید.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
}
