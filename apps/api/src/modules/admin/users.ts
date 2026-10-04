import { authError } from '../auth/errors.js';
import { adminUsersFilterSchema } from '@behjati/shared/admin';
import { db } from '../../database/client.js';
import { validate, omitNulls } from './validation.js';
export async function adminUsers(raw: Record<string, unknown>) {
  const { page, pageSize, search } = validate(adminUsersFilterSchema, omitNulls(raw));
  const where = search
    ? {
        OR: [
          { phone: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
        ],
      }
    : {};
  return db.$transaction(async (tx) => {
    const [users, total] = await Promise.all([
      tx.user.findMany({
        where,
        select: {
          id: true,
          phone: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      tx.user.count({ where }),
    ]);
    const values = await tx.order.groupBy({
      by: ['userId'],
      where: { userId: { in: users.map((user) => user.id) }, status: { not: 'CANCELED' } },
      _sum: { total: true },
    });
    return {
      items: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        ordersCount: user._count.orders,
        totalOrdersValue: values.find((value) => value.userId === user.id)?._sum.total ?? 0,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });
}

export async function adminUser(id: string) {
  if (!id || id.length > 100) throw authError('شناسه کاربر معتبر نیست.', 'BAD_USER_INPUT');
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      phone: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
  if (!user) throw authError('کاربر یافت نشد.', 'NOT_FOUND');
  const values = await db.order.aggregate({
    where: { userId: id, status: { not: 'CANCELED' } },
    _sum: { total: true },
  });
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    ordersCount: user._count.orders,
    totalOrdersValue: values._sum.total ?? 0,
  };
}
