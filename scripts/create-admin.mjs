import { createRequire } from 'node:module';
import { hashAdminPassword } from '../apps/api/src/modules/admin/passwords.ts';
import { adminLoginSchema } from '@behjati/shared/admin';
const input = adminLoginSchema.parse({
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
});
const require = createRequire(new URL('../apps/api/package.json', import.meta.url));
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
try {
  await db.admin.create({
    data: { email: input.email, passwordHash: await hashAdminPassword(input.password) },
  });
  console.log('Administrator created. No password was logged.');
} finally {
  await db.$disconnect();
}
