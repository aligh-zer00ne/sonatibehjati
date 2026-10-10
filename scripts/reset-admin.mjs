import { createRequire } from 'node:module';
import { hashAdminPassword } from '../apps/api/src/modules/admin/passwords.ts';
import { adminLoginSchema } from '@behjati/shared/admin';

// Explicit maintenance command only; never called during routine deployment or seed.
const input = adminLoginSchema.parse({
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
});
const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--allow-short-password'))
  throw new Error('Only --allow-short-password is supported. Supply credentials via environment.');
const passwordHash = await hashAdminPassword(
  input.password,
  args.includes('--allow-short-password'),
);
const currentEmail = process.env.ADMIN_CURRENT_EMAIL?.trim().toLowerCase();
const require = createRequire(new URL('../apps/api/package.json', import.meta.url));
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
try {
  await db.$transaction(async (tx) => {
    let admin;
    if (currentEmail) {
      admin = await tx.admin.findUnique({ where: { email: currentEmail } });
      if (!admin) throw new Error('ADMIN_CURRENT_EMAIL does not match an existing administrator.');
    } else {
      admin = await tx.admin.findUnique({ where: { email: input.email } });
      if (!admin) {
        const candidates = await tx.admin.findMany({ take: 2 });
        if (candidates.length > 1)
          throw new Error('Multiple administrators exist. Set ADMIN_CURRENT_EMAIL explicitly.');
        admin = candidates[0];
      }
    }
    if (!admin) {
      await tx.admin.create({ data: { email: input.email, passwordHash } });
      return;
    }
    await tx.$queryRaw`SELECT id FROM Admin WHERE id = ${admin.id} FOR UPDATE`;
    await tx.admin.update({
      where: { id: admin.id },
      data: { email: input.email, passwordHash },
    });
    const revokedAt = new Date();
    await tx.adminSession.updateMany({
      where: { adminId: admin.id, revokedAt: null },
      data: { revokedAt },
    });
    await tx.adminRefreshToken.updateMany({
      where: { adminId: admin.id, revokedAt: null },
      data: { revokedAt },
    });
  });
  console.log('Administrator credentials updated; previous sessions revoked. No password logged.');
} finally {
  await db.$disconnect();
}
