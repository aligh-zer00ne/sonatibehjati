import { Prisma } from '@prisma/client';
import { adminProductInputSchema, adminProductsFilterSchema } from '@behjati/shared/admin';
import { db } from '../../database/client.js';
import { authError } from '../auth/errors.js';
import { validate, omitNulls } from './validation.js';
import { productRelations as include } from '../products/repository.js';
export async function adminProducts(raw: Record<string, unknown>) {
  const input = validate(adminProductsFilterSchema, omitNulls(raw));
  const { page, pageSize } = input;
  const where: Prisma.ProductWhereInput = {
    ...(input.search
      ? { OR: [{ title: { contains: input.search } }, { slug: { contains: input.search } }] }
      : {}),
    ...(input.categoryId ? { categoryId: input.categoryId } : {}),
    ...(input.active != null ? { isActive: input.active } : {}),
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    input.sort === 'PRICE_ASC'
      ? [{ price: 'asc' }]
      : input.sort === 'PRICE_DESC'
        ? [{ price: 'desc' }]
        : input.sort === 'NAME_ASC'
          ? [{ title: 'asc' }]
          : [{ createdAt: 'desc' }];
  const [items, total] = await db.$transaction([
    db.product.findMany({
      where,
      include,
      orderBy: [...orderBy, { id: 'asc' }],
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    db.product.count({ where }),
  ]);
  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
function nextVersion(previous: Date) {
  return new Date(Math.max(Date.now(), previous.getTime() + 1));
}
async function lockProduct(tx: Prisma.TransactionClient, id: string, expectedUpdatedAt: string) {
  if (!id || id.length > 100) throw authError('شناسه محصول معتبر نیست.', 'BAD_USER_INPUT');
  await tx.$queryRaw`SELECT id FROM Product WHERE id = ${id} FOR UPDATE`;
  const product = await tx.product.findUnique({ where: { id } });
  if (!product) throw authError('محصول یافت نشد.', 'NOT_FOUND');
  if (product.updatedAt.toISOString() !== expectedUpdatedAt)
    throw authError('این محصول تغییر کرده است؛ اطلاعات را دوباره دریافت کنید.', 'REQUEST_CONFLICT');
  return product;
}
export async function saveAdminProduct(
  raw: unknown,
  id?: string | null,
  expectedUpdatedAt?: string | null,
) {
  const input = validate(adminProductInputSchema, raw);
  try {
    return await db.$transaction(async (tx) => {
      const previous = id ? await lockProduct(tx, id, expectedUpdatedAt ?? '') : null;
      if (!(await tx.category.findUnique({ where: { id: input.categoryId } })))
        throw authError('دسته‌بندی معتبر انتخاب کنید.', 'BAD_USER_INPUT');
      const { images, ...fields } = input;
      const data = { ...fields, badge: fields.badge || null };
      const orderedImages = images.map((image, position) => ({ ...image, position }));
      if (id) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        return tx.product.update({
          where: { id },
          data: {
            ...data,
            updatedAt: nextVersion(previous!.updatedAt),
            images: { create: orderedImages },
          },
          include,
        });
      }
      return tx.product.create({ data: { ...data, images: { create: orderedImages } }, include });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      throw authError('نامک محصول تکراری است.', 'BAD_USER_INPUT');
    throw error;
  }
}
export async function setAdminProductActive(
  id: string,
  isActive: boolean,
  expectedUpdatedAt: string,
) {
  return db.$transaction(async (tx) => {
    const previous = await lockProduct(tx, id, expectedUpdatedAt);
    return tx.product.update({
      where: { id },
      data: { isActive, updatedAt: nextVersion(previous.updatedAt) },
      include,
    });
  });
}
export async function deleteAdminProduct(id: string, expectedUpdatedAt: string) {
  return db.$transaction(async (tx) => {
    const previous = await lockProduct(tx, id, expectedUpdatedAt);
    if (await tx.orderItem.count({ where: { productId: id } }))
      return {
        deleted: false,
        product: await tx.product.update({
          where: { id },
          data: { isActive: false, updatedAt: nextVersion(previous.updatedAt) },
          include,
        }),
      };
    await tx.product.delete({ where: { id } });
    return { deleted: true, product: null };
  });
}
