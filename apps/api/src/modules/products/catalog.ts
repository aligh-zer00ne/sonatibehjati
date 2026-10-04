import { GraphQLError } from 'graphql';
import { catalogFilterSchema, selectionSchema, type CatalogFilter } from '@behjati/shared';
import type { Prisma } from '@prisma/client';
import { db } from '../../database/client.js';
import { productRelations as include } from './repository.js';
export function catalogWhere(filter: CatalogFilter): Prisma.ProductWhereInput {
  return {
    isActive: true,
    ...(filter.category ? { category: { slug: filter.category } } : {}),
    ...(filter.search
      ? {
          OR: [
            { title: { contains: filter.search } },
            { shortDescription: { contains: filter.search } },
          ],
        }
      : {}),
    ...(filter.excludeSlug ? { slug: { not: filter.excludeSlug } } : {}),
    ...(filter.minPrice !== undefined || filter.maxPrice !== undefined
      ? { price: { gte: filter.minPrice, lte: filter.maxPrice } }
      : {}),
  };
}
const orders: Record<CatalogFilter['sort'], Prisma.ProductOrderByWithRelationInput[]> = {
  FEATURED: [{ badge: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }],
  NEWEST: [{ createdAt: 'desc' }, { id: 'asc' }],
  PRICE_ASC: [{ price: 'asc' }, { id: 'asc' }],
  PRICE_DESC: [{ price: 'desc' }, { id: 'asc' }],
  NAME_ASC: [{ title: 'asc' }, { id: 'asc' }],
};
export const catalogRepository = {
  async page(raw: unknown) {
    const parsed = catalogFilterSchema.safeParse(raw);
    if (!parsed.success)
      throw new GraphQLError('فیلتر محصولات معتبر نیست.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    const filter = parsed.data;
    const where = catalogWhere(filter);
    const [total, items] = await db.$transaction([
      db.product.count({ where }),
      db.product.findMany({
        where,
        include,
        orderBy: orders[filter.sort],
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
    ]);
    return {
      items,
      total,
      page: filter.page,
      pageSize: filter.pageSize,
      totalPages: Math.ceil(total / filter.pageSize),
    };
  },
  byIds(ids: string[]) {
    const parsed = selectionSchema.safeParse({ ids });
    if (!parsed.success)
      throw new GraphQLError('فهرست محصولات معتبر نیست.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    return db.product.findMany({
      where: { id: { in: [...new Set(parsed.data.ids)] }, isActive: true },
      include,
    });
  },
};
