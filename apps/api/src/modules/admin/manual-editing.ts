import { createHash, randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { manualOrderEditSchema } from '@behjati/shared/admin';
import { shippingMethodLabels } from '@behjati/shared/sales';
import { db } from '../../database/client.js';
import { authError } from '../auth/errors.js';
import { validate } from './validation.js';
import { adminOrder } from './orders.js';
import { priceManualOrder } from './manual-pricing.js';
import { allocateCredits } from './customer-accounts.js';
import { presentShippingLabel } from './shipping-labels.js';

export async function manualEditQuote(orderId: string, raw: Record<string, unknown>) {
  if (!orderId || orderId.length > 100)
    throw authError('شناسه سفارش معتبر نیست.', 'BAD_USER_INPUT');
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order || order.salesChannel === 'WEBSITE' || order.status === 'CANCELED')
      throw authError('این فاکتور دستی قابل اصلاح نیست.', 'BAD_USER_INPUT');
    return priceManualOrder(tx, raw, order.items);
  });
}
export async function editManualOrder(admin: { id: string; email: string }, raw: unknown) {
  const input = validate(manualOrderEditSchema, raw);
  const hash = createHash('sha256')
    .update(JSON.stringify({ ...input, adminId: admin.id }))
    .digest('hex');
  const found = await db.order.findUnique({
    where: { id: input.orderId },
    select: { userId: true },
  });
  if (!found) throw authError('سفارش یافت نشد.', 'NOT_FOUND');
  await db.$transaction(
    async (tx) => {
      for (const userId of [...new Set([found.userId, input.customerId])].sort())
        await tx.$queryRaw`SELECT id FROM User WHERE id=${userId} FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id=${input.orderId} FOR UPDATE`;
      const order = await tx.order.findUniqueOrThrow({
        where: { id: input.orderId },
        include: {
          items: true,
          shippingLabel: true,
          offlinePayments: {
            where: { voided: false },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          },
        },
      });
      if (order.salesChannel === 'WEBSITE' || order.status === 'CANCELED' || order.paidAt)
        throw authError('فقط فاکتور دستی قابل اصلاح است.', 'BAD_USER_INPUT');
      const replay = await tx.adminRecordChange.findUnique({ where: { id: input.requestId } });
      if (replay) {
        if (
          replay.entityType !== 'MANUAL_ORDER' ||
          replay.entityId !== order.id ||
          replay.requestHash !== hash
        )
          throw authError('درخواست اصلاح با اطلاعات دیگری ثبت شده است.', 'REQUEST_CONFLICT');
        return;
      }
      if (
        order.userId !== found.userId ||
        order.updatedAt.toISOString() !== input.expectedUpdatedAt
      )
        throw authError('فاکتور تغییر کرده است؛ نسخهٔ جدید را دریافت کنید.', 'REQUEST_CONFLICT');
      if (order.salesChannel !== input.salesChannel)
        throw authError('محل خرید فاکتور را تغییر ندهید.', 'BAD_USER_INPUT');
      if (await tx.payment.count({ where: { orderId: order.id } }))
        throw authError('فاکتور دارای تراکنش بانکی قابل بازنویسی نیست.', 'BAD_USER_INPUT');
      if (
        order.userId !== input.customerId &&
        (order.offlinePaidAmount || order.offlinePayments.length)
      )
        throw authError(
          'فاکتور دارای دریافت را نمی‌توان به مشتری دیگری منتقل کرد؛ ابتدا دریافت و پرداخت را اصلاح کنید.',
          'BAD_USER_INPUT',
        );
      const customer = await tx.user.findUnique({ where: { id: input.customerId } });
      if (!customer) throw authError('مشتری یافت نشد.', 'NOT_FOUND');
      const label = presentShippingLabel(order.shippingLabel);
      if (label?.trackingNumber && input.pickup)
        throw authError('مرسولهٔ دارای رهگیری را به تحویل حضوری تغییر ندهید.', 'BAD_USER_INPUT');
      const quote = await priceManualOrder(
        tx,
        {
          items: input.items,
          pickup: input.pickup,
          shippingMethod: input.shippingMethod,
          manualShippingCost: input.manualShippingCost,
        },
        order.items,
      );
      if (quote.total !== input.expectedTotal)
        throw authError('جمع فاکتور تغییر کرده است؛ دوباره بررسی کنید.', 'PRICE_CHANGED');
      if (order.offlinePayments.reduce((sum, p) => sum + p.amount, 0) !== order.offlinePaidAmount)
        throw authError('دریافت‌های این فاکتور نیاز به بررسی حساب دارند.', 'REQUEST_CONFLICT');
      let excess = Math.max(0, order.offlinePaidAmount - quote.total);
      for (const allocation of order.offlinePayments) {
        if (!excess) break;
        if (!allocation.accountEntryId)
          throw authError(
            'اصلاح مبلغ کمتر از دریافت قدیمی، به بررسی دریافت و پرداخت نیاز دارد.',
            'BAD_USER_INPUT',
          );
        const entry = await tx.customerAccountEntry.findUnique({
          where: { id: allocation.accountEntryId },
        });
        if (!entry || entry.userId !== order.userId || entry.direction !== 'RECEIPT')
          throw authError('ارتباط دریافت با حساب مشتری نیاز به بررسی دارد.', 'REQUEST_CONFLICT');
        const release = Math.min(excess, allocation.amount);
        await tx.offlinePayment.update({ where: { id: allocation.id }, data: { voided: true } });
        if (release < allocation.amount)
          await tx.offlinePayment.create({
            data: {
              id: randomUUID(),
              orderId: order.id,
              accountEntryId: allocation.accountEntryId,
              amount: allocation.amount - release,
              method: allocation.method,
              adminId: allocation.adminId,
              adminEmail: allocation.adminEmail,
              createdAt: allocation.createdAt,
            },
          });
        await tx.customerAccountEntry.update({
          where: { id: allocation.accountEntryId },
          data: { remaining: { increment: release } },
        });
        excess -= release;
      }
      const addressSnapshot = input.pickup
        ? {
            title: 'تحویل حضوری',
            recipientName:
              [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.phone,
            recipientPhone: customer.phone,
          }
        : { ...input.address!, isDefault: undefined };
      const { isDefault: _unused, ...snapshot } = addressSnapshot as Record<string, unknown>;
      void _unused;
      await tx.orderItem.deleteMany({ where: { orderId: order.id } });
      await tx.order.update({
        where: { id: order.id },
        data: {
          userId: customer.id,
          addressId: null,
          addressSnapshot: JSON.parse(JSON.stringify(snapshot)),
          subtotal: quote.subtotal,
          discount: quote.discount,
          shipping: quote.shipping,
          total: quote.total,
          shippingMethod: quote.shippingMethod,
          shippingWeightGrams: quote.shippingWeightGrams,
          shippingBaseCost: quote.shipping,
          shippingAdditionalKgCost: 0,
          offlinePaidAmount: Math.min(order.offlinePaidAmount, quote.total),
          updatedAt: new Date(Math.max(Date.now(), order.updatedAt.getTime() + 1)),
          items: {
            create: quote.items.map((i) => ({
              productId: i.productId,
              productTitle: i.title,
              productWeight: i.weight,
              unitPrice: i.unitPrice,
              quantity: i.quantity,
              lineSubtotal: i.lineSubtotal,
              discountAmount: i.discountAmount,
              discountPercent: i.discountPercent,
              lineTotal: i.lineTotal,
              shippingWeightGrams: i.shippingWeightGrams,
            })),
          },
        },
      });
      if (label && quote.shippingMethod && order.shippingMethod !== quote.shippingMethod) {
        const { updatedAt, ...data } = label;
        await tx.orderShippingLabel.update({
          where: { orderId: order.id },
          data: {
            data: { ...data, carrier: shippingMethodLabels[quote.shippingMethod] },
            updatedAt: new Date(Math.max(Date.now(), Date.parse(updatedAt) + 1)),
          },
        });
      }
      for (const userId of [...new Set([order.userId, customer.id])].sort())
        await allocateCredits(tx, userId);
      const after = await tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { items: true, offlinePayments: { where: { voided: false } } },
      });
      await tx.adminRecordChange.create({
        data: {
          id: input.requestId,
          entityType: 'MANUAL_ORDER',
          entityId: order.id,
          adminId: admin.id,
          adminEmail: admin.email,
          requestHash: hash,
          before: JSON.parse(JSON.stringify(order)),
          after: JSON.parse(JSON.stringify(after)),
        },
      });
    },
    { timeout: 15000, isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
  );
  return adminOrder(input.orderId);
}
