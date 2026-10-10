import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const tx = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  address: { findFirst: vi.fn() },
  product: { findMany: vi.fn() },
  order: { findUnique: vi.fn(), create: vi.fn() },
}));
vi.mock('../../database/client.js', () => ({
  db: { $transaction: async (callback: (value: typeof tx) => unknown) => callback(tx) },
}));
vi.mock('../../config/env.js', () => ({ env: { SHIPPING_COST: 35000 } }));
import { quoteCheckout, createOrder } from './service.js';
const input = { addressId: 'address', items: [{ productId: 'product', quantity: 2 }] };
const orderInput = {
  ...input,
  requestId: 'b11b15b8-32f3-4000-8000-68e3664d9224',
  expectedTotal: 195000,
};
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-10T08:30:00Z'));
  vi.resetAllMocks();
  tx.address.findFirst.mockResolvedValue({ id: 'address', recipientName: 'گیرنده', title: 'خانه' });
  tx.product.findMany.mockResolvedValue([
    {
      id: 'product',
      title: 'ارده',
      weight: '۵۰۰ گرم',
      price: 100000,
      images: [],
      discountPercent: 20,
      discountStartsAt: new Date('2026-10-10T08:00:00Z'),
      discountEndsAt: new Date('2026-10-10T09:00:00Z'),
    },
  ]);
});
afterEach(() => vi.useRealTimers());
describe('server-authoritative promotion pricing', () => {
  it('quotes the discounted unit price, line total, subtotal and shipping total', async () => {
    const quote = await quoteCheckout('user', input);
    expect(quote).toMatchObject({
      items: [{ unitPrice: 80000, lineTotal: 160000 }],
      subtotal: 160000,
      total: 195000,
    });
  });
  it('snapshots the discounted amount in the order rather than the catalog base price', async () => {
    await createOrder('user', orderInput);
    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: 160000,
          total: 195000,
          items: { create: [expect.objectContaining({ unitPrice: 80000, lineTotal: 160000 })] },
        }),
      }),
    );
  });
  it('requires a new quote if the promotion expires between review and order submission', async () => {
    vi.setSystemTime(new Date('2026-10-10T09:00:00Z'));
    expect(await quoteCheckout('user', input)).toMatchObject({ subtotal: 200000, total: 235000 });
    await expect(createOrder('user', orderInput)).rejects.toMatchObject({
      extensions: { code: 'PRICE_CHANGED' },
    });
    expect(tx.order.create).not.toHaveBeenCalled();
  });
});
