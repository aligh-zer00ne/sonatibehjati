export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[a-f0-9-]{36}\.webp$/.test(file)) return new Response(null, { status: 404 });
  const url = new URL(
    `/uploads/products/${file}`,
    process.env.API_URL ?? 'http://localhost:4000/graphql',
  );
  try {
    const image = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!image.ok || !image.headers.get('content-type')?.startsWith('image/webp'))
      return new Response(null, { status: 404 });
    return new Response(image.body, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
