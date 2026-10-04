import { db } from '../../database/client.js';
export const productRelations = {
  category: true,
  images: { orderBy: [{ position: 'asc' as const }, { id: 'asc' as const }] },
};
export const productRepository = {
  list: (category?: string | null, search?: string | null) =>
    db.product.findMany({
      where: {
        isActive: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(search ? { title: { contains: search } } : {}),
      },
      include: productRelations,
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  bySlug: (slug: string) =>
    db.product.findFirst({
      where: { slug, isActive: true },
      include: productRelations,
    }),
  categories: () => db.category.findMany({ orderBy: { title: 'asc' } }),
};
