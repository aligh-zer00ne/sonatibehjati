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
import { priceManualOrder } from './manual-pricing.js';
import { allocateCredits, postAccountEntry } from './customer-accounts.js';
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
        ...(input.address ? { addresses: { create: input.address } } : {}),
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
  return db.$transaction(async (tx) => await priceManualOrder(tx, input), {
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
      const quote = await priceManualOrder(tx, {
        items: input.items,
        discountCode: input.discountCode,
        pickup: input.pickup,
        shippingMethod: input.shippingMethod,
        manualShippingCost: input.manualShippingCost,
      });
      if (quote.total !== input.expectedTotal)
        throw authError('مبلغ سفارش تغییر کرده است؛ خلاصه را دوباره بررسی کنید.', 'PRICE_CHANGED');
      const status =
        input.salesChannel === 'IN_PERSON' ? ('DELIVERED' as const) : ('CREATED' as const);
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
          shippingBaseCost: quote.shipping,
          shippingAdditionalKgCost: 0,
          subtotal: quote.subtotal,
          discount: quote.discount,
          shipping: quote.shipping,
          total: quote.total,

          createdByAdminId: admin.id,
          createdByAdminEmail: admin.email,
          offlinePaidAmount: 0,
          items: {
            create: quote.items.map((l) => ({
              productId: l.productId,
              productTitle: l.title,
              productWeight: l.weight,
              shippingWeightGrams: l.shippingWeightGrams,
              unitPrice: l.unitPrice,
              quantity: l.quantity,
              lineTotal: l.lineTotal,
              lineSubtotal: l.lineSubtotal,
              discountAmount: l.discountAmount,
              discountPercent: l.discountPercent,
            })),
          },
        },
      });
      await allocateCredits(tx, user.id);
      if (input.receivedAmount) {
        if (input.paymentMethod === 'CHECK')
          throw authError('چک را با شماره و سررسید در دریافت و پرداخت ثبت کنید.', 'BAD_USER_INPUT');
        await postAccountEntry(tx, admin, {
          customerId: user.id,
          direction: 'RECEIPT',
          amount: input.receivedAmount,
          method: input.paymentMethod,
          requestId: input.requestId,
          note: `دریافت هنگام صدور فاکتور ${order.number}`,
        });
      }
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
      const found = await tx.order.findUnique({ where: { id: input.orderId } });
      if (!found) throw authError('سفارش یافت نشد.', 'NOT_FOUND');
      await tx.$queryRaw`SELECT id FROM User WHERE id=${found.userId} FOR UPDATE`;
      const order = await tx.order.findUniqueOrThrow({ where: { id: found.id } });
      const previous = await tx.customerAccountEntry.findUnique({ where: { id: input.requestId } });
      if (!previous && order.updatedAt.toISOString() !== input.expectedUpdatedAt) throw conflict();
      if (order.salesChannel === 'WEBSITE' || order.status === 'CANCELED')
        throw authError('ثبت دریافت برای این سفارش مجاز نیست.', 'BAD_USER_INPUT');
      if (!previous && input.amount > order.total - order.offlinePaidAmount)
        throw authError('مبلغ بیشتر از ماندهٔ فاکتور است.', 'BAD_USER_INPUT');
      await postAccountEntry(
        tx,
        admin,
        {
          customerId: order.userId,
          direction: 'RECEIPT',
          amount: input.amount,
          method: input.method,
          requestId: input.requestId,
        },
        order.id,
      );
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
  );
  return adminOrder(input.orderId);
}
