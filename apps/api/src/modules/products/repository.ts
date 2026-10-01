import { db } from '../../database/client.js';
export const productRepository = {
  list: (category?: string | null, search?: string | null) =>
    db.product.findMany({
      where: {
        isActive: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(search ? { title: { contains: search } } : {}),
      },
      include: { category: true, images: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  bySlug: (slug: string) =>
    db.product.findFirst({
      where: { slug, isActive: true },
      include: { category: true, images: true },
    }),
  categories: () => db.category.findMany({ orderBy: { title: 'asc' } }),
};
