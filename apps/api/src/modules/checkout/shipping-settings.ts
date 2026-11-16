import { Prisma } from '@prisma/client';
import {
  shippingSettingsSchema,
  initialShippingSettings,
  upgradeShippingSettings,
  type ShippingSettings,
} from '@behjati/shared/shipping';
import { shippingMethodLabel } from '@behjati/shared/sales';
import { db } from '../../database/client.js';
import { env } from '../../config/env.js';
import { authError } from '../auth/errors.js';
import { validate } from '../admin/validation.js';
export async function loadShippingSettings(tx: Prisma.TransactionClient) {
  let row = await tx.shippingSettings.findUnique({ where: { id: 'store' } });
  if (!row) {
    // One-time conversion: retain the highest previously configured tariff as the initial store rate.
    const previous = await tx.product.aggregate({
      _max: { shippingBaseCost: true, shippingAdditionalKgCost: true },
      where: { isActive: true },
    });
    const missing = await tx.product.count({ where: { isActive: true, shippingBaseCost: null } });
    const data = initialShippingSettings(
      Math.max(
        previous._max.shippingBaseCost ?? 0,
        missing > 0 || previous._max.shippingBaseCost === null ? env.SHIPPING_COST : 0,
      ),
      previous._max.shippingAdditionalKgCost ?? 0,
    );
    row = await tx.shippingSettings.upsert({
      where: { id: 'store' },
      create: { id: 'store', data },
      update: {},
    });
  }
  return {
    ...shippingSettingsSchema.parse(upgradeShippingSettings(row.data)),
    updatedAt: row.updatedAt.toISOString(),
  };
}
export const readShippingSettings = () => db.$transaction((tx) => loadShippingSettings(tx));
export async function saveShippingSettings(raw: unknown, expectedUpdatedAt: string) {
  const input = validate(shippingSettingsSchema, raw);
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM ShippingSettings WHERE id='store' FOR UPDATE`;
    const previous = await tx.shippingSettings.findUnique({ where: { id: 'store' } });
    if (!previous || previous.updatedAt.toISOString() !== expectedUpdatedAt)
      throw authError('تنظیمات ارسال تغییر کرده است؛ صفحه را تازه کنید.', 'REQUEST_CONFLICT');
    const before = shippingSettingsSchema.parse(upgradeShippingSettings(previous.data));
    const removed = before.methods
      .map((rule) => rule.method)
      .filter((code) => !input.methods.some((rule) => rule.method === code));
    if (removed.length && (await tx.order.count({ where: { shippingMethod: { in: removed } } })))
      throw authError(
        'روش ارسالی که در سفارش‌ها استفاده شده قابل حذف نیست؛ آن را غیرفعال کنید.',
        'BAD_USER_INPUT',
      );
    const row = await tx.shippingSettings.update({
      where: { id: 'store' },
      data: {
        data: input,
        updatedAt: new Date(Math.max(Date.now(), previous.updatedAt.getTime() + 1)),
      },
    });
    cachedMethods = null;
    return { ...input, updatedAt: row.updatedAt.toISOString() };
  });
}
let cachedMethods: { at: number; value: Promise<ShippingSettings['methods']> } | null = null;
/** Current method list for display labels; briefly cached so order lists do not re-read it. */
export function shippingMethodList() {
  if (!cachedMethods || Date.now() - cachedMethods.at > 10_000) {
    const value = readShippingSettings().then((settings) => settings.methods);
    value.catch(() => {
      if (cachedMethods?.value === value) cachedMethods = null;
    });
    cachedMethods = { at: Date.now(), value };
  }
  return cachedMethods.value;
}
/** Resolver helper: label of an order's method, falling back to built-in names and raw codes. */
export async function orderShippingMethodLabel(order: { shippingMethod?: string | null }) {
  if (!order.shippingMethod) return null;
  try {
    return shippingMethodLabel(order.shippingMethod, await shippingMethodList());
  } catch {
    return shippingMethodLabel(order.shippingMethod);
  }
}
/** Admin-entered methods must exist in the store list (disabled ones stay usable for staff). */
export async function requireConfiguredShippingMethod(
  tx: Prisma.TransactionClient,
  code: string | null | undefined,
) {
  if (!code) return null;
  const { methods } = await loadShippingSettings(tx);
  const rule = methods.find((item) => item.method === code);
  if (!rule) throw authError('روش ارسال انتخاب‌شده تعریف نشده است.', 'BAD_USER_INPUT');
  return rule;
}
