import type { Resolvers } from '../../generated/resolvers.js';
import { requireUser } from '../auth/guard.js';
import { requireAuthOrigin } from '../../graphql/context.js';
import { requireAdminOrigin, requirePermission } from '../admin/auth.js';
import { consumeAuthLimit } from '../auth/rate-limit.js';
import { orderPayments, paymentAvailable, retryPayment, startOrderPayment } from './service.js';
const fields = {
  paidAt: (order: { id: string; paidAt?: Date | null }) => order.paidAt?.toISOString() ?? null,
  payments: (order: { id: string }) => orderPayments(order.id),
};
export const paymentResolvers: Resolvers = {
  OrderReceipt: fields,
  AccountOrder: fields,
  AdminOrder: fields,
  Query: { paymentAvailable },
  Mutation: {
    startOrderPayment: async (_, { orderId }, ctx) => {
      requireAuthOrigin(ctx);
      const user = await requireUser(ctx);
      await consumeAuthLimit(`payment:${user.id}`, 10, 60);
      return startOrderPayment(user.id, orderId);
    },
    retryAdminPayment: async (_, { paymentId }, ctx) => {
      requireAdminOrigin(ctx);
      const admin = await requirePermission(ctx, 'ORDERS');
      await consumeAuthLimit(`payment-check:${admin.id}`, 20, 60);
      return retryPayment(paymentId);
    },
  },
};
