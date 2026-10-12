import { describe, it, expect } from 'vitest';
import { couponInput, ticketInput, reviewInput, staffInput } from './operations';
const valid = {
  code: 'black-friday',
  type: 'PERCENT',
  value: 20,
  minOrderAmount: 0,
  startsAt: '2026-10-12T00:00:00Z',
  expiresAt: '2026-10-13T00:00:00Z',
  isActive: true,
};
describe('Order coupon validation', () => {
  it('normalizes codes used by checkout', () =>
    expect(couponInput.parse(valid).code).toBe('BLACK-FRIDAY'));
  it.each([
    { value: 101 },
    { value: 0 },
    { expiresAt: valid.startsAt },
    { minOrderAmount: -1 },
    { usageLimit: 0 },
    { maxDiscountAmount: 0 },
    { code: 'تخفیف' },
    { expiresAt: '2026-10-13' },
  ])('rejects invalid coupon limits or dates %j', (change) =>
    expect(couponInput.safeParse({ ...valid, ...change }).success).toBe(false),
  );
  it('supports a fixed amount independently of a percentage', () =>
    expect(couponInput.parse({ ...valid, type: 'FIXED', value: 50000 }).value).toBe(50000));
});
describe('Customer interactions', () => {
  it('rejects blank tickets', () =>
    expect(ticketInput.safeParse({ subject: '   ', body: '   ' }).success).toBe(false));
  it('limits review text and scores', () => {
    expect(reviewInput.safeParse({ productId: 'p', rating: 6, body: 'خوب بود' }).success).toBe(
      false,
    );
    expect(
      reviewInput.safeParse({ productId: 'p', rating: 5, body: 'x'.repeat(2001) }).success,
    ).toBe(false);
  });
  it('requires a usable staff identity and password', () => {
    expect(staffInput.safeParse({ email: 'staff@example.com', password: '123456' }).success).toBe(
      false,
    );
    expect(
      staffInput.parse({ email: 'STAFF@example.com', password: 'safe-password-123' }).email,
    ).toBe('staff@example.com');
  });
});
