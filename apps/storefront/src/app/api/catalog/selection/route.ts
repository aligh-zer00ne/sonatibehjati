import { selectionSchema } from '@behjati/shared';
import { getSelectedProducts } from '@/lib/catalog/service';
export async function POST(request: Request) {
  let input: unknown;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text) > 32768)
      return Response.json({ error: 'فهرست محصولات بیش از حد بزرگ است.' }, { status: 413 });
    input = JSON.parse(text);
  } catch {
    return Response.json({ error: 'درخواست معتبر نیست.' }, { status: 400 });
  }
  const parsed = selectionSchema.safeParse(input);
  if (!parsed.success)
    return Response.json({ error: 'فهرست محصولات معتبر نیست.' }, { status: 400 });
  try {
    return Response.json(
      { products: await getSelectedProducts(parsed.data.ids) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json({ error: 'دریافت اطلاعات محصولات انجام نشد.' }, { status: 503 });
  }
}
