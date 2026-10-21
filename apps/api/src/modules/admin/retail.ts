import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import {
  adminCustomerInputSchema,
  manualQuoteInputSchema,
  manualOrderInputSchema,
  offlinePaymentInputSchema,
} from '@behjati/shared/admin';
import { db } from '../../database/client.js';
import { authError } from '../auth/errors.js';
import { priceCart } from '../checkout/service.js';
import { validate, omitNulls } from './validation.js';
import { adminOrder } from './orders.js';
import { adminUser } from './users.js';
const conflict = () => authError('اطلاعات تغییر کرده است؛ دوباره بررسی کنید.', 'REQUEST_CONFLICT');
export async function createAdminCustomer(adminId: string, raw: unknown) {
  const input = validate(adminCustomerInputSchema, raw);
  try {
    const user = await db.user.create({
      data: {
        phone: input.phone,
        firstName: input.firstName,
        lastName: input.lastName,
        acquisitionSource: input.salesChannel,
        createdByAdminId: adminId,
      },
    });
    return adminUser(user.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      throw authError(
        'این موبایل قبلاً ثبت شده است؛ مشتری موجود را انتخاب کنید.',
        'BAD_USER_INPUT',
      );
    throw error;
  }
}
export async function manualQuote(raw: Record<string, unknown>) {
  const input = validate(manualQuoteInputSchema, omitNulls(raw));
  return db.$transaction(async (tx) => (await priceCart(tx, input)).quote, {
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  });
}
export async function createManualOrder(
  admin: { id: string; email: string },
  raw: Record<string, unknown>,
) {
  const input = validate(manualOrderInputSchema, omitNulls(raw));
  const requestHash = createHash('sha256')
    .update(
      JSON.stringify({
        ...input,
        adminId: admin.id,
        items: [...input.items].sort((a, b) => a.productId.localeCompare(b.productId)),
      }),
    )
    .digest('hex');
  const id = await db.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM User WHERE id = ${input.customerId} FOR UPDATE`;
      const user = await tx.user.findUnique({ where: { id: input.customerId } });
      if (!user) throw authError('مشتری یافت نشد.', 'NOT_FOUND');
      const previous = await tx.order.findUnique({
        where: { userId_clientRequestId: { userId: user.id, clientRequestId: input.requestId } },
      });
      if (previous) {
        if (previous.requestHash !== requestHash) throw conflict();
        return previous.id;
      }
      const { quote, coupon, tariff } = await priceCart(tx, input);
      if (quote.total !== input.expectedTotal)
        throw authError('مبلغ سفارش تغییر کرده است؛ خلاصه را دوباره بررسی کنید.', 'PRICE_CHANGED');
      if (input.receivedAmount > quote.total)
        throw authError('مبلغ دریافتی بیشتر از مبلغ سفارش است.', 'BAD_USER_INPUT');
      if (coupon) {
        const used = await tx.discountCode.updateMany({
          where: {
            id: coupon.id,
            isActive: true,
            startsAt: { lte: new Date() },
            expiresAt: { gt: new Date() },
            ...(coupon.usageLimit === null ? {} : { usageCount: { lt: coupon.usageLimit } }),
          },
          data: { usageCount: { increment: 1 } },
        });
        if (!used.count) throw authError('کد تخفیف دیگر قابل استفاده نیست.', 'INVALID_DISCOUNT');
      }
      const status = input.receivedAmount === quote.total ? 'PROCESSING' : 'PENDING_PAYMENT';
      const a = input.address;
      const addressSnapshot = input.pickup
        ? {
            title: 'تحویل حضوری',
            recipientName: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.phone,
            recipientPhone: user.phone,
          }
        : {
            title: a!.title,
            recipientName: a!.recipientName,
            recipientPhone: a!.recipientPhone,
            province: a!.province,
            city: a!.city,
            postalAddress: a!.postalAddress,
            postalCode: a!.postalCode,
            latitude: a!.latitude ?? null,
            longitude: a!.longitude ?? null,
          };
      const order = await tx.order.create({
        data: {
          userId: user.id,
          clientRequestId: input.requestId,
          requestHash,
          status,
          addressSnapshot,
          salesChannel: input.salesChannel,
          shippingMethod: quote.shippingMethod,
          shippingWeightGrams: quote.shippingWeightGrams,
          shippingBaseCost: tariff.baseCost,
          shippingAdditionalKgCost: tariff.additionalKgCost,
          subtotal: quote.subtotal,
          discount: quote.discount,
          shipping: quote.shipping,
          total: quote.total,
          discountCodeId: coupon?.id,
          createdByAdminId: admin.id,
          createdByAdminEmail: admin.email,
          offlinePaidAmount: input.receivedAmount,
          items: {
            create: quote.items.map((l) => ({
              productId: l.productId,
              productTitle: l.title,
              productWeight: l.weight,
              shippingWeightGrams: l.shippingWeightGrams,
              unitPrice: l.unitPrice,
              quantity: l.quantity,
              lineTotal: l.lineTotal,
            })),
          },
          statusEvents: { create: { adminId: admin.id, fromStatus: 'CREATED', toStatus: status } },
          ...(input.receivedAmount
            ? {
                offlinePayments: {
                  create: {
                    id: input.requestId,
                    amount: input.receivedAmount,
                    method: input.paymentMethod!,
                    adminId: admin.id,
                    adminEmail: admin.email,
                  },
                },
              }
            : {}),
        },
      });
      return order.id;
    },
    { timeout: 10000, isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
  );
  return adminOrder(id);
}
export async function recordOfflinePayment(admin: { id: string; email: string }, raw: unknown) {
  const input = validate(offlinePaymentInputSchema, raw);
  await db.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id = ${input.orderId} FOR UPDATE`;
      const order = await tx.order.findUnique({ where: { id: input.orderId } });
      if (!order) throw authError('سفارش یافت نشد.', 'NOT_FOUND');
      const previous = await tx.offlinePayment.findUnique({ where: { id: input.requestId } });
      if (previous) {
        if (
          previous.orderId !== order.id ||
          previous.amount !== input.amount ||
          previous.method !== input.method ||
          previous.adminId !== admin.id
        )
          throw conflict();
        return;
      }
      if (order.salesChannel === 'WEBSITE' || order.status === 'CANCELED')
        throw authError('ثبت دریافت برای این سفارش مجاز نیست.', 'BAD_USER_INPUT');
      if (order.updatedAt.toISOString() !== input.expectedUpdatedAt) throw conflict();
      if (input.amount > order.total - order.offlinePaidAmount)
        throw authError('مبلغ بیشتر از ماندهٔ سفارش است.', 'BAD_USER_INPUT');
      await tx.offlinePayment.create({
        data: {
          id: input.requestId,
          orderId: order.id,
          amount: input.amount,
          method: input.method,
          adminId: admin.id,
          adminEmail: admin.email,
        },
      });
      const complete =
        input.amount + order.offlinePaidAmount === order.total &&
        ['CREATED', 'PENDING_PAYMENT'].includes(order.status);
      await tx.order.update({
        where: { id: order.id },
        data: {
          offlinePaidAmount: { increment: input.amount },
          updatedAt: new Date(Math.max(Date.now(), order.updatedAt.getTime() + 1)),
          ...(complete ? { status: 'PROCESSING' } : {}),
        },
      });
      if (complete)
        await tx.orderStatusEvent.create({
          data: {
            orderId: order.id,
            adminId: admin.id,
            fromStatus: order.status,
            toStatus: 'PROCESSING',
          },
        });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
  );
  return adminOrder(input.orderId);
}
