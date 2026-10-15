import { paymentMode } from '../payments/service.js';
import { Prisma } from '@prisma/client';
import { adminReportFilterSchema } from '@behjati/shared/admin';
import { orderStatuses } from '@behjati/shared';
import { db } from '../../database/client.js';
import { validate, omitNulls } from './validation.js';
import { calendarBounds, dayStart, dayAfter, dateDays } from './time.js';
import { adminOrders } from './orders.js';
import { adminUsers } from './users.js';
import { productRelations } from '../products/repository.js';
const retiredDemoProduct = {
  isActive: false,
  shortDescription: 'محصول نمونه برای توسعه',
  images: {
    some: {},
    every: {
      url: {
        in: [
          '/images/tahini.webp',
          '/images/halva.webp',
          '/images/oil.webp',
          '/images/chocolate.webp',
          '/images/date.webp',
          '/images/premium.webp',
        ],
      },
    },
  },
} satisfies Prisma.ProductWhereInput;
export async function adminReport(raw: Record<string, unknown>) {
  const input = validate(adminReportFilterSchema, omitNulls(raw));
  const where = {
    createdAt: { gte: dayStart(input.from), lt: dayAfter(input.to) },
    ...(input.status ? { status: input.status } : {}),
  };
  const statusClause = input.status ? Prisma.sql`AND status = ${input.status}` : Prisma.empty;
  const [daily, statuses, aggregate, count, income, incomeDaily] = await db.$transaction([
    db.$queryRaw<Array<{ date: string; ordersCount: bigint; orderValue: Prisma.Decimal }>>(
      Prisma.sql`SELECT DATE_FORMAT(CONVERT_TZ(createdAt, '+00:00', '+03:30'), '%Y-%m-%d') AS date, COUNT(*) AS ordersCount, SUM(CASE WHEN status <> 'CANCELED' THEN total ELSE 0 END) AS orderValue FROM \`Order\` WHERE createdAt >= ${where.createdAt.gte} AND createdAt < ${where.createdAt.lt} ${statusClause} GROUP BY date ORDER BY date`,
    ),
    db.$queryRaw<Array<{ status: (typeof orderStatuses)[number]; count: bigint }>>(
      Prisma.sql`SELECT status, COUNT(*) AS count FROM \`Order\` WHERE createdAt >= ${where.createdAt.gte} AND createdAt < ${where.createdAt.lt} ${statusClause} GROUP BY status`,
    ),
    db.order.aggregate({
      where: { ...where, AND: { status: { not: 'CANCELED' } } },
      _sum: { total: true },
      _avg: { total: true },
    }),
    db.order.count({ where }),
    db.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        orderId: { not: null },
        mode: paymentMode,
        acceptedAt: { gte: where.createdAt.gte, lt: where.createdAt.lt },
        ...(input.status ? { order: { status: input.status } } : {}),
      },
      _sum: { amountRials: true },
    }),
    db.$queryRaw<Array<{ date: string; revenue: Prisma.Decimal }>>(
      Prisma.sql`SELECT DATE_FORMAT(CONVERT_TZ(p.acceptedAt, '+00:00', '+03:30'), '%Y-%m-%d') AS date, SUM(p.amountRials) AS revenue FROM Payment p JOIN \`Order\` o ON o.id = p.orderId WHERE p.mode = ${paymentMode} AND p.status = 'SUCCEEDED' AND p.acceptedAt >= ${where.createdAt.gte} AND p.acceptedAt < ${where.createdAt.lt} ${input.status ? Prisma.sql`AND o.status = ${input.status}` : Prisma.empty} GROUP BY date ORDER BY date`,
    ),
  ]);
  return {
    from: input.from,
    to: input.to,
    ordersCount: count,
    orderValue: aggregate._sum.total ?? 0,
    averageOrderValue: aggregate._avg.total ?? 0,
    revenue: Number((income._sum.amountRials ?? 0n) / 10n),
    daily: dateDays(input.from, input.to).map((date) => {
      const value = daily.find((row) => row.date === date);
      return {
        date,
        ordersCount: Number(value?.ordersCount ?? 0),
        orderValue: Number(value?.orderValue ?? 0),
        revenue: Number(incomeDaily.find((row) => row.date === date)?.revenue ?? 0) / 10,
      };
    }),
    statuses: orderStatuses.map((status) => ({
      status,
      count: Number(statuses.find((row) => row.status === status)?.count ?? 0),
    })),
  };
}
export async function adminDashboard() {
  const { today, month, from } = calendarBounds();
  const [
    ordersCount,
    ordersToday,
    ordersThisMonth,
    values,
    paidIncome,
    recent,
    report,
    activeProductsCount,
    users,
    orderedProducts,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { createdAt: { gte: dayStart(today), lt: dayAfter(today) } } }),
    db.order.count({ where: { createdAt: { gte: dayStart(month), lt: dayAfter(today) } } }),
    db.order.aggregate({
      where: { status: { not: 'CANCELED' } },
      _sum: { total: true },
      _avg: { total: true },
    }),
    db.payment.aggregate({
      where: { status: 'SUCCEEDED', mode: paymentMode, orderId: { not: null } },
      _sum: { amountRials: true },
    }),
    adminOrders({ page: 1, pageSize: 5 }),
    adminReport({ from, to: today }),
    db.product.count({ where: { isActive: true } }),
    adminUsers({ page: 1, pageSize: 5 }),
    db.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { status: { not: 'CANCELED' } },
        product: { NOT: retiredDemoProduct },
      },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ]);
  const products = await db.product.findMany({
    where: { id: { in: orderedProducts.map((item) => item.productId) } },
    include: { images: { orderBy: productRelations.images.orderBy, take: 1 } },
  });
  return {
    activeProductsCount,
    customersCount: users.total,
    recentUsers: users.items,
    topProducts: orderedProducts.flatMap((item) => {
      const product = products.find((product) => product.id === item.productId);
      return product
        ? [
            {
              id: product.id,
              title: product.title,
              image: product.images[0]?.url ?? null,
              quantity: item._sum.quantity ?? 0,
              orderValue: item._sum.lineTotal ?? 0,
            },
          ]
        : [];
    }),
    ordersCount,
    ordersToday,
    ordersThisMonth,
    orderValue: values._sum.total ?? 0,
    averageOrderValue: values._avg.total ?? 0,
    revenue: Number((paidIncome._sum.amountRials ?? 0n) / 10n),
    recentOrders: recent.items,
    report,
  };
}
