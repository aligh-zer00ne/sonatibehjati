import { createHmac } from 'node:crypto';
import { db } from '../../database/client.js';
import { authConfig } from './runtime.js';
import { authError } from './errors.js';
export async function consumeAuthLimit(key: string, limit: number, windowSeconds: number) {
  const hashed = createHmac('sha256', authConfig.otpSecret).update(`rate:${key}`).digest('hex');
  return db.$transaction(async (tx) => {
    const now = new Date();
    const initialExpiry = new Date(now.getTime() + windowSeconds * 1000);
    // MySQL atomic upsert avoids the read-then-create race in Prisma's emulated upsert.
    await tx.$executeRaw`INSERT INTO AuthThrottle (\`key\`, \`count\`, expiresAt) VALUES (${hashed}, 0, ${initialExpiry}) ON DUPLICATE KEY UPDATE \`key\` = \`key\``;
    await tx.$queryRaw`SELECT \`key\` FROM AuthThrottle WHERE \`key\` = ${hashed} FOR UPDATE`;
    const bucket = await tx.authThrottle.findUniqueOrThrow({ where: { key: hashed } });
    const expired = bucket.expiresAt <= now;
    const count = expired ? 0 : bucket.count;
    const expiresAt = expired ? new Date(now.getTime() + windowSeconds * 1000) : bucket.expiresAt;
    if (count >= limit)
      throw authError(
        'درخواست‌های زیادی فرستاده‌اید. کمی بعد دوباره تلاش کنید.',
        'RATE_LIMITED',
        Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000)),
      );
    await tx.authThrottle.update({ where: { key: hashed }, data: { count: count + 1, expiresAt } });
  });
}
