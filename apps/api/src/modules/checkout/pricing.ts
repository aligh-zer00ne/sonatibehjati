import { authError } from '../auth/errors.js';
export function discountAmount(
  subtotal: number,
  coupon: {
    type: 'PERCENT' | 'FIXED';
    value: number;
    minOrderAmount: number;
    maxDiscountAmount: number | null;
    startsAt: Date;
    expiresAt: Date;
    isActive: boolean;
    usageLimit: number | null;
    usageCount: number;
  },
  now = new Date(),
) {
  if (
    !coupon.isActive ||
    coupon.startsAt > now ||
    coupon.expiresAt <= now ||
    subtotal < coupon.minOrderAmount ||
    (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) ||
    coupon.value <= 0 ||
    (coupon.type === 'PERCENT' && coupon.value > 100)
  )
    throw authError('کد تخفیف برای این سفارش قابل استفاده نیست.', 'INVALID_DISCOUNT');
  const amount =
    coupon.type === 'PERCENT' ? Math.floor((subtotal * coupon.value) / 100) : coupon.value;
  return Math.max(0, Math.min(subtotal, amount, coupon.maxDiscountAmount ?? amount));
}
