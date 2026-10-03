import type { Resolvers } from '../../generated/resolvers.js';
import { db } from '../../database/client.js';
import { requireUser } from '../auth/guard.js';
import { requireAuthOrigin } from '../../graphql/context.js';
import { consumeAuthLimit } from '../auth/rate-limit.js';
import { authError } from '../auth/errors.js';
import { saveAddress, deleteAddress, quoteCheckout, createOrder } from './service.js';
import { coordinatesSchema, createOrderInputSchema } from '@behjati/shared';
import { env } from '../../config/env.js';
import { NominatimGeocodingService } from '../../services/geocoding.js';
const geocoding = new NominatimGeocodingService(env.STOREFRONT_ORIGIN);
const receipt = <T extends { createdAt: Date }>(order: T) => ({
  ...order,
  createdAt: order.createdAt.toISOString(),
});
export const checkoutResolvers: Resolvers = {
  Query: {
    orderByRequestId: async (_parent, { requestId }, context) => {
      const user = await requireUser(context);
      if (!createOrderInputSchema.shape.requestId.safeParse(requestId).success)
        throw authError('شناسه درخواست معتبر نیست.', 'BAD_USER_INPUT');
      return db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM User WHERE id = ${user.id} FOR UPDATE`;
        const order = await tx.order.findUnique({
          where: { userId_clientRequestId: { userId: user.id, clientRequestId: requestId } },
        });
        return order ? receipt(order) : null;
      });
    },
    reverseLocation: async (_parent, args, context) => {
      const user = await requireUser(context);
      const parsed = coordinatesSchema.safeParse(args);
      if (!parsed.success) throw authError('موقعیت معتبر انتخاب کنید.', 'BAD_USER_INPUT');
      await consumeAuthLimit(`location:${user.id}`, 6, 60);
      try {
        return await geocoding.reverse(parsed.data);
      } catch {
        throw authError(
          'نشانی پیشنهادی دریافت نشد؛ نشانی را دستی وارد کنید.',
          'LOCATION_UNAVAILABLE',
        );
      }
    },
    myAddresses: async (_parent, _args, context) => {
      const user = await requireUser(context);
      return db.address.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
      });
    },
    checkoutQuote: async (_parent, { input }, context) => {
      const user = await requireUser(context);
      await consumeAuthLimit(`quote:${user.id}`, 120, 60);
      return quoteCheckout(user.id, input);
    },
    orderReceipt: async (_parent, { id }, context) => {
      const user = await requireUser(context);
      const order = await db.order.findFirst({ where: { id, userId: user.id } });
      if (!order) throw authError('سفارش یافت نشد.', 'NOT_FOUND');
      return receipt(order);
    },
  },
  Mutation: {
    saveAddress: async (_parent, { id, input }, context) => {
      requireAuthOrigin(context);
      const user = await requireUser(context);
      await consumeAuthLimit(`address:${user.id}`, 50, 60);
      return saveAddress(user.id, input, id);
    },
    deleteAddress: async (_parent, { id }, context) => {
      requireAuthOrigin(context);
      const user = await requireUser(context);
      return deleteAddress(user.id, id);
    },
    createOrder: async (_parent, { input }, context) => {
      requireAuthOrigin(context);
      const user = await requireUser(context);
      await consumeAuthLimit(`order:${user.id}`, 20, 60);
      return receipt(await createOrder(user.id, input));
    },
  },
};
