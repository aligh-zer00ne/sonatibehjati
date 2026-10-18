import { activeProductPromotion, type PromotionSource } from '@behjati/shared/promotions';
import { productDescription } from '@behjati/shared/photo-catalog';
export const serializeProduct = <
  T extends PromotionSource & {
    createdAt: Date;
    updatedAt: Date;
    title: string;
    weight: string;
    description: string;
  },
>(
  product: T,
) => ({
  ...product,
  description: productDescription(product),
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
