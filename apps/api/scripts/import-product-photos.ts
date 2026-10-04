import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  photoCategories,
  photoProducts,
  photoGallery,
  temporaryPhotoDescription,
} from '@behjati/shared/photo-catalog';

if (process.env.NODE_ENV !== 'development')
  throw new Error('Photo catalog import is development-only.');
const db = new PrismaClient();
try {
  // Fail before touching the database when an image has not been prepared.
  for (const product of photoProducts)
    for (const image of photoGallery(product))
      await access(fileURLToPath(new URL(`../../storefront/public${image.url}`, import.meta.url)));
  const previous = {
    categories: await db.category.findMany(),
    products: await db.product.findMany({ include: { images: true } }),
  };
  const backupDirectory = fileURLToPath(new URL('../.photo-import-backups/', import.meta.url));
  await mkdir(backupDirectory, { recursive: true });
  await writeFile(`${backupDirectory}${Date.now()}.json`, JSON.stringify(previous, null, 2), {
    mode: 0o600,
  });
  await db.$transaction(async (tx) => {
    for (const category of photoCategories) {
      const existing = await tx.category.findUnique({ where: { slug: category.slug } });
      await tx.category.upsert({
        where: { slug: category.slug },
        create: category,
        update:
          existing &&
          /^\/images\/(tahini|halva|oil|sesame-bowl|halva-category|oil-category)\.webp$/.test(
            existing.image,
          )
            ? { image: category.image }
            : {},
      });
    }
    for (const product of photoProducts) {
      const category = await tx.category.findUniqueOrThrow({ where: { slug: product.category } });
      const existing = await tx.product.findUnique({
        where: { slug: product.slug },
        include: { images: true },
      });
      const images = photoGallery(product).map((image, position) => ({ ...image, position }));
      if (!existing) {
        await tx.product.create({
          data: {
            id: product.id,
            slug: product.slug,
            title: product.title,
            categoryId: category.id,
            price: product.price,
            weight: product.weight,
            badge: product.badge,
            shortDescription: 'فرآوردهٔ کنجدی سنتی بهجتی',
            description: temporaryPhotoDescription,
            images: { create: images },
          },
        });
      } else if (
        existing.images.every((image) =>
          /^\/images\/(halva|tahini|oil|premium)\.webp$/.test(image.url),
        )
      ) {
        // Replace only known old placeholder photos. Keep administrator-edited catalog fields.
        await tx.productImage.deleteMany({ where: { productId: existing.id } });
        await tx.productImage.createMany({
          data: images.map((image) => ({ ...image, productId: existing.id })),
        });
      } else if (
        existing.images.every((image) => images.some((photo) => photo.url === image.url))
      ) {
        // Extend our previous photo set in place. Never replace administrator-uploaded galleries.
        // Existing image IDs and alt text remain stable; reruns only add missing photographs.
        const missing = images.filter(
          (image) => !existing.images.some((previousImage) => previousImage.url === image.url),
        );
        if (missing.length)
          await tx.productImage.createMany({
            data: missing.map((image) => ({ ...image, productId: existing.id })),
          });
      }
    }
    // Retire only untouched development fixtures that have no matching photograph.
    // No deletion: order references and historical snapshots remain valid.
    await tx.product.updateMany({
      where: {
        slug: {
          in: [
            'sample-tahini',
            'sample-halva',
            'sample-oil',
            'chocolate-halva-500',
            'date-tahini-500',
          ],
        },
        shortDescription: 'محصول نمونه برای توسعه',
        images: {
          every: {
            url: {
              in: [
                '/images/tahini.webp',
                '/images/halva.webp',
                '/images/oil.webp',
                '/images/chocolate.webp',
                '/images/date.webp',
              ],
            },
          },
        },
      },
      data: { isActive: false },
    });
  });
  console.log(
    'Photo catalog imported: 12 product definitions, 5 categories, 4 photographs per managed gallery; existing prices, weights and administrator edits preserved. Backup saved privately in apps/api/.photo-import-backups/.',
  );
} finally {
  await db.$disconnect();
}
