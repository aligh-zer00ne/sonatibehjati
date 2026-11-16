import { describe, it, expect } from 'vitest';
import {
  calculateStoreShipping,
  initialShippingSettings,
  newShippingMethodCode,
  shippingSettingsSchema,
  upgradeShippingSettings,
  type ShippingSettings,
} from './shipping';
import { shippingMethodLabel } from './sales';
const tipax = (settings: ShippingSettings) => settings.methods.find((m) => m.method === 'TIPAX')!;
const line = (quantity = 1, grams = 500) => ({
  weight: 'بسته',
  shippingWeightGrams: grams,
  quantity,
  shippingBaseCost: 9999999,
  shippingAdditionalKgCost: 9999999,
});
describe('store shipping policy', () => {
  it('charges one base for the whole cart and rounds only additional kilograms', () => {
    const settings = initialShippingSettings(60000, 20000);
    expect(calculateStoreShipping([line(2)], settings, 'POST', 100).cost).toBe(60000);
    expect(calculateStoreShipping([line(1, 1001)], settings, 'POST', 100).cost).toBe(80000);
    expect(calculateStoreShipping([line(2), line(1, 1100)], settings, 'POST', 100).cost).toBe(
      100000,
    );
  });
  it('uses carrier rates and ignores all legacy per-product money', () => {
    const settings = initialShippingSettings(60000, 20000);
    tipax(settings).baseCost = 90000;
    expect(calculateStoreShipping([line()], settings, 'TIPAX', 100).cost).toBe(90000);
  });
  it('applies the threshold inclusively to discounted product value only', () => {
    const settings = initialShippingSettings(60000, 20000);
    settings.freeShippingThreshold = 1000000;
    expect(calculateStoreShipping([line(10)], settings, 'POST', 999999)).toMatchObject({
      cost: 140000,
      freeShippingRemaining: 1,
      freeShippingApplied: false,
    });
    expect(calculateStoreShipping([line(10)], settings, 'POST', 1000000)).toMatchObject({
      cost: 0,
      freeShippingRemaining: 0,
      freeShippingApplied: true,
    });
    tipax(settings).freeShippingEligible = false;
    expect(calculateStoreShipping([line()], settings, 'TIPAX', 2000000)).toMatchObject({
      cost: 60000,
      freeShippingThreshold: null,
    });
  });
  it('rejects disabled methods, invalid configuration, unknown weighted fees and overflow', () => {
    const settings = initialShippingSettings(1, 1);
    settings.methods[0]!.enabled = false;
    expect(() => calculateStoreShipping([line()], settings, 'POST', 100)).toThrow();
    expect(
      shippingSettingsSchema.safeParse({
        ...settings,
        methods: settings.methods.map((m) => ({ ...m, enabled: false })),
      }).success,
    ).toBe(false);
    expect(
      shippingSettingsSchema.safeParse({ ...settings, freeShippingThreshold: 0 }).success,
    ).toBe(false);
    expect(() =>
      calculateStoreShipping([{ weight: 'بطری', quantity: 1 }], settings, 'TIPAX', 1),
    ).toThrow('SHIPPING_WEIGHT_REQUIRED');
    tipax(settings).additionalKgCost = 2147483647;
    expect(() => calculateStoreShipping([line(99, 1000000)], settings, 'TIPAX', 100)).toThrow();
  });
  it('upgrades stored settings with labels and Chapar priced like Post', () => {
    const upgraded = shippingSettingsSchema.parse(
      upgradeShippingSettings({
        freeShippingThreshold: null,
        methods: ['POST', 'TIPAX', 'COURIER'].map((method, index) => ({
          method,
          enabled: index !== 2,
          baseCost: 1000 * (index + 1),
          additionalKgCost: 10,
          freeShippingEligible: true,
        })),
      }),
    );
    expect(upgraded.methods.map((m) => m.method)).toEqual(['POST', 'CHAPAR', 'TIPAX', 'COURIER']);
    expect(upgraded.methods[1]).toMatchObject({ label: 'چاپار', enabled: true, baseCost: 1000 });
    expect(upgraded.methods[3]).toMatchObject({ label: 'پیک', enabled: false });
  });
  it('accepts store-defined methods but keeps built-ins and unique names', () => {
    const settings = initialShippingSettings(5000);
    const code = newShippingMethodCode(settings.methods.map((m) => m.method));
    expect(code).toMatch(/^CUSTOM_[0-9A-Z]{6}$/);
    const custom = { ...settings.methods[0]!, method: code, label: 'باربری', baseCost: 7000 };
    const withCustom = { ...settings, methods: [...settings.methods, custom] };
    expect(calculateStoreShipping([line()], withCustom, code, 1).cost).toBe(7000);
    expect(shippingMethodLabel(code, withCustom.methods)).toBe('باربری');
    expect(shippingMethodLabel('CUSTOM_GONE')).toBe('CUSTOM_GONE');
    expect(
      shippingSettingsSchema.safeParse({ ...withCustom, methods: withCustom.methods.slice(1) })
        .success,
    ).toBe(false);
    expect(
      shippingSettingsSchema.safeParse({
        ...withCustom,
        methods: [...settings.methods, { ...custom, label: 'پست' }],
      }).success,
    ).toBe(false);
  });
});
