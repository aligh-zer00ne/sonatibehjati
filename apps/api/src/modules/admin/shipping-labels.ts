import { shippingLabelSchema } from '@behjati/shared/admin';
import { db } from '../../database/client.js';
import { authError } from '../auth/errors.js';
import { validate } from './validation.js';

export function presentShippingLabel(label: { data: unknown; updatedAt: Date } | null) {
  return label
    ? { ...shippingLabelSchema.parse(label.data), updatedAt: label.updatedAt.toISOString() }
    : null;
}
export async function saveShippingLabel(
  orderId: string,
  raw: unknown,
  expectedUpdatedAt?: string | null,
) {
  if (!orderId || orderId.length > 100)
    throw authError('شناسه سفارش معتبر نیست.', 'BAD_USER_INPUT');
  const data = validate(shippingLabelSchema, raw);
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id = ${orderId} FOR UPDATE`;
    if (!(await tx.order.findUnique({ where: { id: orderId }, select: { id: true } })))
      throw authError('سفارش یافت نشد.', 'NOT_FOUND');
    const previous = await tx.orderShippingLabel.findUnique({ where: { orderId } });
    if ((previous?.updatedAt.toISOString() ?? null) !== (expectedUpdatedAt ?? null))
      throw authError(
        'لیبل توسط مدیر دیگری تغییر کرده است؛ دوباره اطلاعات را دریافت کنید.',
        'REQUEST_CONFLICT',
      );
    const updatedAt = new Date(Math.max(Date.now(), (previous?.updatedAt.getTime() ?? 0) + 1));
    const label = await tx.orderShippingLabel.upsert({
      where: { orderId },
      create: { orderId, data, updatedAt },
      update: { data, updatedAt },
    });
    return presentShippingLabel(label)!;
  });
}
