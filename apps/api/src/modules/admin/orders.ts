import { presentAdminIdentity } from './identity.js';
import { env } from '../../config/env.js';
import type { Prisma } from '@prisma/client';
import {
  adminOrdersFilterSchema,
  orderStatusChangeSchema,
  orderStatusTransitions,
} from '@behjati/shared/admin';
import { orderAddressSnapshotSchema } from '@behjati/shared';
import { db } from '../../database/client.js';
import { authError } from '../auth/errors.js';
import { validate, omitNulls, serializeDates } from './validation.js';
import { dayStart, dayAfter } from './time.js';
import { presentShippingLabel } from './shipping-labels.js';
export const customerSelect = {
  id: true,
  phone: true,
  firstName: true,
  lastName: true,
  email: true,
};
export function orderAddress(raw: unknown) {
  const result = orderAddressSnapshotSchema.safeParse(raw);
  if (!result.success)
    throw authError('نشانی تاریخی سفارش قابل دریافت نیست.', 'SERVICE_UNAVAILABLE');
  return result.data;
}
export async function adminOrders(raw: Record<string, unknown>) {
  const input = validate(adminOrdersFilterSchema, omitNulls(raw));
  const { page, pageSize } = input;
  const searchedNumber = /^\d+$/.test(input.search) ? Number(input.search) : 0;
  const where: Prisma.OrderWhereInput = {
    ...(input.salesChannel ? { salesChannel: input.salesChannel } : {}),
    ...(input.manualOnly ? { AND: [{ salesChannel: { in: ['INSTAGRAM', 'IN_PERSON'] } }] } : {}),
    ...(input.shippingMethod ? { shippingMethod: input.shippingMethod } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.userId ? { userId: input.userId } : {}),
    ...(input.number ? { number: input.number } : {}),
    ...(input.from || input.to
      ? {
          createdAt: {
            ...(input.from ? { gte: dayStart(input.from) } : {}),
            ...(input.to ? { lt: dayAfter(input.to) } : {}),
          },
        }
      : {}),
    ...(input.city ? { addressSnapshot: { path: '$.city', string_contains: input.city } } : {}),
    ...(input.search
      ? {
          OR: [
            ...(searchedNumber > 0 && searchedNumber <= 2147483647
              ? [{ number: searchedNumber }]
              : []),
            { user: { phone: { contains: input.search } } },
            { user: { firstName: { contains: input.search } } },
            { user: { lastName: { contains: input.search } } },
            { addressSnapshot: { path: '$.recipientName', string_contains: input.search } },
          ],
        }
      : {}),
  };
  const orderBy: Prisma.OrderOrderByWithRelationInput[] =
    input.sort === 'OLDEST'
      ? [{ createdAt: 'asc' }, { number: 'asc' }]
      : input.sort === 'TOTAL_DESC'
        ? [{ total: 'desc' }, { number: 'desc' }]
        : input.sort === 'TOTAL_ASC'
          ? [{ total: 'asc' }, { number: 'asc' }]
          : [{ createdAt: 'desc' }, { number: 'desc' }];
  const [items, total] = await db.$transaction([
    db.order.findMany({
      where,
      include: { user: { select: customerSelect } },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count({ where }),
  ]);
  return {
    items: items.map((order) => ({
      ...serializeDates(order),
      address: orderAddress(order.addressSnapshot),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
export async function adminOrder(id: string) {
  if (!id || id.length > 100) throw authError('شناسه سفارش معتبر نیست.', 'BAD_USER_INPUT');
  const order = await db.order.findUnique({
    where: { id },
    include: {
      shippingLabel: true,
      offlinePayments: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] },
      user: { select: customerSelect },
      items: { orderBy: { id: 'asc' } },
      statusEvents: {
        include: {
          admin: {
            select: { id: true, email: true, role: true, isActive: true, permissions: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      },
    },
  });
  if (!order) throw authError('سفارش یافت نشد.', 'NOT_FOUND');
  return {
    ...serializeDates(order),
    address: orderAddress(order.addressSnapshot),
    shippingLabel: presentShippingLabel(order.shippingLabel),
    offlinePayments: order.offlinePayments.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
    statusEvents: order.statusEvents.map((event) => ({
      ...event,
      admin: presentAdminIdentity(event.admin),
      createdAt: event.createdAt.toISOString(),
    })),
  };
}
export async function changeOrderStatus(adminId: string, raw: unknown) {
  const input = validate(orderStatusChangeSchema, raw);
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id = ${input.id} FOR UPDATE`;
    const order = await tx.order.findUnique({ where: { id: input.id } });
    if (!order) throw authError('سفارش یافت نشد.', 'NOT_FOUND');
    if (order.status !== input.expectedStatus)
      throw authError(
        'وضعیت سفارش تغییر کرده است؛ اطلاعات را دوباره دریافت کنید.',
        'REQUEST_CONFLICT',
      );
    if (!orderStatusTransitions[order.status].includes(input.status))
      throw authError('این تغییر وضعیت مجاز نیست.', 'BAD_USER_INPUT');
    if (
      order.salesChannel === 'WEBSITE' &&
      env.PAYMENT_PROVIDER === 'sep' &&
      ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(input.status) &&
      !order.paidAt
    )
      throw authError('پرداخت این سفارش هنوز توسط بانک تأیید نشده است.', 'BAD_USER_INPUT');
    if (
      order.salesChannel !== 'WEBSITE' &&
      ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(input.status) &&
      order.offlinePaidAmount < order.total
    )
      throw authError('ابتدا ماندهٔ پرداخت سفارش را ثبت کنید.', 'BAD_USER_INPUT');
    await tx.order.update({ where: { id: input.id }, data: { status: input.status } });
    await tx.orderStatusEvent.create({
      data: { orderId: input.id, adminId, fromStatus: order.status, toStatus: input.status },
    });
  });
  return adminOrder(input.id);
}
