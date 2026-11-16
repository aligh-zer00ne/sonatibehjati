import { z } from 'zod';
import {
  shippingMethods,
  shippingMethodCodeSchema,
  shippingMethodLabel,
  shippingMethodLabels,
  calculatePackageShipping,
  type ShippingLine,
  type ShippingMethod,
} from '@behjati/shared/sales';
const money = z.number().int().min(0).max(2147483647);
export const maxShippingMethods = 12;
export const shippingRuleSchema = z
  .object({
    method: shippingMethodCodeSchema,
    label: z
      .string()
      .trim()
      .min(2, 'نام روش ارسال را وارد کنید.')
      .max(40, 'نام روش ارسال حداکثر ۴۰ نویسه است.'),
    enabled: z.boolean(),
    baseCost: money,
    additionalKgCost: money,
    freeShippingEligible: z.boolean(),
  })
  .strict();
export const shippingSettingsSchema = z
  .object({
    freeShippingThreshold: money.positive().nullable(),
    methods: z
      .array(shippingRuleSchema)
      .min(1)
      .max(maxShippingMethods, `حداکثر ${maxShippingMethods} روش ارسال قابل تعریف است.`),
  })
  .strict()
  .refine((v) => new Set(v.methods.map((m) => m.method)).size === v.methods.length, {
    message: 'هر روش ارسال باید دقیقاً یک‌بار تعریف شود.',
  })
  .refine((v) => new Set(v.methods.map((m) => m.label)).size === v.methods.length, {
    message: 'نام روش‌های ارسال نباید تکراری باشد.',
  })
  .refine((v) => shippingMethods.every((code) => v.methods.some((m) => m.method === code)), {
    message: 'روش‌های پیش‌فرض قابل حذف نیستند؛ در صورت نیاز غیرفعالشان کنید.',
  })
  .refine((v) => v.methods.some((m) => m.enabled), {
    message: 'حداقل یک روش ارسال را فعال نگه دارید.',
  });
export type ShippingSettings = z.infer<typeof shippingSettingsSchema>;
export type ShippingRule = ShippingSettings['methods'][number];
export function initialShippingSettings(baseCost: number, additionalKgCost = 0): ShippingSettings {
  return {
    freeShippingThreshold: null,
    methods: shippingMethods.map((method) => ({
      method,
      label: shippingMethodLabels[method],
      enabled: true,
      baseCost,
      additionalKgCost,
      freeShippingEligible: true,
    })),
  };
}
/**
 * Upgrades settings saved before labels and Chapar existed. Built-in methods missing from the
 * stored list are added right after Post using Post's tariff, so checkout prices stay predictable.
 */
export function upgradeShippingSettings(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { methods?: unknown }).methods))
    return raw;
  const value = raw as { methods: Array<Record<string, unknown>> };
  const methods = value.methods.map((rule) =>
    typeof rule.label === 'string' && rule.label.trim()
      ? rule
      : { ...rule, label: shippingMethodLabel(String(rule.method ?? '')) },
  );
  const post = methods.find((rule) => rule.method === 'POST');
  for (const code of shippingMethods) {
    if (methods.some((rule) => rule.method === code)) continue;
    const template = post ?? methods[0];
    const rule = {
      method: code,
      label: shippingMethodLabels[code],
      enabled: template?.enabled ?? true,
      baseCost: template?.baseCost ?? 0,
      additionalKgCost: template?.additionalKgCost ?? 0,
      freeShippingEligible: template?.freeShippingEligible ?? true,
    };
    const at = post ? methods.indexOf(post) + 1 : methods.length;
    methods.splice(at, 0, rule);
  }
  return { ...value, methods };
}
/** Code for a newly added store method; unique enough for a short, admin-maintained list. */
export function newShippingMethodCode(existing: readonly string[], random = Math.random) {
  for (;;) {
    const code = `CUSTOM_${Math.floor(random() * 36 ** 6)
      .toString(36)
      .toUpperCase()
      .padStart(6, '0')}`;
    if (!existing.includes(code)) return code;
  }
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
