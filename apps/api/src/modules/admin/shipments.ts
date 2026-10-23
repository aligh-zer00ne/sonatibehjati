import { shippingLabelSchema } from '@behjati/shared/admin';
import { shipmentInputSchema } from '@behjati/shared/message-templates';
import { shippingMethodLabels } from '@behjati/shared/sales';
import { db } from '../../database/client.js';
import { env } from '../../config/env.js';
import { authError } from '../auth/errors.js';
import { adminOrder, orderAddress } from './orders.js';
import { readStoreInformation } from './store-information.js';
import { validate } from './validation.js';

export async function saveShipment(adminId: string, raw: unknown) {
  const input = validate(shipmentInputSchema, raw);
  const store = await readStoreInformation();
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id=${input.orderId} FOR UPDATE`;
    const order = await tx.order.findUnique({
      where: { id: input.orderId },
      include: { shippingLabel: true },
    });
    if (!order) throw authError('سفارش یافت نشد.', 'NOT_FOUND');
    if (order.salesChannel === 'IN_PERSON')
      throw authError('سفارش حضوری مرسوله ندارد.', 'BAD_USER_INPUT');
    const previous = order.shippingLabel
      ? shippingLabelSchema.parse(order.shippingLabel.data)
      : null;
    if (
      order.updatedAt.toISOString() !== input.expectedUpdatedAt ||
      (order.shippingLabel?.updatedAt.toISOString() ?? null) !==
        (input.expectedLabelUpdatedAt ?? null)
    ) {
      if (
        order.shippingMethod === input.shippingMethod &&
        (previous?.trackingNumber ?? '') === input.trackingNumber &&
        (!input.trackingNumber || ['SHIPPED', 'DELIVERED'].includes(order.status))
      )
        return;
      throw authError('سفارش تغییر کرده است؛ اطلاعات جدید را دریافت کنید.', 'REQUEST_CONFLICT');
    }
    if (['CANCELED', 'DELIVERED'].includes(order.status))
      throw authError('اطلاعات ارسال سفارش نهایی قابل تغییر نیست.', 'BAD_USER_INPUT');
    if (previous?.trackingNumber && !input.trackingNumber)
      throw authError('کد رهگیری ثبت‌شده را با کد صحیح جایگزین کنید.', 'BAD_USER_INPUT');
    if (
      input.trackingNumber &&
      order.salesChannel === 'WEBSITE' &&
      env.PAYMENT_PROVIDER === 'sep' &&
      !order.paidAt
    )
      throw authError('پرداخت این سفارش هنوز توسط بانک تأیید نشده است.', 'BAD_USER_INPUT');
    const address = orderAddress(order.addressSnapshot);
    const data = validate(shippingLabelSchema, {
      senderName: store.name,
      senderPhone: store.phone,
      senderAddress: store.address,
      senderPostalCode: store.postalCode,
      recipientName: address.recipientName,
      recipientPhone: address.recipientPhone,
      recipientAddress: [address.province, address.city, address.postalAddress]
        .filter(Boolean)
        .join('، '),
      recipientPostalCode: address.postalCode ?? '',
      packageWeight: '',
      packageContent: '',
      note: '',
      paperSize: 'THERMAL' as const,
      ...previous,
      carrier: shippingMethodLabels[input.shippingMethod],
      trackingNumber: input.trackingNumber,
    });
    const status = input.trackingNumber ? ('SHIPPED' as const) : order.status;
    const updatedAt = new Date(
      Math.max(
        Date.now(),
        order.updatedAt.getTime() + 1,
        (order.shippingLabel?.updatedAt.getTime() ?? 0) + 1,
      ),
    );
    await tx.orderShippingLabel.upsert({
      where: { orderId: order.id },
      create: { orderId: order.id, data, updatedAt },
      update: { data, updatedAt },
    });
    // Carrier is operational metadata: never recalculate historical charges or payment state.
    await tx.order.update({
      where: { id: order.id },
      data: { shippingMethod: input.shippingMethod, status, updatedAt },
    });
    if (status !== order.status)
      await tx.orderStatusEvent.create({
        data: { orderId: order.id, adminId, fromStatus: order.status, toStatus: status },
      });
  });
  return adminOrder(input.orderId);
}
