import { paymentApi } from '@/lib/payment/server';
import { hasAllowedAuthOrigin } from '@/lib/auth/origin';
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; key: string }> },
) {
  const headers = {
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow',
  };
  if (
    !hasAllowedAuthOrigin(
      request,
      process.env.STOREFRONT_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL,
    )
  )
    return Response.json({ message: 'درخواست مجاز نیست.' }, { status: 403, headers });
  try {
    const { id, key } = await params;
    const result = await paymentApi<{ redirectUrl: string }>('request-start', id, key);
    if (!/^\/payment\/sep\/redirect\/[a-f0-9-]{36}\/[a-f0-9]{64}$/.test(result.redirectUrl))
      throw new Error('Invalid payment destination');
    return Response.json(result, { headers });
  } catch {
    return Response.json(
      {
        message:
          'اتصال به درگاه انجام نشد یا پرداخت قبلی در حال بررسی است؛ ابتدا نتیجه را به‌روز کنید.',
      },
      { status: 503, headers },
    );
  }
}
