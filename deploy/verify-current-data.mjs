import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parse } from 'dotenv';
const root = fileURLToPath(new URL('../', import.meta.url));
const env = parse(readFileSync(join(root, 'apps/api/.env')));
const db = new PrismaClient({ datasourceUrl: env.DATABASE_URL });
try {
  const result = {
    categories: await db.category.count(),
    products: await db.product.count(),
    activeProducts: await db.product.count({ where: { isActive: true } }),
    productImages: await db.productImage.count(),
    activeProductImages: await db.productImage.count({ where: { product: { isActive: true } } }),
    users: await db.user.count(),
    orders: await db.order.count(),
    admins: await db.admin.count(),
  };
  console.log(JSON.stringify(result, null, 2));
} catch {
  throw new Error(
    'Cannot read the catalog snapshot. Check the private DATABASE_URL and server connection.',
  );
} finally {
  await db.$disconnect();
}
