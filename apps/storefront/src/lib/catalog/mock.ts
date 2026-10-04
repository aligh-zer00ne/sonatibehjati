import type { HomepageCatalogQuery } from '@/generated/graphql';
import {
  photoCategories,
  photoProducts,
  photoGallery,
  temporaryPhotoDescription,
} from '@behjati/shared/photo-catalog';
const categories = photoCategories.map((category) => ({ ...category, id: category.slug }));
export const mockCatalog: HomepageCatalogQuery = {
  categories,
  products: photoProducts.map((product) => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    category: categories.find((category) => category.slug === product.category)!,
    price: product.price,
    weight: product.weight,
    badge: product.badge,
    isActive: true,
    shortDescription: 'فرآوردهٔ کنجدی سنتی بهجتی',
    description: temporaryPhotoDescription,
    images: photoGallery(product).map((image, index) => ({
      ...image,
      id: 'photo-' + product.id + '-' + index,
    })),
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  })),
};
