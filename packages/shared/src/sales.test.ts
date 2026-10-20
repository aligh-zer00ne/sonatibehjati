import { describe, expect, it } from 'vitest';
import { calculatePackageShipping, parseShippingWeight } from './sales';
const line = (values = {}) => ({
  quantity: 1,
  weight: '۵۰۰ گرم',
  shippingBaseCost: 60000,
  shippingAdditionalKgCost: 10000,
  ...values,
});
describe('package shipping', () => {
  it('parses explicit gram/kilogram labels without inventing volume weights', () => {
    expect(parseShippingWeight('۵۰۰ گرم')).toBe(500);
    expect(parseShippingWeight('۱٫۵ کیلوگرم')).toBe(1500);
    expect(parseShippingWeight('0.35 kg')).toBe(350);
    expect(parseShippingWeight('۹۰۰ میلی‌لیتر')).toBeNull();
    expect(parseShippingWeight('بسته')).toBeNull();
  });
  it('includes the first kilogram and rounds every started extra kilogram once', () => {
    expect(calculatePackageShipping([line({ quantity: 2 })], 100).cost).toBe(60000);
    expect(calculatePackageShipping([line({ quantity: 3 })], 100).cost).toBe(70000);
    expect(calculatePackageShipping([line({ quantity: 4 })], 100).cost).toBe(70000);
    expect(calculatePackageShipping([line({ quantity: 5 })], 100).cost).toBe(80000);
  });
  it('charges one maximum base/rate for mixed products and accounts for all quantities', () => {
    const result = calculatePackageShipping(
      [
        line({ shippingBaseCost: 80000, shippingAdditionalKgCost: 10000 }),
        line({ quantity: 4, shippingBaseCost: 40000, shippingAdditionalKgCost: 20000 }),
      ],
      1,
    );
    expect(result).toEqual({
      cost: 120000,
      weightGrams: 2500,
      baseCost: 80000,
      additionalKgCost: 20000,
    });
  });
  it('preserves old flat-rate products and explicit zero-price delivery', () => {
    expect(calculatePackageShipping([{ quantity: 8, weight: 'بسته' }], 50000).cost).toBe(50000);
    expect(
      calculatePackageShipping([line({ shippingBaseCost: 0, shippingAdditionalKgCost: 0 })], 50000)
        .cost,
    ).toBe(0);
    expect(calculatePackageShipping([], 50000).cost).toBe(0);
  });
  it('requires real shipping weight when a per-kilogram tariff is active', () => {
    expect(() => calculatePackageShipping([line({ weight: '۹۰۰ میلی‌لیتر' })], 1)).toThrow(
      'SHIPPING_WEIGHT_REQUIRED',
    );
    expect(
      calculatePackageShipping([line({ weight: '۹۰۰ میلی‌لیتر', shippingWeightGrams: 1100 })], 1)
        .cost,
    ).toBe(70000);
  });
  it('rejects invalid quantities, tariffs and integer overflow', () => {
    for (const invalid of [
      line({ quantity: 0 }),
      line({ shippingBaseCost: -1 }),
      line({ shippingWeightGrams: 0 }),
      line({ shippingAdditionalKgCost: 1.5 }),
      line({ shippingWeightGrams: 1000000, quantity: 99, shippingAdditionalKgCost: 2147483647 }),
    ])
      expect(() => calculatePackageShipping([invalid], 1)).toThrow();
  });
});
