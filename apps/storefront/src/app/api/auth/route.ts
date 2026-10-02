import { proxyAuth, proxyInputSchema } from '@/lib/auth/proxy';
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (
    origin !== new URL(request.url).origin ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    return Response.json(
      { errors: [{ message: 'درخواست مجاز نیست.', extensions: { code: 'FORBIDDEN' } }] },
      { status: 403 },
    );
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return Response.json({ errors: [{ message: 'درخواست معتبر نیست.' }] }, { status: 415 });
  try {
    const body = await request.text();
    if (Buffer.byteLength(body) > 4096)
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
