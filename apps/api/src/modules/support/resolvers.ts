import type { Resolvers } from '../../generated/resolvers.js';
import { requireAdmin, requireAdminOrigin, requireOwner } from '../admin/auth.js';
import { requireUser } from '../auth/guard.js';
import { requireAuthOrigin } from '../../graphql/context.js';
import { consumeAuthLimit } from '../auth/rate-limit.js';
import { db } from '../../database/client.js';
import {
  createStaff,
  setStaffActive,
  saveCoupon,
  presentCoupon,
  customerExport,
} from '../admin/operations.js';
import {
  createTicket,
  tickets,
  getTicket,
  replyTicket,
  setTicketStatus,
  reviews,
  myReview,
  submitReview,
  moderateReview,
} from './service.js';
export const supportResolvers: Resolvers = {
  Query: {
    adminAccounts: async (_, __, ctx) => {
      await requireOwner(ctx);
      return db.admin.findMany({ orderBy: { createdAt: 'asc' } });
    },
    adminCoupons: async (_, __, ctx) => {
      await requireOwner(ctx);
      return (await db.discountCode.findMany({ orderBy: { updatedAt: 'desc' }, take: 1000 })).map(
        presentCoupon,
      );
    },
    adminCustomerExport: async (_, { search }, ctx) => {
      const admin = await requireOwner(ctx);
      await consumeAuthLimit(`export:${admin.id}`, 5, 60);
      return customerExport(search ?? '');
    },
    myTickets: async (_, { input }, ctx) => tickets(input, (await requireUser(ctx)).id),
    myTicket: async (_, { id }, ctx) => getTicket(id, (await requireUser(ctx)).id),
    adminTickets: async (_, { input }, ctx) => {
      await requireAdmin(ctx);
      return tickets(input);
    },
    adminTicket: async (_, { id }, ctx) => {
      await requireAdmin(ctx);
      return getTicket(id);
    },
    productReviews: (_, { productId, page }) =>
      reviews({ page: page ?? 1, pageSize: 10 }, productId),
    myProductReview: async (_, { productId }, ctx) =>
      myReview((await requireUser(ctx)).id, productId),
    adminReviews: async (_, { input }, ctx) => {
      await requireAdmin(ctx);
      return reviews(input);
    },
  },
  Mutation: {
    createStaff: async (_, { input }, ctx) => {
      requireAdminOrigin(ctx);
      const admin = await requireOwner(ctx);
      await consumeAuthLimit(`staff:${admin.id}`, 10, 60);
      return createStaff(input);
    },
    setStaffActive: async (_, { id, isActive }, ctx) => {
      requireAdminOrigin(ctx);
      await requireOwner(ctx);
      return setStaffActive(id, isActive);
    },
    saveAdminCoupon: async (_, { id, expectedUpdatedAt, input }, ctx) => {
      requireAdminOrigin(ctx);
      await requireOwner(ctx);
      return saveCoupon(input, id, expectedUpdatedAt);
    },
    createTicket: async (_, { input }, ctx) => {
      requireAuthOrigin(ctx);
      const user = await requireUser(ctx);
      await consumeAuthLimit(`ticket:${user.id}`, 5, 60);
      return createTicket(user.id, input);
    },
    replyTicket: async (_, { input }, ctx) => {
      requireAuthOrigin(ctx);
      const user = await requireUser(ctx);
      await consumeAuthLimit(`reply:${user.id}`, 20, 60);
      return replyTicket(input, user.id);
    },
    replyAdminTicket: async (_, { input }, ctx) => {
      requireAdminOrigin(ctx);
      const admin = await requireAdmin(ctx);
      await consumeAuthLimit(`support:${admin.id}`, 60, 60);
      return replyTicket(input);
    },
    setAdminTicketStatus: async (_, { id, status, expectedUpdatedAt }, ctx) => {
      requireAdminOrigin(ctx);
      await requireAdmin(ctx);
      return setTicketStatus(id, status, expectedUpdatedAt);
    },
    submitProductReview: async (_, { input }, ctx) => {
      requireAuthOrigin(ctx);
      const user = await requireUser(ctx);
      await consumeAuthLimit(`review:${user.id}`, 10, 60);
      return submitReview(user.id, input);
    },
    moderateProductReview: async (_, { id, status, expectedUpdatedAt }, ctx) => {
      requireAdminOrigin(ctx);
      await requireAdmin(ctx);
      return moderateReview(id, status, expectedUpdatedAt);
    },
  },
};
