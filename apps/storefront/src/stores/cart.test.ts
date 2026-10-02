import { describe, expect, it } from 'vitest';
import { adjustCart, getSubtotal, sanitizePersistedCart } from './cart';
describe('guest cart', () => {
  it('caps quantities, removes zero items and preserves the original object', () => {
    const items = { oil: 98 };
    expect(adjustCart(items, 'oil', 5)).toEqual({ oil: 99 });
    expect(adjustCart(items, 'oil', -98)).toEqual({});
    expect(items).toEqual({ oil: 98 });
    expect(adjustCart(items, 'oil', NaN)).toBe(items);
    expect(adjustCart(items, '__proto__', 1)).toBe(items);
  });
  it('caps distinct product lines while allowing existing lines to change', () => {
    const items = Object.fromEntries(Array.from({ length: 200 }, (_, i) => [`p${i}`, 1]));
    expect(adjustCart(items, 'extra', 1)).toBe(items);
    expect(adjustCart(items, 'p0', 1).p0).toBe(2);
  });
  it('uses current catalog prices and excludes unavailable products from subtotal', () => {
    expect(getSubtotal({ oil: 2, missing: 4 }, [{ id: 'oil', price: 230000 }])).toBe(460000);
  });
  it('sanitizes tampered persistent storage and deduplicates favorites', () => {
    const state = sanitizePersistedCart({
      items: { ok: 2, negative: -2, fractional: 1.5, high: 100, empty: '4', '': 1 },
      favorites: ['ok', 'ok', '', 4, '__proto__'],
    });
    expect(state.items).toEqual({ ok: 2 });
    expect(state.favorites).toEqual(['ok']);
  });
});
