import type { Resolvers } from '../../generated/resolvers.js';
import {
  profileInputSchema,
  ordersFilterSchema,
  orderAddressSnapshotSchema,
} from '@behjati/shared';
import { db } from '../../database/client.js';
import { requireUser } from '../auth/guard.js';
import { requireAuthOrigin } from '../../graphql/context.js';
import { consumeAuthLimit } from '../auth/rate-limit.js';
import { authError } from '../auth/errors.js';
const serialize = <T extends { createdAt: Date }>(order: T) => ({
  ...order,
  createdAt: order.createdAt.toISOString(),
});
export const accountResolvers: Resolvers = {
  Query: {
    myOrders: async (_parent, { input }, context) => {
      const user = await requireUser(context);
      const parsed = ordersFilterSchema.safeParse(
        Object.fromEntries(
          Object.entries(input).filter(([key, value]) => key === 'status' || value !== null),
        ),
      );
      if (!parsed.success) throw authError('فیلتر سفارش‌ها معتبر نیست.', 'BAD_USER_INPUT');
      const { page, pageSize, status } = parsed.data;
      const where = { userId: user.id, ...(status ? { status } : {}) };
      const [items, total] = await db.$transaction([
        db.order.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }, { number: 'desc' }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        db.order.count({ where }),
      ]);
      return {
        items: items.map(serialize),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    },
    myOrder: async (_parent, { id }, context) => {
      const user = await requireUser(context);
      if (!id || id.length > 100) throw authError('شناسه سفارش معتبر نیست.', 'BAD_USER_INPUT');
      const order = await db.order.findFirst({
        where: { id, userId: user.id },
        include: { items: { orderBy: { id: 'asc' } } },
      });
      if (!order) throw authError('سفارش یافت نشد.', 'NOT_FOUND');
      const address = orderAddressSnapshotSchema.safeParse(order.addressSnapshot);
      if (!address.success)
        throw authError('اطلاعات نشانی سفارش در دسترس نیست.', 'SERVICE_UNAVAILABLE');
      return { ...serialize(order), address: address.data };
    },
  },
  Mutation: {
    updateProfile: async (_parent, { input }, context) => {
      requireAuthOrigin(context);
      const user = await requireUser(context);
      await consumeAuthLimit(`profile:${user.id}`, 30, 60);
      const parsed = profileInputSchema.safeParse(input);
      if (!parsed.success)
        throw authError('نام، نام خانوادگی و ایمیل را بررسی کنید.', 'BAD_USER_INPUT');
      return db.user.update({
        where: { id: user.id },
        data: { ...parsed.data, email: parsed.data.email || null },
      });
    },
  },
};
