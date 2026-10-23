import type { Prisma, OrderItem } from '@prisma/client';
import { manualQuoteInputSchema } from '@behjati/shared/admin';
import { authError } from '../auth/errors.js';
import { validate, omitNulls } from './validation.js';
export async function priceManualOrder(
  tx: Prisma.TransactionClient,
  raw: Record<string, unknown>,
  existing: OrderItem[] = [],
) {
  const input = validate(manualQuoteInputSchema, omitNulls(raw));
  const ids = input.items.map((i) => i.productId).sort();
  for (const id of ids) await tx.$queryRaw`SELECT id FROM Product WHERE id=${id} FOR UPDATE`;
  const products = await tx.product.findMany({
    where: {
      id: { in: ids },
      OR: [{ isActive: true }, { id: { in: existing.map((i) => i.productId) } }],
    },
  });
  if (products.length !== ids.length)
    throw authError('یکی از محصولات دیگر فعال نیست.', 'BAD_USER_INPUT');
  const items = input.items.map((line) => {
    const product = products.find((p) => p.id === line.productId)!;
    const historic = existing.find((i) => i.productId === line.productId);
    const unitPrice = line.unitPrice ?? product.price;
    const lineSubtotal = unitPrice * line.quantity;
    const discountAmount = line.discountPercent
      ? Math.floor((lineSubtotal * line.discountPercent) / 100)
      : (line.discountAmount ?? 0);
    if (
      !Number.isSafeInteger(lineSubtotal) ||
      lineSubtotal > 2147483647 ||
      discountAmount > lineSubtotal
    )
      throw authError('مبلغ یا تخفیف ردیف معتبر نیست.', 'BAD_USER_INPUT');
    return {
      productId: product.id,
      title: historic?.productTitle ?? product.title,
      weight: historic?.productWeight ?? product.weight,
      imageUrl: null,
      quantity: line.quantity,
      unitPrice,
      lineSubtotal,
      discountAmount,
      discountPercent: line.discountPercent ?? null,
      lineTotal: lineSubtotal - discountAmount,
      shippingWeightGrams: historic ? historic.shippingWeightGrams : product.shippingWeightGrams,
    };
  });
  const subtotal = items.reduce((s, i) => s + i.lineSubtotal, 0),
    discount = items.reduce((s, i) => s + i.discountAmount, 0);
  const shipping = input.pickup ? 0 : input.manualShippingCost;
  const total = subtotal - discount + shipping;
  if (
    ![subtotal, discount, total].every((n) => Number.isSafeInteger(n) && n >= 0 && n <= 2147483647)
  )
    throw authError('مبلغ فاکتور خارج از محدوده است.', 'BAD_USER_INPUT');
  const shippingWeightGrams = items.every((i) => i.shippingWeightGrams !== null)
    ? items.reduce((s, i) => s + i.shippingWeightGrams! * i.quantity, 0)
    : null;
  return {
    subtotal,
    discount,
    shipping,
    total,
    items,
    shippingMethod: input.pickup ? null : input.shippingMethod,
    shippingWeightGrams,
  };
}
