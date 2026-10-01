import type { Resolvers } from '../generated/resolvers.js';
import { productRepository } from '../modules/products/repository.js';
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
  },
};
