import { describe, expect, it } from 'vitest';
import { discountAmount } from './pricing.js';
const now = new Date('2026-10-03T00:00:00Z');
const coupon = {
  type: 'PERCENT' as const,
  value: 15,
  minOrderAmount: 10000,
  maxDiscountAmount: null,
  startsAt: new Date(now.getTime() - 1000),
  expiresAt: new Date(now.getTime() + 1000),
  isActive: true,
  usageLimit: 2,
  usageCount: 0,
};
describe('server discount calculation', () => {
  it('rounds percentage discounts down to integer toman and caps them', () => {
    expect(discountAmount(123456, coupon, now)).toBe(18518);
    expect(discountAmount(123456, { ...coupon, maxDiscountAmount: 10000 }, now)).toBe(10000);
  });
  it('never discounts more than the subtotal', () =>
    expect(discountAmount(20000, { ...coupon, type: 'FIXED', value: 50000 }, now)).toBe(20000));
  it.each([
    { isActive: false },
    { startsAt: new Date(now.getTime() + 1) },
    { expiresAt: now },
    { minOrderAmount: 999999 },
    { usageCount: 2 },
    { value: 101 },
    { value: -1 },
  ])('rejects unavailable coupons %j', (change) =>
    expect(() => discountAmount(100000, { ...coupon, ...change }, now)).toThrow(),
  );
});
