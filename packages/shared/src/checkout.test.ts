import { describe, expect, it } from 'vitest';
import { addressInputSchema, checkoutInputSchema, createOrderInputSchema } from './index.js';
const address = {
  title: 'خانه',
  recipientName: 'گیرنده نمونه',
  recipientPhone: '۰۹۰۰۰۰۰۰۰۰۱',
  province: 'یزد',
  city: 'اردکان',
  postalAddress: 'خیابان نمونه، پلاک ۱۰',
  postalCode: '۱۲۳۴۵۶۷۸۹۰',
  isDefault: true,
};
const checkout = {
  addressId: 'owned-address',
  items: [{ productId: 'product', quantity: 2 }],
  discountCode: ' dev10 ',
};
describe('checkout contracts', () => {
  it('normalizes address and discount inputs', () => {
    expect(addressInputSchema.parse(address)).toMatchObject({
      recipientPhone: '09000000001',
      postalCode: '1234567890',
    });
    expect(checkoutInputSchema.parse(checkout).discountCode).toBe('DEV10');
  });
  it.each([
    { latitude: 91, longitude: 54 },
    { latitude: 32 },
    { postalCode: '123' },
    { recipientPhone: '123' },
  ])('rejects incomplete or invalid address %j', (change) =>
    expect(addressInputSchema.safeParse({ ...address, ...change }).success).toBe(false),
  );
  it('rejects duplicates, empty cart, excessive quantities and client-supplied amounts', () => {
    for (const items of [
      [],
      [checkout.items[0], checkout.items[0]],
      [{ productId: 'product', quantity: 100 }],
    ])
      expect(checkoutInputSchema.safeParse({ ...checkout, items }).success).toBe(false);
    expect(checkoutInputSchema.safeParse({ ...checkout, total: 1 }).success).toBe(false);
    expect(
      createOrderInputSchema.safeParse({ ...checkout, requestId: 'bad', expectedTotal: 1 }).success,
    ).toBe(false);
  });
});
