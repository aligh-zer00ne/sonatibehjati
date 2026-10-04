import type { Resolvers } from '../../generated/resolvers.js';
import {
  currentAdmin,
  requireAdmin,
  requireAdminOrigin,
  loginAdmin,
  refreshAdmin,
  logoutAdmin,
} from './auth.js';
import {
  adminProducts,
  saveAdminProduct,
  setAdminProductActive,
  deleteAdminProduct,
} from './products.js';
import { adminOrders, adminOrder, changeOrderStatus } from './orders.js';
import { adminUsers, adminUser } from './users.js';
import { adminReport, adminDashboard } from './reports.js';
import { serializeDates } from './validation.js';
export const adminResolvers: Resolvers = {
  Query: {
    adminMe: (_parent, _args, context) => currentAdmin(context),
    adminProducts: async (_parent, { input }, context) => {
      await requireAdmin(context);
      const page = await adminProducts(input);
      return { ...page, items: page.items.map(serializeDates) };
    },
    adminOrders: async (_parent, { input }, context) => {
      await requireAdmin(context);
      return adminOrders(input);
    },
    adminOrder: async (_parent, { id }, context) => {
      await requireAdmin(context);
      return adminOrder(id);
    },
    adminUser: async (_parent, { id }, context) => {
      await requireAdmin(context);
      return adminUser(id);
    },
    adminUsers: async (_parent, { input }, context) => {
      await requireAdmin(context);
      return adminUsers(input);
    },
    adminReport: async (_parent, { input }, context) => {
      await requireAdmin(context);
      return adminReport(input);
    },
    adminDashboard: async (_parent, _args, context) => {
      await requireAdmin(context);
      return adminDashboard();
    },
  },
  Mutation: {
    adminLogin: (_parent, { input }, context) => loginAdmin(context, input),
    adminRefresh: (_parent, _args, context) => refreshAdmin(context),
    adminLogout: (_parent, _args, context) => logoutAdmin(context),
    saveAdminProduct: async (_parent, { id, expectedUpdatedAt, input }, context) => {
      requireAdminOrigin(context);
      await requireAdmin(context);
      return serializeDates(await saveAdminProduct(input, id, expectedUpdatedAt));
    },
    setAdminProductActive: async (_parent, args, context) => {
      requireAdminOrigin(context);
      await requireAdmin(context);
      return serializeDates(
        await setAdminProductActive(args.id, args.isActive, args.expectedUpdatedAt),
      );
    },
    deleteAdminProduct: async (_parent, args, context) => {
      requireAdminOrigin(context);
      await requireAdmin(context);
      const result = await deleteAdminProduct(args.id, args.expectedUpdatedAt);
      return { ...result, product: result.product ? serializeDates(result.product) : null };
    },
    updateAdminOrderStatus: async (_parent, { input }, context) => {
      requireAdminOrigin(context);
      const admin = await requireAdmin(context);
      return changeOrderStatus(admin.id, input);
    },
  },
};
