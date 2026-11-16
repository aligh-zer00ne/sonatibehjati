import { z } from 'zod';
export const salesChannels = ['WEBSITE', 'INSTAGRAM', 'IN_PERSON'] as const;
export type SalesChannel = (typeof salesChannels)[number];
export const salesChannelLabels: Record<SalesChannel, string> = {
  WEBSITE: 'سایت',
  INSTAGRAM: 'اینستاگرام',
  IN_PERSON: 'حضوری',
};
/** Built-in carriers. Stores can add their own methods; those use generated `CUSTOM_*` codes. */
export const shippingMethods = ['POST', 'CHAPAR', 'TIPAX', 'COURIER'] as const;
export type BuiltInShippingMethod = (typeof shippingMethods)[number];
export type ShippingMethod = string;
export const shippingMethodPattern = /^[A-Z][A-Z0-9_]{1,39}$/;
export const shippingMethodCodeSchema = z
  .string()
  .regex(shippingMethodPattern, 'روش ارسال معتبر نیست.');
export const shippingMethodLabels: Record<BuiltInShippingMethod, string> = {
  POST: 'پست',
  CHAPAR: 'چاپار',
  TIPAX: 'تیپاکس',
  COURIER: 'پیک',
};
export const isBuiltInShippingMethod = (code: string): code is BuiltInShippingMethod =>
  (shippingMethods as readonly string[]).includes(code);
/** Readable carrier name; configured labels win, unknown codes stay visible instead of blank. */
export function shippingMethodLabel(
  code: string | null | undefined,
  methods?: ReadonlyArray<{ method: string; label?: string | null }> | null,
) {
  if (!code) return '';
  const configured = methods?.find((item) => item.method === code)?.label?.trim();
  if (configured) return configured;
  return isBuiltInShippingMethod(code) ? shippingMethodLabels[code] : code;
}
export const offlinePaymentMethods = ['CASH', 'POS', 'CARD_TRANSFER', 'CHECK'] as const;
export type OfflinePaymentMethod = (typeof offlinePaymentMethods)[number];
export const offlinePaymentMethodLabels: Record<OfflinePaymentMethod | 'ONLINE', string> = {
  ONLINE: 'درگاه سامان (تأییدشده)',
  CASH: 'نقدی',
  POS: 'کارت‌خوان',
  CARD_TRANSFER: 'کارت به کارت',
  CHECK: 'چک',
};

export function parseShippingWeight(value: string): number | null {
  const normalized = value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/٫/g, '.')
    .trim();
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(کیلوگرم|کیلو|kg|گرم|g)$/i);
  if (!match) return null;
  const grams = Math.ceil(Number(match[1]) * (/^(کیلوگرم|کیلو|kg)$/i.test(match[2]!) ? 1000 : 1));
  return Number.isSafeInteger(grams) && grams > 0 && grams <= 1000000 ? grams : null;
}
export type ShippingLine = {
  quantity: number;
  weight: string;
  shippingWeightGrams?: number | null;
  shippingBaseCost?: number | null;
  shippingAdditionalKgCost?: number | null;
};
export function calculatePackageShipping(lines: ShippingLine[], fallbackBase: number) {
  if (!Number.isSafeInteger(fallbackBase) || fallbackBase < 0)
    throw new RangeError('Invalid shipping fallback');
  let base = 0;
  let rate = 0;
  let totalWeight = 0;
  let unknownWeight = false;
  for (const line of lines) {
    const itemBase = line.shippingBaseCost ?? fallbackBase;
    const itemRate = line.shippingAdditionalKgCost ?? 0;
    const grams = line.shippingWeightGrams ?? parseShippingWeight(line.weight);
    if (
      ![line.quantity, itemBase, itemRate].every(Number.isSafeInteger) ||
      line.quantity < 1 ||
      itemBase < 0 ||
      itemRate < 0 ||
      (grams !== null && (!Number.isSafeInteger(grams) || grams < 1))
    )
      throw new RangeError('Invalid shipping tariff or weight');
    base = Math.max(base, itemBase);
    rate = Math.max(rate, itemRate);
    if (grams === null) unknownWeight = true;
    else totalWeight += grams * line.quantity;
  }
  if (unknownWeight && rate > 0) throw new Error('SHIPPING_WEIGHT_REQUIRED');
  const extraKilos = unknownWeight ? 0 : Math.max(0, Math.ceil(totalWeight / 1000) - 1);
  const cost = base + extraKilos * rate;
  if (
    !Number.isSafeInteger(totalWeight) ||
    totalWeight > 2147483647 ||
    !Number.isSafeInteger(cost) ||
    cost > 2147483647
  )
    throw new RangeError('Shipping exceeds supported limits');
  return {
    cost,
    weightGrams: unknownWeight ? null : totalWeight,
    baseCost: base,
    additionalKgCost: rate,
  };
}
