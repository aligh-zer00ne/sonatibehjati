import { z } from 'zod';
import { entityId } from '@behjati/shared/operations';
import { getPublicReviews } from '@/lib/catalog/reviews';
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const input = z
    .object({ productId: entityId, page: z.coerce.number().int().min(1).max(100000) })
    .safeParse({ productId: params.get('productId'), page: params.get('page') ?? 1 });
  if (!input.success) return Response.json({ error: 'درخواست معتبر نیست.' }, { status: 400 });
  try {
    return Response.json(
      { data: { productReviews: await getPublicReviews(input.data.productId, input.data.page) } },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json({ error: 'نظرات دریافت نشد.' }, { status: 503 });
  }
}
