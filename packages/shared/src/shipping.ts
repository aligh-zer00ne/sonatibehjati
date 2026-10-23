import { z } from 'zod';
import {
  shippingMethods,
  calculatePackageShipping,
  type ShippingLine,
  type ShippingMethod,
} from '@behjati/shared/sales';
const money = z.number().int().min(0).max(2147483647);
export const shippingRuleSchema = z
  .object({
    method: z.enum(shippingMethods),
    enabled: z.boolean(),
    baseCost: money,
    additionalKgCost: money,
    freeShippingEligible: z.boolean(),
  })
  .strict();
export const shippingSettingsSchema = z
  .object({
    freeShippingThreshold: money.positive().nullable(),
    methods: z.array(shippingRuleSchema).length(3),
  })
  .strict()
  .refine((v) => new Set(v.methods.map((m) => m.method)).size === 3, {
    message: 'هر روش ارسال باید دقیقاً یک‌بار تعریف شود.',
  })
  .refine((v) => v.methods.some((m) => m.enabled), {
    message: 'حداقل یک روش ارسال را فعال نگه دارید.',
  });
export type ShippingSettings = z.infer<typeof shippingSettingsSchema>;
export function initialShippingSettings(baseCost: number, additionalKgCost = 0): ShippingSettings {
  return {
    freeShippingThreshold: null,
    methods: shippingMethods.map((method) => ({
      method,
      enabled: true,
      baseCost,
      additionalKgCost,
      freeShippingEligible: true,
    })),
  };
}
export function calculateStoreShipping(
  lines: ShippingLine[],
  settings: ShippingSettings,
  method: ShippingMethod,
  netSubtotal: number,
) {
  if (!Number.isSafeInteger(netSubtotal) || netSubtotal < 0 || netSubtotal > 2147483647)
    throw new RangeError('Invalid subtotal');
  const config = shippingSettingsSchema.parse(settings);
  const rule = config.methods.find((m) => m.method === method);
  if (!rule?.enabled) throw new Error('SHIPPING_METHOD_DISABLED');
  const threshold = rule.freeShippingEligible ? config.freeShippingThreshold : null;
  const freeShippingApplied = threshold !== null && netSubtotal >= threshold;
  const tariff = calculatePackageShipping(
    lines.map((line) => ({
      quantity: line.quantity,
      weight: line.weight,
      shippingWeightGrams: line.shippingWeightGrams,
      shippingBaseCost: freeShippingApplied ? 0 : rule.baseCost,
      shippingAdditionalKgCost: freeShippingApplied ? 0 : rule.additionalKgCost,
    })),
    0,
  );
  return {
    ...tariff,
    baseCost: rule.baseCost,
    additionalKgCost: rule.additionalKgCost,
    freeShippingApplied,
    freeShippingThreshold: threshold,
    freeShippingRemaining: threshold === null ? null : Math.max(0, threshold - netSubtotal),
  };
}
