import type { Resolvers } from '../../generated/resolvers.js';
import {
  currentAdmin,
  requirePermission,
  requireAdminOrigin,
  loginAdmin,
  refreshAdmin,
  logoutAdmin,
  changeAdminPassword,
} from './auth.js';
import {
  adminProducts,
  adminProduct,
  setAdminPromotion,
  saveAdminProduct,
  setAdminProductActive,
  deleteAdminProduct,
} from './products.js';
import { adminOrders, adminOrder, changeOrderStatus } from './orders.js';
import { adminUsers, adminUser } from './users.js';
import { adminReport, adminDashboard } from './reports.js';
import { saveShippingLabel } from './shipping-labels.js';
import { serializeProduct as serializeDates } from '../products/presentation.js';
import { homepageContent, saveHomepageContent } from './homepage.js';
export const adminResolvers: Resolvers = {
  Query: {
    homepageContent: () => homepageContent(),
    adminHomepageContent: async (_, __, ctx) => {
      await requirePermission(ctx, 'HOMEPAGE');
      return homepageContent();
    },
    adminMe: (_parent, _args, context) => currentAdmin(context),
    adminProduct: async (_parent, { id }, context) => {
      await requirePermission(context, 'PRODUCTS');
      return serializeDates(await adminProduct(id));
    },
    adminProducts: async (_parent, { input }, context) => {
      await requirePermission(context, 'PRODUCTS');
      const page = await adminProducts(input);
      return { ...page, items: page.items.map(serializeDates) };
    },
    adminOrders: async (_parent, { input }, context) => {
      await requirePermission(context, 'ORDERS', 'ORDER_MAP');
      return adminOrders(input);
    },
    adminOrder: async (_parent, { id }, context) => {
      await requirePermission(context, 'ORDERS', 'ORDER_MAP');
      return adminOrder(id);
    },
    adminUser: async (_parent, { id }, context) => {
      await requirePermission(context, 'CUSTOMERS');
      return adminUser(id);
    },
    adminUsers: async (_parent, { input }, context) => {
      await requirePermission(context, 'CUSTOMERS');
      return adminUsers(input);
    },
    adminReport: async (_parent, { input }, context) => {
      await requirePermission(context, 'REPORTS');
      return adminReport(input);
    },
    adminDashboard: async (_parent, _args, context) => {
      await requirePermission(context, 'DASHBOARD');
      return adminDashboard();
    },
  },
  Mutation: {
    saveHomepageContent: async (_, { input, expectedUpdatedAt }, ctx) => {
      requireAdminOrigin(ctx);
      await requirePermission(ctx, 'HOMEPAGE');
      return saveHomepageContent(input, expectedUpdatedAt);
    },
    changeAdminPassword: (_parent, { input }, context) => changeAdminPassword(context, input),
    saveAdminShippingLabel: async (_parent, { orderId, input, expectedUpdatedAt }, context) => {
      requireAdminOrigin(context);
      await requirePermission(context, 'ORDERS');
      return saveShippingLabel(orderId, input, expectedUpdatedAt);
    },
    setAdminPromotion: async (_parent, { input, products }, context) => {
      requireAdminOrigin(context);
      await requirePermission(context, 'PRODUCTS');
      return (await setAdminPromotion(input, products)).map(serializeDates);
    },
    adminLogin: (_parent, { input }, context) => loginAdmin(context, input),
    adminRefresh: (_parent, _args, context) => refreshAdmin(context),
    adminLogout: (_parent, _args, context) => logoutAdmin(context),
    saveAdminProduct: async (_parent, { id, expectedUpdatedAt, input }, context) => {
      requireAdminOrigin(context);
      await requirePermission(context, 'PRODUCTS');
      return serializeDates(await saveAdminProduct(input, id, expectedUpdatedAt));
    },
    setAdminProductActive: async (_parent, args, context) => {
      requireAdminOrigin(context);
      await requirePermission(context, 'PRODUCTS');
      return serializeDates(
        await setAdminProductActive(args.id, args.isActive, args.expectedUpdatedAt),
      );
    },
    deleteAdminProduct: async (_parent, args, context) => {
      requireAdminOrigin(context);
      await requirePermission(context, 'PRODUCTS');
      const result = await deleteAdminProduct(args.id, args.expectedUpdatedAt);
      return { ...result, product: result.product ? serializeDates(result.product) : null };
    },
    updateAdminOrderStatus: async (_parent, { input }, context) => {
      requireAdminOrigin(context);
      const admin = await requirePermission(context, 'ORDERS');
      return changeOrderStatus(admin.id, input);
    },
  },
};
