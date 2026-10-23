import { createPaymentRequest, paymentRequests, cancelPaymentRequest } from './requests.js';
import { adminGatewayTest, startAdminGatewayTest } from './admin-test.js';
import { db } from '../../database/client.js';
import type { Resolvers } from '../../generated/resolvers.js';
import { requireUser } from '../auth/guard.js';
import { requireAuthOrigin } from '../../graphql/context.js';
import { requireAdminOrigin, requirePermission, requireOwner } from '../admin/auth.js';
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
  Query: {
    adminPaymentRequests: async (_, { input }, ctx) => {
      await requirePermission(ctx, 'ORDERS');
      return paymentRequests(input);
    },
    paymentAvailable,
    adminGatewayTest: async (_parent, _args, ctx) => {
      requireAdminOrigin(ctx);
      const owner = await requireOwner(ctx);
      return adminGatewayTest(owner.id);
    },
  },
  Mutation: {
    createAdminPaymentRequest: async (_, { input }, ctx) => {
      requireAdminOrigin(ctx);
      const admin = await requirePermission(ctx, 'ORDERS');
      await consumeAuthLimit(`payment-links:${admin.id}`, 30, 60);
      return createPaymentRequest(admin, input);
    },
    cancelAdminPaymentRequest: async (_, { id }, ctx) => {
      requireAdminOrigin(ctx);
      await requirePermission(ctx, 'ORDERS');
      return cancelPaymentRequest(id);
    },
    startAdminGatewayTest: async (_parent, _args, ctx) => {
      requireAdminOrigin(ctx);
      const owner = await requireOwner(ctx);
      await consumeAuthLimit(`gateway-test:${owner.id}`, 10, 60);
      return startAdminGatewayTest(owner.id);
    },
    startOrderPayment: async (_, { orderId }, ctx) => {
      requireAuthOrigin(ctx);
      const user = await requireUser(ctx);
      await consumeAuthLimit(`payment:${user.id}`, 10, 60);
      return startOrderPayment(user.id, orderId);
    },
    retryAdminPayment: async (_, { paymentId }, ctx) => {
      requireAdminOrigin(ctx);
      const admin = await requirePermission(ctx, 'ORDERS');
      const payment = await db.payment.findUnique({
        where: { id: paymentId },
        select: { orderId: true, paymentRequestId: true },
      });
      if (payment && !payment.orderId && !payment.paymentRequestId) await requireOwner(ctx);
      await consumeAuthLimit(`payment-check:${admin.id}`, 20, 60);
      return retryPayment(paymentId);
    },
  },
};
