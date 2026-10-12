import 'server-only';
import { executeGraphQL } from '@behjati/graphql';
import { PublicProductReviewsDocument, type PublicProductReviewsQuery } from '@/generated/graphql';
export async function getPublicReviews(
  productId: string,
  page = 1,
): Promise<PublicProductReviewsQuery['productReviews']> {
  if (process.env.CATALOG_SOURCE !== 'api') return { items: [], total: 0, page, pageSize: 10 };
  return (
    await executeGraphQL(
      process.env.API_URL ?? 'http://localhost:4000/graphql',
      PublicProductReviewsDocument,
      { productId, page },
    )
  ).productReviews;
}
