import { randomBytes, randomInt, randomUUID } from 'node:crypto';
import { db } from '../../database/client.js';
import { env } from '../../config/env.js';
import { authError } from '../auth/errors.js';
import {
  gatewayAvailable,
  paymentMode,
  paymentInfo,
  preparePayment,
  redirectPath,
  resultPath,
} from './service.js';

export const GATEWAY_TEST_AMOUNT = 10000;
const finished = [
  'TOKEN_FAILED',
  'CANCELED',
  'FAILED',
  'EXPIRED',
  'REVERSED',
  'SUCCEEDED',
] as const;
const enabled = () => gatewayAvailable() && env.ADMIN_PAYMENT_TEST_ENABLED === 'true';
export async function adminGatewayTest(adminId: string) {
  await db.payment.updateMany({
    where: {
      gatewayTestAdminId: adminId,
      mode: paymentMode,
      status: 'READY',
      expiresAt: { lte: new Date() },
    },
    data: { status: 'EXPIRED', reason: 'EXPIRED' },
  });
  const rows = await db.payment.findMany({
    where: { gatewayTestAdminId: adminId, mode: paymentMode, orderId: null },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return {
    enabled: enabled(),
    amount: GATEWAY_TEST_AMOUNT,
    terminalId: env.SEP_TERMINAL_ID ?? null,
    payments: rows.map((p) => ({
      payment: paymentInfo(p),
      resultUrl: new URL(resultPath(p), env.STOREFRONT_ORIGIN).href,
      redirectUrl:
        enabled() && p.status === 'READY' && p.expiresAt > new Date()
          ? new URL(redirectPath(p), env.STOREFRONT_ORIGIN).href
          : null,
    })),
  };
}
export async function startAdminGatewayTest(adminId: string) {
  if (!enabled()) throw authError('تست درگاه مدیریت فعال نشده است.', 'PAYMENT_DISABLED');
  const p = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM Admin WHERE id = ${adminId} FOR UPDATE`;
    const owner = await tx.admin.findFirst({
      where: { id: adminId, role: 'OWNER', isActive: true },
    });
    if (!owner) throw authError('این عملیات به مدیر اصلی محدود است.', 'FORBIDDEN');
    const active = await tx.payment.findFirst({
      where: { gatewayTestAdminId: adminId, mode: paymentMode, status: { notIn: [...finished] } },
      orderBy: { createdAt: 'desc' },
    });
    if (active) {
      if (active.status === 'READY' && active.expiresAt > new Date())
        return { payment: active, create: false };
      if (
        (active.status === 'READY' && active.expiresAt <= new Date()) ||
        (active.status === 'CREATING' && active.leaseUntil && active.leaseUntil <= new Date())
      )
        await tx.payment.update({
          where: { id: active.id },
          data: { status: 'EXPIRED', leaseUntil: null, reason: 'EXPIRED' },
        });
      else
        throw authError(
          'تست قبلی در حال بررسی است؛ تا روشن شدن نتیجه دوباره پرداخت نکنید.',
          'PAYMENT_PENDING',
        );
    }
    const payment = await tx.payment.create({
      data: {
        id: randomUUID(),
        mode: paymentMode,
        gatewayTestAdminId: adminId,
        amountRials: BigInt(GATEWAY_TEST_AMOUNT) * 10n,
        terminalId: env.SEP_TERMINAL_ID!,
        callbackKey: randomBytes(32).toString('hex'),
        sessionKey: randomInt(1, 2147483647),
        expiresAt: new Date(Date.now() + 20 * 60000),
        leaseUntil: new Date(Date.now() + 30000),
      },
    });
    return { payment, create: true };
  });
  const result = p.create
    ? await preparePayment(p.payment, '')
    : { redirectUrl: redirectPath(p.payment) };
  return { redirectUrl: new URL(result.redirectUrl, env.STOREFRONT_ORIGIN).href };
}
