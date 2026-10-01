import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';
import { env } from '../src/config/env.js';
const db = new PrismaClient();
async function seed() {
  if (process.env.NODE_ENV !== 'development')
    throw new Error('Seed is development-only; explicitly set NODE_ENV=development.');
  for (const [slug, title, image] of [
    ['tahini', 'ارده', 'tahini'],
    ['halva', 'حلواارده', 'halva'],
    ['oil', 'روغن ارده', 'oil'],
  ]) {
    const category = await db.category.upsert({
      where: { slug },
      update: {},
      create: { slug: slug!, title: title!, image: `/images/${image}.webp` },
    });
    await db.product.upsert({
      where: { slug: `sample-${slug}` },
      update: {},
      create: {
        slug: `sample-${slug}`,
        title: `${title} سنتی بهجتی`,
        shortDescription: 'محصول نمونه برای توسعه',
        description: 'اطلاعات و قیمت نمونه؛ پیش از انتشار جایگزین شود.',
        price: 245000,
        weight: '۵۰۰ گرم',
        categoryId: category.id,
        images: { create: { url: `/images/${image}.webp`, alt: title! } },
      },
    });
  }
  const user = await db.user.upsert({
    where: { phone: '09000000000' },
    update: {},
    create: { phone: '09000000000', firstName: 'کاربر نمونه' },
  });
  const address = await db.address.upsert({
    where: { id: 'development-address' },
    update: {},
    create: {
      id: 'development-address',
      userId: user.id,
      title: 'نشانی نمونه',
      recipientName: 'کاربر نمونه',
      recipientPhone: user.phone,
      province: 'یزد',
      city: 'اردکان',
      postalAddress: 'نشانی نمونه، غیرواقعی',
      postalCode: '0000000000',
      latitude: 32.31,
      longitude: 54.01,
    },
  });
  const product = await db.product.findFirstOrThrow();
  await db.order.upsert({
    where: { id: 'development-order' },
    update: {},
    create: {
      id: 'development-order',
      userId: user.id,
      addressId: address.id,
      addressSnapshot: { city: 'اردکان', postalAddress: 'نشانی نمونه، غیرواقعی' },
      subtotal: product.price,
      shipping: env.SHIPPING_COST,
      total: product.price + env.SHIPPING_COST,
      items: {
        create: {
          productId: product.id,
          productTitle: product.title,
          productWeight: product.weight,
          unitPrice: product.price,
          quantity: 1,
          lineTotal: product.price,
        },
      },
    },
  });
  await db.discountCode.upsert({
    where: { code: 'DEV10' },
    update: {},
    create: {
      code: 'DEV10',
      type: 'PERCENT',
      value: 10,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000 * 30),
    },
  });
  if (process.env.DEV_ADMIN_EMAIL && process.env.DEV_ADMIN_PASSWORD) {
    if (process.env.DEV_ADMIN_PASSWORD.length < 12)
      throw new Error('Development admin password must have at least 12 characters.');
    const salt = randomBytes(16).toString('hex');
    const passwordHash = `scrypt:${salt}:${scryptSync(process.env.DEV_ADMIN_PASSWORD, salt, 64).toString('hex')}`;
    await db.admin.upsert({
      where: { email: process.env.DEV_ADMIN_EMAIL },
      update: {},
      create: { email: process.env.DEV_ADMIN_EMAIL, passwordHash },
    });
  }
}
seed().finally(() => db.$disconnect());
