import type { Resolvers } from '../generated/resolvers.js';
import { productRepository } from '../modules/products/repository.js';
import { catalogRepository } from '../modules/products/catalog.js';
const serialize = <T extends { createdAt: Date; updatedAt: Date }>(value: T) => ({
  ...value,
  createdAt: value.createdAt.toISOString(),
  updatedAt: value.updatedAt.toISOString(),
});
export const resolvers: Resolvers = {
  Query: {
    health: () => 'ok',
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
