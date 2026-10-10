export type PromotionSource = {
  price: number;
  discountPercent?: number | null;
  discountTitle?: string | null;
  discountStartsAt?: Date | string | null;
  discountEndsAt?: Date | string | null;
};
export function activeProductPromotion(product: PromotionSource, now = Date.now()) {
  const percent = product.discountPercent;
  const start = product.discountStartsAt ? new Date(product.discountStartsAt).getTime() : NaN;
  const end = product.discountEndsAt ? new Date(product.discountEndsAt).getTime() : NaN;
  if (
    !Number.isInteger(percent) ||
    !percent ||
    percent < 1 ||
    percent > 99 ||
    product.price <= 0 ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start > now ||
    end <= now ||
    start >= end
  )
    return null;
  const amount = Math.floor((product.price * percent) / 100);
  if (!amount) return null;
  return {
    title: product.discountTitle || 'پیشنهاد ویژه',
    percent,
    amount,
    originalPrice: product.price,
    price: product.price - amount,
    startsAt: new Date(start).toISOString(),
    endsAt: new Date(end).toISOString(),
  };
}
export function productSellingPrice(
  product: {
    price: number;
    promotion?: { price: number; startsAt: string; endsAt: string } | null;
  },
  now = Date.now(),
) {
  const promotion = product.promotion;
  return promotion && Date.parse(promotion.startsAt) <= now && Date.parse(promotion.endsAt) > now
    ? promotion.price
    : product.price;
}
