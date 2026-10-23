import { paymentApi } from '@/lib/payment/server';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; key: string }> },
) {
  const headers = {
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow',
  };
  try {
    const { id, key } = await params;
    return Response.json(await paymentApi('request-status', id, key), { headers });
  } catch {
    return Response.json(
      { message: 'وضعیت پرداخت دریافت نشد؛ دوباره تلاش کنید.' },
      { status: 503, headers },
    );
  }
}
