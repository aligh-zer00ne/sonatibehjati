import { paymentResult } from '@/lib/payment/server';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; key: string }> },
) {
  try {
    const { id, key } = await params;
    return Response.json(await paymentResult(id, key), {
      headers: {
        'Cache-Control': 'no-store',
        'Referrer-Policy': 'no-referrer',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch {
    return Response.json(
      { message: 'وضعیت پرداخت دریافت نشد. دوباره تلاش کنید.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
