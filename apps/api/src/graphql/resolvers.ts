import { supportResolvers } from '../modules/support/resolvers.js';
import { adminResolvers } from '../modules/admin/resolvers.js';
import { accountResolvers } from '../modules/account/resolvers.js';
import { authResolvers } from '../modules/auth/resolvers.js';
import { checkoutResolvers } from '../modules/checkout/resolvers.js';
import type { Resolvers } from '../generated/resolvers.js';
import { productRepository } from '../modules/products/repository.js';
import { catalogRepository } from '../modules/products/catalog.js';
import { serializeProduct as serialize } from '../modules/products/presentation.js';
export const resolvers: Resolvers = {
  Mutation: {
    ...authResolvers.Mutation,
    ...supportResolvers.Mutation,
    ...adminResolvers.Mutation,
    ...checkoutResolvers.Mutation,
    ...accountResolvers.Mutation,
  },
  Query: {
    ...authResolvers.Query,
    ...supportResolvers.Query,
    ...adminResolvers.Query,
    ...accountResolvers.Query,
    ...checkoutResolvers.Query,
    health: () => 'ok',
    promotionalProducts: async () => (await productRepository.promotional()).map(serialize),
    products: async (_parent, args) =>
      (await productRepository.list(args.category, args.search)).map(serialize),
    product: async (_parent, args) => {
      const product = await productRepository.bySlug(args.slug);
      return product ? serialize(product) : null;
    },
    categories: () => productRepository.categories(),
    catalog: async (_parent, { input }) => {
      const raw = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== null));
      const page = await catalogRepository.page(raw);
      return { ...page, items: page.items.map(serialize) };
    },
    productsByIds: async (_parent, { ids }) => (await catalogRepository.byIds(ids)).map(serialize),
  },
};
