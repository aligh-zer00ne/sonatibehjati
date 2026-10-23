import { Prisma } from '@prisma/client';
import { shippingSettingsSchema, initialShippingSettings } from '@behjati/shared/shipping';
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
  return { ...shippingSettingsSchema.parse(row.data), updatedAt: row.updatedAt.toISOString() };
}
export const readShippingSettings = () => db.$transaction((tx) => loadShippingSettings(tx));
export async function saveShippingSettings(raw: unknown, expectedUpdatedAt: string) {
  const input = validate(shippingSettingsSchema, raw);
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM ShippingSettings WHERE id='store' FOR UPDATE`;
    const previous = await tx.shippingSettings.findUnique({ where: { id: 'store' } });
    if (!previous || previous.updatedAt.toISOString() !== expectedUpdatedAt)
      throw authError('تنظیمات ارسال تغییر کرده است؛ صفحه را تازه کنید.', 'REQUEST_CONFLICT');
    const row = await tx.shippingSettings.update({
      where: { id: 'store' },
      data: {
        data: input,
        updatedAt: new Date(Math.max(Date.now(), previous.updatedAt.getTime() + 1)),
      },
    });
    return { ...input, updatedAt: row.updatedAt.toISOString() };
  });
}
