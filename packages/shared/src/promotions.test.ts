import { describe, expect, it } from 'vitest';
import { activeProductPromotion, productSellingPrice } from './promotions';
import { adminPromotionInputSchema, adminPromotionTargetsSchema } from './admin';
const startsAt = '2026-10-10T08:00:00.000Z';
const endsAt = '2026-10-10T09:00:00.000Z';
const discount = {
  price: 100001,
  discountPercent: 15,
  discountStartsAt: startsAt,
  discountEndsAt: endsAt,
};
describe('scheduled product promotions', () => {
  it('uses an inclusive start and exclusive end, with integer toman prices', () => {
    expect(activeProductPromotion(discount, Date.parse(startsAt) - 1)).toBeNull();
    const promotion = activeProductPromotion(discount, Date.parse(startsAt));
    expect(promotion).toMatchObject({
      originalPrice: 100001,
      amount: 15000,
      price: 85001,
      percent: 15,
    });
    expect(activeProductPromotion(discount, Date.parse(endsAt))).toBeNull();
    expect(productSellingPrice({ price: discount.price, promotion }, Date.parse(startsAt))).toBe(
      85001,
    );
    expect(productSellingPrice({ price: discount.price, promotion }, Date.parse(endsAt))).toBe(
      100001,
    );
  });
  it('ignores incomplete, invalid, and zero-value discounts', () => {
    for (const patch of [
      { discountPercent: 0 },
      { discountPercent: 100 },
      { discountPercent: 1.5 },
      { discountStartsAt: null },
      { discountEndsAt: 'invalid' },
      { discountEndsAt: startsAt },
      { price: 0 },
      { price: 1, discountPercent: 1 },
    ])
      expect(activeProductPromotion({ ...discount, ...patch }, Date.parse(startsAt))).toBeNull();
  });
  it('requires dates and validates duration and percentage on the admin boundary', () => {
    const input = { discountPercent: 15, discountStartsAt: startsAt, discountEndsAt: endsAt };
    expect(adminPromotionInputSchema.safeParse(input).success).toBe(true);
    expect(adminPromotionInputSchema.safeParse({ discountPercent: null }).success).toBe(true);
    for (const patch of [
      { discountPercent: 100 },
      { discountPercent: 1.1 },
      { discountStartsAt: null },
      { discountEndsAt: startsAt },
      { discountEndsAt: 'invalid' },
      { discountTitle: 'x'.repeat(81) },
    ])
      expect(adminPromotionInputSchema.safeParse({ ...input, ...patch }).success).toBe(false);
  });
  it('bounds festivals and rejects duplicate targets and missing product versions', () => {
    const target = { id: 'product', expectedUpdatedAt: startsAt };
    expect(adminPromotionTargetsSchema.safeParse([target]).success).toBe(true);
    for (const targets of [
      [],
      [target, target],
      [{ id: 'product' }],
      Array.from({ length: 51 }, (_, i) => ({ ...target, id: String(i) })),
    ])
      expect(adminPromotionTargetsSchema.safeParse(targets).success).toBe(false);
  });
});
