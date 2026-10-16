import { proxyAuth, proxyInputSchema } from '@/lib/auth/proxy';
import { hasAllowedAuthOrigin } from '@/lib/auth/origin';
export async function POST(request: Request) {
  if (
    !hasAllowedAuthOrigin(
      request,
      process.env.STOREFRONT_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL,
    )
  )
    return Response.json(
      { errors: [{ message: 'درخواست مجاز نیست.', extensions: { code: 'FORBIDDEN' } }] },
      { status: 403 },
    );
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return Response.json({ errors: [{ message: 'درخواست معتبر نیست.' }] }, { status: 415 });
  try {
    const body = await request.text();
    if (Buffer.byteLength(body) > 32000)
      return Response.json(
        { errors: [{ message: 'درخواست بیش از حد بزرگ است.' }] },
        { status: 413 },
      );
    const parsed = proxyInputSchema.safeParse(JSON.parse(body));
    if (!parsed.success)
      return Response.json(
        { errors: [{ message: 'درخواست معتبر نیست.', extensions: { code: 'BAD_USER_INPUT' } }] },
        { status: 400 },
      );
    return proxyAuth(request, parsed.data);
  } catch {
    return Response.json({ errors: [{ message: 'درخواست معتبر نیست.' }] }, { status: 400 });
  }
}
