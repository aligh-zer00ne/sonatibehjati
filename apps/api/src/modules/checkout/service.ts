import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { addressInputSchema, checkoutInputSchema, createOrderInputSchema } from '@behjati/shared';
import { db } from '../../database/client.js';
import { env } from '../../config/env.js';
import { authError } from '../auth/errors.js';
import { FixedShippingService } from '../../services/shipping.js';
import { discountAmount } from './pricing.js';
const shipping = new FixedShippingService(env.SHIPPING_COST);
const invalid = () => authError('اطلاعات سفارش را بررسی کنید.', 'BAD_USER_INPUT');
export async function saveAddress(userId: string, raw: unknown, id?: string | null) {
  const parsed = addressInputSchema.safeParse(raw);
  if (!parsed.success || (id && id.length > 100)) throw invalid();
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM User WHERE id = ${userId} FOR UPDATE`;
    if (id && !(await tx.address.findFirst({ where: { id, userId } })))
      throw authError('نشانی یافت نشد.', 'NOT_FOUND');
    const count = await tx.address.count({ where: { userId } });
    if (!id && count >= 20)
      throw authError('حداکثر بیست نشانی می‌توانید ذخیره کنید.', 'BAD_USER_INPUT');
    const data = {
      ...parsed.data,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      isDefault: parsed.data.isDefault || (!id && count === 0),
    };
    if (data.isDefault)
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return id
      ? tx.address.update({ where: { id }, data })
      : tx.address.create({ data: { ...data, userId } });
  });
}
export async function deleteAddress(userId: string, id: string) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM User WHERE id = ${userId} FOR UPDATE`;
    const address = await tx.address.findFirst({ where: { id, userId } });
    if (!address) throw authError('نشانی یافت نشد.', 'NOT_FOUND');
    if (await tx.order.count({ where: { addressId: id } }))
      throw authError('این نشانی در سفارش ثبت‌شده استفاده شده و قابل حذف نیست.', 'ADDRESS_IN_USE');
    await tx.address.delete({ where: { id } });
    if (address.isDefault) {
      const next = await tx.address.findFirst({ where: { userId }, orderBy: { id: 'asc' } });
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
    return true;
  });
}
type CheckoutInput = ReturnType<typeof checkoutInputSchema.parse>;
async function calculate(tx: Prisma.TransactionClient, userId: string, input: CheckoutInput) {
  await tx.$queryRaw`SELECT id FROM Address WHERE id = ${input.addressId} FOR UPDATE`;
  const address = await tx.address.findFirst({ where: { id: input.addressId, userId } });
  if (!address) throw authError('نشانی خود را انتخاب کنید.', 'NOT_FOUND');
  const ids = input.items.map((line) => line.productId).sort();
  await tx.$queryRaw(
    Prisma.sql`SELECT id FROM Product WHERE id IN (${Prisma.join(ids)}) ORDER BY id FOR UPDATE`,
  );
  const products = await tx.product.findMany({
    where: { id: { in: ids }, isActive: true },
    include: { images: true },
  });
  if (products.length !== ids.length)
    throw authError(
      'برخی محصولات دیگر قابل سفارش نیستند؛ سبد را به‌روزرسانی کنید.',
      'PRODUCT_UNAVAILABLE',
    );
  const items = input.items.map((line) => {
    const product = products.find((product) => product.id === line.productId)!;
    return {
      productId: product.id,
      title: product.title,
      weight: product.weight,
      imageUrl: product.images[0]?.url ?? null,
      quantity: line.quantity,
      unitPrice: product.price,
      lineTotal: product.price * line.quantity,
    };
  });
  const subtotal = items.reduce((sum, line) => sum + line.lineTotal, 0);
  let discount = 0;
  let coupon;
  if (input.discountCode) {
    await tx.$queryRaw`SELECT id FROM DiscountCode WHERE code = ${input.discountCode} FOR UPDATE`;
    coupon = await tx.discountCode.findUnique({ where: { code: input.discountCode } });
    if (!coupon) throw authError('کد تخفیف معتبر نیست.', 'INVALID_DISCOUNT');
    discount = discountAmount(subtotal, coupon);
  }
  const shippingCost = await shipping.calculateShipping();
  const total = subtotal - discount + shippingCost;
  if (
    ![subtotal, total, ...items.map((line) => line.lineTotal)].every(
      (value) => Number.isSafeInteger(value) && value >= 0 && value <= 2147483647,
    )
  )
    throw authError('مبلغ سبد از سقف مجاز بیشتر است.', 'BAD_USER_INPUT');
  return {
    address,
    coupon,
    quote: { addressId: address.id, items, subtotal, discount, shipping: shippingCost, total },
  };
}
export async function quoteCheckout(userId: string, raw: unknown) {
  const parsed = checkoutInputSchema.safeParse(raw);
  if (!parsed.success) throw invalid();
  return db.$transaction(async (tx) => (await calculate(tx, userId, parsed.data)).quote);
}
export async function createOrder(userId: string, raw: unknown) {
  const parsed = createOrderInputSchema.safeParse(raw);
  if (!parsed.success) throw invalid();
  const input = parsed.data;
  const requestHash = createHash('sha256')
    .update(
      JSON.stringify({
        ...input,
        items: [...input.items].sort((a, b) => a.productId.localeCompare(b.productId)),
      }),
    )
    .digest('hex');
  return db.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM User WHERE id = ${userId} FOR UPDATE`;
      const previous = await tx.order.findUnique({
        where: { userId_clientRequestId: { userId, clientRequestId: input.requestId } },
      });
      if (previous) {
        if (previous.requestHash !== requestHash)
          throw authError(
            'درخواست ثبت سفارش تغییر کرده است؛ خلاصه را دوباره بررسی کنید.',
            'REQUEST_CONFLICT',
          );
        return previous;
      }
      const { address, coupon, quote } = await calculate(tx, userId, input);
      if (quote.total !== input.expectedTotal)
        throw authError('مبلغ سفارش تغییر کرده است؛ خلاصه را دوباره بررسی کنید.', 'PRICE_CHANGED');
      if (coupon)
        await tx.discountCode.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        });
      return tx.order.create({
        data: {
          userId,
          addressId: address.id,
          addressSnapshot: {
            title: address.title,
            recipientName: address.recipientName,
            recipientPhone: address.recipientPhone,
            province: address.province,
            city: address.city,
            postalAddress: address.postalAddress,
            postalCode: address.postalCode,
            latitude: address.latitude,
            longitude: address.longitude,
          },
          clientRequestId: input.requestId,
          requestHash,
          status: 'PENDING_PAYMENT',
          subtotal: quote.subtotal,
          discount: quote.discount,
          shipping: quote.shipping,
          total: quote.total,
          discountCodeId: coupon?.id,
          items: {
            create: quote.items.map((line) => ({
              productId: line.productId,
              productTitle: line.title,
              productWeight: line.weight,
              unitPrice: line.unitPrice,
              quantity: line.quantity,
              lineTotal: line.lineTotal,
            })),
          },
        },
      });
    },
    { timeout: 10000 },
  );
}
