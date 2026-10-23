import { paymentMode } from '../payments/service.js';
import { Prisma } from '@prisma/client';
import { adminReportFilterSchema } from '@behjati/shared/admin';
import { salesChannels } from '@behjati/shared/sales';
import type { SalesChannel } from '@prisma/client';
import { customerWhere } from './users.js';
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
    ...(input.salesChannel ? { salesChannel: input.salesChannel } : {}),
    ...(input.shippingMethod ? { shippingMethod: input.shippingMethod } : {}),
  };
  const statusClause = Prisma.sql`${input.status ? Prisma.sql`AND status = ${input.status}` : Prisma.empty} ${input.salesChannel ? Prisma.sql`AND salesChannel = ${input.salesChannel}` : Prisma.empty} ${input.shippingMethod ? Prisma.sql`AND shippingMethod = ${input.shippingMethod}` : Prisma.empty}`;
  const relatedOrder = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.salesChannel ? { salesChannel: input.salesChannel } : {}),
    ...(input.shippingMethod ? { shippingMethod: input.shippingMethod } : {}),
  };
  const relatedClause = Prisma.sql`${input.status ? Prisma.sql`AND o.status = ${input.status}` : Prisma.empty} ${input.salesChannel ? Prisma.sql`AND o.salesChannel = ${input.salesChannel}` : Prisma.empty} ${input.shippingMethod ? Prisma.sql`AND o.shippingMethod = ${input.shippingMethod}` : Prisma.empty}`;
  const ledgerScope = !input.status && !input.salesChannel && !input.shippingMethod;
  const [
    daily,
    statuses,
    aggregate,
    count,
    income,
    incomeDaily,
    offlineIncome,
    offlineDaily,
    linkIncome,
    linkDaily,
  ] = await db.$transaction(async (tx) =>
    Promise.all([
      tx.$queryRaw<Array<{ date: string; ordersCount: bigint; orderValue: Prisma.Decimal }>>(
        Prisma.sql`SELECT DATE_FORMAT(CONVERT_TZ(createdAt, '+00:00', '+03:30'), '%Y-%m-%d') AS date, COUNT(*) AS ordersCount, SUM(CASE WHEN status <> 'CANCELED' THEN total ELSE 0 END) AS orderValue FROM \`Order\` WHERE createdAt >= ${where.createdAt.gte} AND createdAt < ${where.createdAt.lt} ${statusClause} GROUP BY date ORDER BY date`,
      ),
      tx.$queryRaw<Array<{ status: (typeof orderStatuses)[number]; count: bigint }>>(
        Prisma.sql`SELECT status, COUNT(*) AS count FROM \`Order\` WHERE createdAt >= ${where.createdAt.gte} AND createdAt < ${where.createdAt.lt} ${statusClause} GROUP BY status`,
      ),
      tx.order.aggregate({
        where: { ...where, AND: { status: { not: 'CANCELED' } } },
        _sum: { total: true },
        _avg: { total: true },
      }),
      tx.order.count({ where }),
      tx.payment.aggregate({
        where: {
          status: 'SUCCEEDED',
          orderId: { not: null },
          mode: paymentMode,
          acceptedAt: { gte: where.createdAt.gte, lt: where.createdAt.lt },
          order: relatedOrder,
        },
        _sum: { amountRials: true },
      }),
      tx.$queryRaw<Array<{ date: string; revenue: Prisma.Decimal }>>(
        Prisma.sql`SELECT DATE_FORMAT(CONVERT_TZ(p.acceptedAt, '+00:00', '+03:30'), '%Y-%m-%d') AS date, SUM(p.amountRials) AS revenue FROM Payment p JOIN \`Order\` o ON o.id = p.orderId WHERE p.mode = ${paymentMode} AND p.status = 'SUCCEEDED' AND p.acceptedAt >= ${where.createdAt.gte} AND p.acceptedAt < ${where.createdAt.lt} ${relatedClause} GROUP BY date ORDER BY date`,
      ),
      ledgerScope
        ? tx
            .$queryRaw<Array<{ revenue: Prisma.Decimal }>>(
              Prisma.sql`SELECT COALESCE(SUM(CASE WHEN direction='RECEIPT' THEN amount ELSE -amount END),0) AS revenue FROM CustomerAccountEntry WHERE createdAt >= ${where.createdAt.gte} AND createdAt < ${where.createdAt.lt}`,
            )
            .then((rows) => ({ _sum: { amount: Number(rows[0]?.revenue ?? 0) } }))
        : tx.offlinePayment.aggregate({
            where: {
              voided: false,
              createdAt: { gte: where.createdAt.gte, lt: where.createdAt.lt },
              order: relatedOrder,
            },
            _sum: { amount: true },
          }),
      ledgerScope
        ? tx.$queryRaw<Array<{ date: string; revenue: Prisma.Decimal }>>(
            Prisma.sql`SELECT DATE_FORMAT(CONVERT_TZ(createdAt, '+00:00', '+03:30'), '%Y-%m-%d') AS date, SUM(CASE WHEN direction='RECEIPT' THEN amount ELSE -amount END) AS revenue FROM CustomerAccountEntry WHERE createdAt >= ${where.createdAt.gte} AND createdAt < ${where.createdAt.lt} GROUP BY date ORDER BY date`,
          )
        : tx.$queryRaw<Array<{ date: string; revenue: Prisma.Decimal }>>(
            Prisma.sql`SELECT DATE_FORMAT(CONVERT_TZ(p.createdAt, '+00:00', '+03:30'), '%Y-%m-%d') AS date, SUM(p.amount) AS revenue FROM OfflinePayment p JOIN \`Order\` o ON o.id=p.orderId WHERE p.voided=false AND p.createdAt >= ${where.createdAt.gte} AND p.createdAt < ${where.createdAt.lt} ${relatedClause} GROUP BY date ORDER BY date`,
          ),
      ledgerScope
        ? tx.payment.aggregate({
            where: {
              mode: paymentMode,
              status: 'SUCCEEDED',
              paymentRequestId: { not: null },
              paymentRequest: { customerId: null },
              acceptedAt: { gte: where.createdAt.gte, lt: where.createdAt.lt },
            },
            _sum: { amountRials: true },
          })
        : Promise.resolve({ _sum: { amountRials: 0n } }),
      ledgerScope
        ? tx.$queryRaw<Array<{ date: string; revenue: Prisma.Decimal }>>(
            Prisma.sql`SELECT DATE_FORMAT(CONVERT_TZ(p.acceptedAt,'+00:00','+03:30'),'%Y-%m-%d') AS date,SUM(p.amountRials) AS revenue FROM Payment p JOIN PaymentRequest r ON r.id=p.paymentRequestId WHERE r.customerId IS NULL AND p.mode=${paymentMode} AND p.status='SUCCEEDED' AND p.acceptedAt>=${where.createdAt.gte} AND p.acceptedAt<${where.createdAt.lt} GROUP BY date ORDER BY date`,
          )
        : Promise.resolve([]),
    ]),
  );
  return {
    from: input.from,
    to: input.to,
    ordersCount: count,
    orderValue: aggregate._sum.total ?? 0,
    averageOrderValue: aggregate._avg.total ?? 0,
    paymentLinkRevenue: Number((linkIncome._sum.amountRials ?? 0n) / 10n),
    bankRevenue: Number((income._sum.amountRials ?? 0n) / 10n),
    offlineRevenue: offlineIncome._sum.amount ?? 0,
    revenue:
      Number((income._sum.amountRials ?? 0n) / 10n) +
      (offlineIncome._sum.amount ?? 0) +
      Number((linkIncome._sum.amountRials ?? 0n) / 10n),
    daily: dateDays(input.from, input.to).map((date) => {
      const value = daily.find((row) => row.date === date);
      return {
        date,
        ordersCount: Number(value?.ordersCount ?? 0),
        orderValue: Number(value?.orderValue ?? 0),
        revenue:
          Number(incomeDaily.find((row) => row.date === date)?.revenue ?? 0) / 10 +
          Number(offlineDaily.find((row) => row.date === date)?.revenue ?? 0) +
          Number(linkDaily.find((row) => row.date === date)?.revenue ?? 0) / 10,
      };
    }),
    statuses: orderStatuses.map((status) => ({
      status,
      count: Number(statuses.find((row) => row.status === status)?.count ?? 0),
    })),
  };
}
export async function adminDashboard(salesChannel?: SalesChannel | null) {
  const channelWhere = salesChannel ? { salesChannel } : {};
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
    offlineIncome,
    channelMetrics,
    linkIncome,
  ] = await Promise.all([
    db.order.count({ where: channelWhere }),
    db.order.count({
      where: { ...channelWhere, createdAt: { gte: dayStart(today), lt: dayAfter(today) } },
    }),
    db.order.count({
      where: { ...channelWhere, createdAt: { gte: dayStart(month), lt: dayAfter(today) } },
    }),
    db.order.aggregate({
      where: { ...channelWhere, status: { not: 'CANCELED' } },
      _sum: { total: true },
      _avg: { total: true },
    }),
    db.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        mode: paymentMode,
        orderId: { not: null },
        order: channelWhere,
      },
      _sum: { amountRials: true },
    }),
    adminOrders({ page: 1, pageSize: 5, salesChannel }),
    adminReport({ from, to: today, salesChannel }),
    db.product.count({ where: { isActive: true } }),
    adminUsers({ page: 1, pageSize: 5, salesChannel }),
    db.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { ...channelWhere, status: { not: 'CANCELED' } },
        product: { NOT: retiredDemoProduct },
      },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    !salesChannel
      ? db
          .$queryRaw<Array<{ revenue: Prisma.Decimal }>>(
            Prisma.sql`SELECT COALESCE(SUM(CASE WHEN direction='RECEIPT' THEN amount ELSE -amount END),0) AS revenue FROM CustomerAccountEntry`,
          )
          .then((rows) => ({ _sum: { amount: Number(rows[0]?.revenue ?? 0) } }))
      : db.offlinePayment.aggregate({
          where: { order: channelWhere, voided: false },
          _sum: { amount: true },
        }),
    Promise.all(
      salesChannels.map(async (channel) => {
        const [customersCount, ordersCount, value, received, bank] = await Promise.all([
          db.user.count({ where: customerWhere('', channel) }),
          db.order.count({ where: { salesChannel: channel } }),
          db.order.aggregate({
            where: { salesChannel: channel, status: { not: 'CANCELED' } },
            _sum: { total: true },
          }),
          db.offlinePayment.aggregate({
            where: { order: { salesChannel: channel }, voided: false },
            _sum: { amount: true },
          }),
          db.payment.aggregate({
            where: { status: 'SUCCEEDED', mode: paymentMode, order: { salesChannel: channel } },
            _sum: { amountRials: true },
          }),
        ]);
        return {
          salesChannel: channel,
          customersCount,
          ordersCount,
          orderValue: value._sum.total ?? 0,
          revenue: (received._sum.amount ?? 0) + Number((bank._sum.amountRials ?? 0n) / 10n),
        };
      }),
    ),
    !salesChannel
      ? db.payment.aggregate({
          where: {
            mode: paymentMode,
            status: 'SUCCEEDED',
            paymentRequestId: { not: null },
            paymentRequest: { customerId: null },
          },
          _sum: { amountRials: true },
        })
      : Promise.resolve({ _sum: { amountRials: 0n } }),
  ]);
  const products = await db.product.findMany({
    where: { id: { in: orderedProducts.map((item) => item.productId) } },
    include: { images: { orderBy: productRelations.images.orderBy, take: 1 } },
  });
  return {
    channelMetrics,
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
    revenue:
      Number((paidIncome._sum.amountRials ?? 0n) / 10n) +
      (offlineIncome._sum.amount ?? 0) +
      Number((linkIncome._sum.amountRials ?? 0n) / 10n),
    recentOrders: recent.items,
    report,
  };
}
