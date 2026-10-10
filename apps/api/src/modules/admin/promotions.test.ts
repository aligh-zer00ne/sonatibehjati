import { beforeEach, describe, expect, it, vi } from 'vitest';
const tx = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  product: { findUnique: vi.fn(), update: vi.fn() },
}));
const transaction = vi.hoisted(() => vi.fn());
vi.mock('../../database/client.js', () => ({ db: { $transaction: transaction } }));
import { setAdminPromotion } from './products.js';
const version = '2026-10-10T08:00:00.000Z';
const input = {
  discountPercent: 25,
  discountTitle: 'جشنواره',
  discountStartsAt: version,
  discountEndsAt: '2026-10-11T08:00:00.000Z',
};
beforeEach(() => {
  vi.resetAllMocks();
  transaction.mockImplementation((callback: (value: typeof tx) => unknown) => callback(tx));
  tx.product.findUnique.mockImplementation(async ({ where }: { where: { id: string } }) => ({
    id: where.id,
    updatedAt: new Date(version),
  }));
  tx.product.update.mockImplementation(async (args: unknown) => args);
});
describe('admin festival updates', () => {
  it('updates all targets in one transaction and locks in deterministic order', async () => {
    await setAdminPromotion(input, [
      { id: 'b', expectedUpdatedAt: version },
      { id: 'a', expectedUpdatedAt: version },
    ]);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(tx.product.update.mock.calls.map(([args]) => args.where.id)).toEqual(['a', 'b']);
    expect(tx.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ discountPercent: 25, discountStartsAt: new Date(version) }),
      }),
    );
    expect(tx.$queryRaw).toHaveBeenCalledTimes(2);
  });
  it('fails the transaction when any target has a stale version', async () => {
    tx.product.findUnique.mockResolvedValue({
      id: 'a',
      updatedAt: new Date('2026-10-10T08:00:01Z'),
    });
    await expect(
      setAdminPromotion(input, [{ id: 'a', expectedUpdatedAt: version }]),
    ).rejects.toMatchObject({ extensions: { code: 'REQUEST_CONFLICT' } });
    expect(tx.product.update).not.toHaveBeenCalled();
  });
  it('clears the entire promotion and rejects an ambiguous empty request', async () => {
    const targets = [{ id: 'a', expectedUpdatedAt: version }];
    await setAdminPromotion({ discountPercent: null }, targets);
    expect(tx.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          discountPercent: null,
          discountTitle: null,
          discountStartsAt: null,
          discountEndsAt: null,
        }),
      }),
    );
    await expect(setAdminPromotion({}, targets)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
  });
});
