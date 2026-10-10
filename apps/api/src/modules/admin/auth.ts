import { randomBytes } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { adminLoginSchema, adminPasswordChangeSchema } from '@behjati/shared/admin';
import { env } from '../../config/env.js';
import { db } from '../../database/client.js';
import type { AuthContext } from '../../graphql/context.js';
import { RoleTokens, ADMIN_TOKEN_POLICY, hashToken } from '../auth/tokens.js';
import { readBearer, readCookie, serializeCookie } from '../auth/cookies.js';
import { consumeAuthLimit } from '../auth/rate-limit.js';
import { authError, invalidSession } from '../auth/errors.js';
import { hashAdminPassword, verifyAdminPassword } from './passwords.js';
export const ADMIN_REFRESH_COOKIE = 'behjati_admin_refresh';
export const adminTokens = new RoleTokens(
  env.ADMIN_ACCESS_TOKEN_SECRET ?? randomBytes(48).toString('hex'),
  env.ADMIN_REFRESH_TOKEN_SECRET ?? randomBytes(48).toString('hex'),
  () => new Date(),
  ADMIN_TOKEN_POLICY,
);
const dummyHash = hashAdminPassword(randomBytes(24).toString('hex'));
type Pair = Awaited<ReturnType<typeof adminTokens.issue>>;
export function requireAdminOrigin(context: AuthContext) {
  if (
    context.request.method !== 'POST' ||
    context.request.headers.get('origin') !== new URL(env.ADMIN_ORIGIN).origin
  )
    throw authError('درخواست مدیریت مجاز نیست.', 'FORBIDDEN');
}
export async function currentAdmin(context: AuthContext) {
  context.response.setHeader('Cache-Control', 'no-store');
  const token = readBearer(context.request.headers.get('authorization'));
  if (!token) return null;
  let claims;
  try {
    claims = await adminTokens.verify(token, 'access');
  } catch {
    return null;
  }
  const session = await db.adminSession.findFirst({
    where: {
      id: claims.familyId,
      adminId: claims.subjectId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { admin: true },
  });
  return session ? { id: session.admin.id, email: session.admin.email } : null;
}
export async function requireAdmin(context: AuthContext) {
  const admin = await currentAdmin(context);
  if (!admin) throw invalidSession();
  context.response.setHeader('Cache-Control', 'no-store');
  return admin;
}
async function storeRefresh(tx: Prisma.TransactionClient, pair: Pair) {
  await tx.adminRefreshToken.create({
    data: {
      id: pair.refreshId,
      adminId: pair.subjectId,
      familyId: pair.familyId,
      tokenHash: hashToken(pair.refresh),
      expiresAt: pair.expiresAt,
    },
  });
}
function cookie(context: AuthContext, pair?: Pair) {
  context.response.appendHeader(
    'Set-Cookie',
    serializeCookie(
      ADMIN_REFRESH_COOKIE,
      pair?.refresh ?? '',
      pair ? (pair.expiresAt.getTime() - Date.now()) / 1000 : 0,
      env.NODE_ENV === 'production',
    ),
  );
  context.response.setHeader('Cache-Control', 'no-store');
}
export async function loginAdmin(context: AuthContext, raw: unknown) {
  requireAdminOrigin(context);
  const parsed = adminLoginSchema.safeParse(raw);
  if (!parsed.success) throw authError('ایمیل و رمز ورود را بررسی کنید.', 'BAD_USER_INPUT');
  await consumeAuthLimit(`admin-login-ip:${context.ip}`, 20, 900);
  await consumeAuthLimit(`admin-login-email:${parsed.data.email}`, 5, 900);
  const admin = await db.admin.findUnique({ where: { email: parsed.data.email } });
  const valid = await verifyAdminPassword(
    parsed.data.password,
    admin?.passwordHash ?? (await dummyHash),
  );
  if (!admin || !valid) throw authError('ایمیل یا رمز ورود نادرست است.', 'INVALID_CREDENTIALS');
  const pair = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM Admin WHERE id = ${admin.id} FOR UPDATE`;
    const latest = await tx.admin.findUnique({ where: { id: admin.id } });
    if (latest?.passwordHash !== admin.passwordHash)
      throw authError('رمز ورود تغییر کرده است؛ دوباره وارد شوید.', 'INVALID_CREDENTIALS');
    const pair = await adminTokens.issue(admin.id);
    await tx.adminSession.create({
      data: { id: pair.familyId, adminId: admin.id, expiresAt: pair.expiresAt },
    });
    await storeRefresh(tx, pair);
    return pair;
  });
  cookie(context, pair);
  return {
    admin: { id: admin.id, email: admin.email },
    accessToken: pair.access,
    accessExpiresAt: pair.accessExpiresAt.toISOString(),
  };
}
export async function refreshAdmin(context: AuthContext) {
  requireAdminOrigin(context);
  await consumeAuthLimit(`admin-refresh-ip:${context.ip}`, 60, 900);
  const refresh = readCookie(context.request.headers.get('cookie'), ADMIN_REFRESH_COOKIE);
  let claims;
  try {
    if (!refresh) throw invalidSession();
    claims = await adminTokens.verify(refresh, 'refresh');
  } catch {
    cookie(context);
    throw invalidSession();
  }
  const result = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM AdminSession WHERE id = ${claims.familyId} FOR UPDATE`;
    const session = await tx.adminSession.findUnique({
      where: { id: claims.familyId },
      include: { admin: true },
    });
    if (
      !session ||
      session.adminId !== claims.subjectId ||
      session.revokedAt ||
      session.expiresAt <= new Date()
    )
      return null;
    const record = await tx.adminRefreshToken.findUnique({
      where: { tokenHash: hashToken(refresh!) },
    });
    if (
      !record ||
      record.id !== claims.id ||
      record.adminId !== claims.subjectId ||
      record.familyId !== claims.familyId ||
      record.expiresAt <= new Date()
    )
      return null;
    if (record.revokedAt) {
      await tx.adminSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
      await tx.adminRefreshToken.updateMany({
        where: { familyId: session.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return null;
    }
    await tx.adminRefreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });
    const pair = await adminTokens.issue(record.adminId, record.familyId, session.expiresAt);
    await storeRefresh(tx, pair);
    return { pair, admin: { id: session.admin.id, email: session.admin.email } };
  });
  if (!result) {
    cookie(context);
    throw invalidSession();
  }
  cookie(context, result.pair);
  return {
    admin: result.admin,
    accessToken: result.pair.access,
    accessExpiresAt: result.pair.accessExpiresAt.toISOString(),
  };
}
export async function logoutAdmin(context: AuthContext) {
  requireAdminOrigin(context);
  const refresh = readCookie(context.request.headers.get('cookie'), ADMIN_REFRESH_COOKIE);
  const record = refresh
    ? await db.adminRefreshToken.findUnique({ where: { tokenHash: hashToken(refresh) } })
    : null;
  let familyId = record?.familyId;
  if (!familyId)
    try {
      const access = readBearer(context.request.headers.get('authorization'));
      if (access) familyId = (await adminTokens.verify(access, 'access')).familyId;
    } catch {
      /* Clear expired session cookie. */
    }
  if (familyId)
    await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM AdminSession WHERE id = ${familyId} FOR UPDATE`;
      await tx.adminSession.updateMany({
        where: { id: familyId },
        data: { revokedAt: new Date() },
      });
      await tx.adminRefreshToken.updateMany({
        where: { familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });
  cookie(context);
  return true;
}

export async function changeAdminPassword(context: AuthContext, raw: unknown) {
  requireAdminOrigin(context);
  const identity = await requireAdmin(context);
  const parsed = adminPasswordChangeSchema.safeParse(raw);
  if (!parsed.success)
    throw authError('رمز جدید باید ۱۲ تا ۱۲۸ نویسه و متفاوت از رمز فعلی باشد.', 'BAD_USER_INPUT');
  await consumeAuthLimit(`admin-password:${identity.id}`, 5, 900);
  const admin = await db.admin.findUniqueOrThrow({ where: { id: identity.id } });
  if (!(await verifyAdminPassword(parsed.data.currentPassword, admin.passwordHash)))
    throw authError('رمز فعلی نادرست است.', 'INVALID_CREDENTIALS');
  const passwordHash = await hashAdminPassword(parsed.data.newPassword);
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM Admin WHERE id = ${admin.id} FOR UPDATE`;
    const changed = await tx.admin.updateMany({
      where: { id: admin.id, passwordHash: admin.passwordHash },
      data: { passwordHash },
    });
    if (!changed.count)
      throw authError('رمز قبلاً تغییر کرده است؛ دوباره وارد شوید.', 'REQUEST_CONFLICT');
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
  cookie(context);
  return true;
}
