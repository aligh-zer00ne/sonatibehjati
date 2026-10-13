import { paymentApi } from '@/lib/payment/server';
type Context = { params: Promise<{ id: string; key: string }> };
async function receive(request: Request, context: Context) {
  const { id, key } = await context.params;
  try {
    if (Number(request.headers.get('content-length') ?? 0) > 8192)
      return new Response(null, { status: 413 });
    const isPost = request.method === 'POST';
    if (
      isPost &&
      !request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')
    )
      return new Response(null, { status: 415 });
    const body = isPost ? await request.text() : new URL(request.url).search.slice(1);
    if (new TextEncoder().encode(body).length > 8192) return new Response(null, { status: 413 });
    const fields: Record<string, string> = {};
    for (const [name, value] of new URLSearchParams(body)) {
      const lower = name.toLowerCase();
      if (lower in fields || name.length > 100 || value.length > 1000)
        return new Response(null, { status: 400 });
      fields[lower] = value;
    }
    const result = await paymentApi<{ resultUrl: string }>('callback', id, key, fields);
    const expected = `/payment/sep/result/${id}/${key}`;
    if (result.resultUrl !== expected) throw new Error('Invalid result path');
    return new Response(null, {
      status: 303,
      headers: {
        Location: expected,
        'Cache-Control': 'no-store',
        'Referrer-Policy': 'no-referrer',
      },
    });
  } catch {
    return new Response(
      'نتیجهٔ پرداخت هنوز تأیید نشده است. صفحهٔ نتیجهٔ پرداخت یا پشتیبانی سفارش را بررسی کنید.',
      {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
      },
    );
  }
}
export const POST = receive;
export const GET = receive;
