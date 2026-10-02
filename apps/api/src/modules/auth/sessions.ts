import type { Prisma } from '@prisma/client';
import { db } from '../../database/client.js';
import { userTokens } from './runtime.js';
import { hashToken, type TokenPair } from './tokens.js';
import { invalidSession } from './errors.js';
export async function createSession(tx: Prisma.TransactionClient, userId: string) {
  const pair = await userTokens.issue(userId);
  await tx.userSession.create({ data: { id: pair.familyId, userId, expiresAt: pair.expiresAt } });
  await storeRefresh(tx, pair);
  return pair;
}
async function storeRefresh(tx: Prisma.TransactionClient, pair: TokenPair) {
  return tx.refreshToken.create({
    data: {
      id: pair.refreshId,
      userId: pair.userId,
      familyId: pair.familyId,
      tokenHash: hashToken(pair.refresh),
      expiresAt: pair.expiresAt,
    },
  });
}
export async function currentUser(access?: string) {
  if (!access) return null;
  let claims;
  try {
    claims = await userTokens.verify(access, 'access');
  } catch {
    return null;
  }
  const active = await db.userSession.findFirst({
    where: {
      userId: claims.userId,
      id: claims.familyId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
  return active?.user ?? null;
}
export async function rotateSession(refresh?: string) {
  if (!refresh) throw invalidSession();
  let claims;
  try {
    claims = await userTokens.verify(refresh, 'refresh');
  } catch {
    throw invalidSession();
  }
  const result = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM UserSession WHERE id = ${claims.familyId} FOR UPDATE`;
    const session = await tx.userSession.findUnique({ where: { id: claims.familyId } });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) return null;
    const record = await tx.refreshToken.findUnique({
      where: { tokenHash: hashToken(refresh) },
      include: { user: true },
    });
    if (
      !record ||
      record.id !== claims.id ||
      record.userId !== claims.userId ||
      record.familyId !== claims.familyId ||
      record.expiresAt <= new Date()
    )
      return null;
    if (record.revokedAt) {
      // Commit family revocation before returning an error; throwing here would roll it back.
      await tx.userSession.update({
        where: { id: record.familyId },
        data: { revokedAt: new Date() },
      });
      await tx.refreshToken.updateMany({
        where: { familyId: record.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return null;
    }
    await tx.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    const pair = await userTokens.issue(record.userId, record.familyId, record.expiresAt);
    await storeRefresh(tx, pair);
    return { pair, user: record.user };
  });
  if (!result) throw invalidSession();
  return result;
}
export async function revokeSession(access?: string, refresh?: string) {
  const record = refresh
    ? await db.refreshToken.findUnique({ where: { tokenHash: hashToken(refresh) } })
    : null;
  let familyId = record?.familyId;
  if (!familyId && access) {
    try {
      familyId = (await userTokens.verify(access, 'access')).familyId;
    } catch {
      /* Expired cookies are still cleared by the resolver. */
    }
  }
  if (familyId)
    await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM UserSession WHERE id = ${familyId} FOR UPDATE`;
      await tx.userSession.updateMany({ where: { id: familyId }, data: { revokedAt: new Date() } });
      await tx.refreshToken.updateMany({
        where: { familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });
}
