import { activeProductPromotion, type PromotionSource } from '@behjati/shared/promotions';
export const serializeProduct = <T extends PromotionSource & { createdAt: Date; updatedAt: Date }>(
  product: T,
) => ({
  ...product,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
  discountPercent: product.discountPercent ?? null,
  discountTitle: product.discountTitle ?? null,
  discountStartsAt: product.discountStartsAt
    ? new Date(product.discountStartsAt).toISOString()
    : null,
  discountEndsAt: product.discountEndsAt ? new Date(product.discountEndsAt).toISOString() : null,
  promotion: activeProductPromotion(product),
});
