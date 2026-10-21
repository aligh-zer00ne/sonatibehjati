import { randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { Prisma, type Payment } from '@prisma/client';
import { db } from '../../database/client.js';
import { env } from '../../config/env.js';
import { authError } from '../auth/errors.js';
import { SepGateway, TokenRejected } from './sep.js';

export const sepGateway = new SepGateway(env.SEP_TEST_BASE_URL ?? 'https://sep.shaparak.ir');
export const paymentMode = env.NODE_ENV === 'test' ? 'TEST' : 'LIVE';
const retryDelay = (p: Payment) =>
  Date.now() - p.createdAt.getTime() > 30 * 60000
    ? 300000
    : Date.now() - p.createdAt.getTime() > 5 * 60000
      ? 120000
      : 30000;
const terminalStates = ['SUCCEEDED', 'REVERSED', 'REVIEW_REQUIRED', 'REFUND_PENDING', 'REFUNDING'];
const terminalFailure = ['TOKEN_FAILED', 'CANCELED', 'FAILED', 'EXPIRED'];
export const gatewayAvailable = () => env.PAYMENT_PROVIDER === 'sep';
export const paymentAvailable = () => gatewayAvailable() && env.CUSTOMER_AUTH_ENABLED === 'true';
export const paymentInfo = (p: Payment) => ({
  id: p.id,
  status: p.status,
  amount: Number(p.amountRials / 10n),
  reference: p.refNum,
  traceNumber: p.traceNumber,
  rrn: p.rrn,
  reason: p.reason,
  bankCode: p.resultCode,
  createdAt: p.createdAt.toISOString(),
  verifiedAt: p.verifiedAt?.toISOString() ?? null,
  reversedAt: p.reversedAt?.toISOString() ?? null,
});
export const orderPayments = async (id: string) =>
  (await db.payment.findMany({ where: { orderId: id }, orderBy: { createdAt: 'desc' } })).map(
    paymentInfo,
  );
const origin = () => env.SEP_CALLBACK_ORIGIN ?? env.STOREFRONT_ORIGIN;
const callbackUrl = (p: Payment) => `${origin()}/payment/sep/callback/${p.id}/${p.callbackKey}`;
export const redirectPath = (p: Payment) => `/payment/sep/redirect/${p.id}/${p.callbackKey}`;
export const resultPath = (p: Payment) => `/payment/sep/result/${p.id}/${p.callbackKey}`;
export async function findPayment(id: string, key: string) {
  if (!/^[a-f0-9-]{36}$/.test(id) || !/^[a-f0-9]{64}$/.test(key))
    throw authError('پرداخت یافت نشد.', 'NOT_FOUND');
  const p = await db.payment.findUnique({
    where: { id },
    include: { order: { select: { id: true, number: true, paidAt: true, status: true } } },
  });
  if (
    !p ||
    (!p.orderId && !p.gatewayTestAdminId) ||
    p.mode !== paymentMode ||
    !timingSafeEqual(Buffer.from(key), Buffer.from(p.callbackKey))
  )
    throw authError('پرداخت یافت نشد.', 'NOT_FOUND');
  return p;
}
async function lockPayment<T>(
  id: string,
  action: (tx: Prisma.TransactionClient, p: Payment) => Promise<T>,
) {
  const row = await db.payment.findUniqueOrThrow({ where: { id }, select: { orderId: true } });
  return db.$transaction(
    async (tx) => {
      if (row.orderId)
        await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id = ${row.orderId} FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM Payment WHERE id = ${id} FOR UPDATE`;
      return action(tx, await tx.payment.findUniqueOrThrow({ where: { id } }));
    },
    { timeout: 10000, isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
  );
}
export async function startOrderPayment(userId: string, orderId: string) {
  if (!paymentAvailable()) throw authError('پرداخت آنلاین هنوز فعال نشده است.', 'PAYMENT_DISABLED');
  if (!orderId || orderId.length > 100)
    throw authError('شناسه سفارش معتبر نیست.', 'BAD_USER_INPUT');
  const reserved = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id = ${orderId} FOR UPDATE`;
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: { user: { select: { phone: true } } },
    });
    if (!order) throw authError('سفارش یافت نشد.', 'NOT_FOUND');
    if (order.salesChannel !== 'WEBSITE')
      throw authError('پرداخت این سفارش در فروشگاه ثبت می‌شود.', 'ORDER_NOT_PAYABLE');
    if (order.paidAt) throw authError('این سفارش قبلاً پرداخت شده است.', 'ALREADY_PAID');
    if (!['CREATED', 'PENDING_PAYMENT'].includes(order.status))
      throw authError('این سفارش قابل پرداخت نیست.', 'ORDER_NOT_PAYABLE');
    if (order.total <= 0) throw authError('مبلغ سفارش معتبر نیست.', 'BAD_USER_INPUT');
    const previous = await tx.payment.findFirst({
      where: {
        orderId,
        mode: paymentMode,
        status: { notIn: ['TOKEN_FAILED', 'CANCELED', 'FAILED', 'EXPIRED', 'REVERSED'] },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (previous) {
      if (previous.status === 'READY' && previous.expiresAt > new Date())
        return { payment: previous, phone: order.user.phone, create: false };
      if (
        ['READY', 'CREATING'].includes(previous.status) &&
        (previous.status === 'READY'
          ? previous.expiresAt <= new Date()
          : !previous.leaseUntil || previous.leaseUntil <= new Date())
      ) {
        await tx.payment.update({
          where: { id: previous.id },
          data: { status: 'EXPIRED', leaseUntil: null, reason: 'EXPIRED' },
        });
      } else
        throw authError(
          'پرداخت قبلی در حال بررسی است؛ نتیجه را پیگیری کنید و دوباره پرداخت نکنید.',
          'PAYMENT_PENDING',
        );
    }
    const payment = await tx.payment.create({
      data: {
        id: randomUUID(),
        mode: paymentMode,
        orderId,
        amountRials: BigInt(order.total) * 10n,
        terminalId: env.SEP_TERMINAL_ID!,
        callbackKey: randomBytes(32).toString('hex'),
        sessionKey: randomInt(1, 2147483647),
        expiresAt: new Date(Date.now() + 20 * 60000),
        leaseUntil: new Date(Date.now() + 30000),
      },
    });
    return { payment, phone: order.user.phone, create: true };
  });
  if (!reserved.create) return { redirectUrl: redirectPath(reserved.payment) };
  return preparePayment(reserved.payment, reserved.phone);
}
export async function preparePayment(p: Payment, phone: string) {
  try {
    const token = await sepGateway.token({
      terminal: p.terminalId,
      amount: p.amountRials,
      id: p.id,
      callback: callbackUrl(p),
      phone,
      sessionKey: p.sessionKey,
    });
    const updated = await db.payment.updateMany({
      where: { id: p.id, status: 'CREATING', leaseUntil: p.leaseUntil },
      data: { token, status: 'READY', leaseUntil: null },
    });
    if (!updated.count) throw new Error('Creation lease lost');
    return { redirectUrl: redirectPath(p) };
  } catch (e) {
    await db.payment.updateMany({
      where: { id: p.id, status: 'CREATING', leaseUntil: p.leaseUntil },
      data: {
        status: 'TOKEN_FAILED',
        leaseUntil: null,
        reason: e instanceof TokenRejected ? 'TOKEN_REJECTED' : 'BANK_UNAVAILABLE',
        resultCode: e instanceof TokenRejected ? e.bankCode : null,
      },
    });
    throw authError(
      'اتصال به درگاه انجام نشد؛ سفارشتان محفوظ است. دوباره تلاش کنید.',
      'PAYMENT_UNAVAILABLE',
    );
  }
}
export async function callback(id: string, key: string, fields: Record<string, string>) {
  const found = await findPayment(id, key);
  if (
    fields.resnum !== id ||
    (fields.terminalid && fields.terminalid !== found.terminalId) ||
    (fields.mid && !fields.terminalid && fields.mid !== found.terminalId) ||
    (fields.token && fields.token !== found.token)
  )
    throw authError('اطلاعات بازگشت درگاه معتبر نیست.', 'BAD_USER_INPUT');
  const ref = fields.refnum;
  const ok = fields.state?.toUpperCase() === 'OK';
  if (ok && (!ref || !/^[A-Za-z0-9+/=_-]{1,100}$/.test(ref)))
    throw authError('رسید درگاه معتبر نیست.', 'BAD_USER_INPUT');
  await lockPayment(id, async (tx, p) => {
    if (terminalStates.includes(p.status) || ['VERIFYING', 'VERIFY_PENDING'].includes(p.status)) {
      if (ok && p.refNum && ref !== p.refNum)
        throw authError('رسید این پرداخت متفاوت است.', 'BAD_USER_INPUT');
      return;
    }
    if (ok) {
      await tx.payment.update({
        where: { id },
        data: {
          refNum: ref,
          status: 'VERIFY_PENDING',
          retryAt: new Date(),
          reason: null,
          leaseUntil: null,
        },
      });
    } else if (['READY', 'CREATING', 'EXPIRED'].includes(p.status)) {
      const canceled =
        ['CANCELEDBYUSER', 'CANCELLEDBYUSER', 'CANCELED', 'CANCELLED'].includes(
          fields.state?.toUpperCase() ?? '',
        ) || fields.status === '1';
      await tx.payment.update({
        where: { id },
        data: {
          status: canceled ? 'CANCELED' : 'FAILED',
          reason: canceled ? 'CUSTOMER_CANCELED' : 'BANK_DECLINED',
          leaseUntil: null,
        },
      });
    }
  });
  if (ok) await verifyPayment(id);
  return resultPath(found);
}
export async function verifyPayment(id: string) {
  const lease = new Date(Date.now() + 60000);
  const claimed = await db.payment.updateMany({
    where: {
      id,
      mode: paymentMode,
      refNum: { not: null },
      status: { in: ['VERIFY_PENDING', 'VERIFYING'] },
      OR: [{ leaseUntil: null }, { leaseUntil: { lte: new Date() } }],
    },
    data: { status: 'VERIFYING', leaseUntil: lease },
  });
  if (!claimed.count) return db.payment.findUniqueOrThrow({ where: { id } });
  const p = await db.payment.findUniqueOrThrow({ where: { id } });
  let bankCode: number | null = null;
  try {
    const verified = await sepGateway.verify(p.terminalId, p.refNum!, p.sessionKey);
    bankCode = verified.code;
    if ([0, 2].includes(verified.code)) {
      const detail = verified.detail;
      if ((verified.code === 0 && !verified.success) || !detail)
        throw new Error('Incomplete verification');
      if (detail.refNum !== p.refNum || detail.terminal !== p.terminalId) {
        await db.payment.updateMany({
          where: { id, status: 'VERIFYING', leaseUntil: lease },
          data: {
            status: 'REVIEW_REQUIRED',
            reason: 'BANK_DETAILS_MISMATCH',
            leaseUntil: null,
            resultCode: verified.code,
          },
        });
      } else {
        await lockPayment(id, async (tx, current) => {
          if (current.status !== 'VERIFYING' || current.leaseUntil?.getTime() !== lease.getTime())
            return;
          // Claim references only after bank verification, so forged callbacks cannot reserve someone else's receipt.
          const reference = await tx.paymentReference.findUnique({
            where: { refNum: detail.refNum },
          });
          if (reference && reference.paymentId !== id) {
            await tx.payment.update({
              where: { id },
              data: {
                status: 'REVIEW_REQUIRED',
                reason: 'REFERENCE_REUSED',
                leaseUntil: null,
                resultCode: verified.code,
              },
            });
            return;
          }
          if (!reference)
            await tx.paymentReference.create({
              data: { refNum: detail.refNum, paymentId: id, amountRials: detail.amount },
            });
          const order = p.orderId
            ? await tx.order.findUniqueOrThrow({ where: { id: p.orderId } })
            : null;
          const reason =
            detail.amount !== p.amountRials
              ? 'AMOUNT_MISMATCH'
              : !order
                ? 'ADMIN_GATEWAY_TEST'
                : order.paidAt
                  ? 'DUPLICATE_PAYMENT'
                  : !['CREATED', 'PENDING_PAYMENT'].includes(order.status)
                    ? 'ORDER_NOT_PAYABLE'
                    : null;
          await tx.payment.update({
            where: { id },
            data: {
              verifiedAt: new Date(),
              resultCode: verified.code,
              rrn: detail.rrn,
              traceNumber: detail.trace,
              status: reason ? 'REFUND_PENDING' : 'SUCCEEDED',
              reason,
              acceptedAt: reason ? null : new Date(),
              retryAt: reason ? new Date() : null,
              leaseUntil: null,
            },
          });
          if (!reason && order)
            await tx.order.update({
              where: { id: order.id },
              data: { paidAt: new Date(), status: 'PROCESSING' },
            });
        });
      }
    } else if ([-2, -6, 5].includes(verified.code)) {
      await db.payment.updateMany({
        where: { id, status: 'VERIFYING', leaseUntil: lease },
        data: {
          status: verified.code === 5 ? 'REVERSED' : 'FAILED',
          reason: verified.code === 5 ? 'BANK_REVERSED' : 'BANK_NOT_CONFIRMED',
          resultCode: verified.code,
          reversedAt: verified.code === 5 ? new Date() : null,
          leaseUntil: null,
          retryAt: null,
        },
      });
    } else throw new Error('Bank result requires retry');
  } catch {
    await db.payment.updateMany({
      where: { id, status: 'VERIFYING', leaseUntil: lease },
      data: {
        status:
          Date.now() - p.createdAt.getTime() > 60 * 60000 ? 'REVIEW_REQUIRED' : 'VERIFY_PENDING',
        reason:
          Date.now() - p.createdAt.getTime() > 60 * 60000
            ? 'VERIFICATION_UNRESOLVED'
            : 'BANK_UNAVAILABLE',
        resultCode: bankCode ?? p.resultCode,
        leaseUntil: null,
        retryAt: new Date(Date.now() + retryDelay(p)),
      },
    });
  }
  const next = await db.payment.findUniqueOrThrow({ where: { id } });
  if (next.status === 'REFUND_PENDING') return reversePayment(id);
  return next;
}
export async function reversePayment(id: string) {
  const lease = new Date(Date.now() + 60000);
  const claimed = await db.payment.updateMany({
    where: {
      id,
      mode: paymentMode,
      status: { in: ['REFUND_PENDING', 'REFUNDING'] },
      OR: [{ leaseUntil: null }, { leaseUntil: { lte: new Date() } }],
    },
    data: { status: 'REFUNDING', leaseUntil: lease },
  });
  if (!claimed.count) return db.payment.findUniqueOrThrow({ where: { id } });
  const p = await db.payment.findUniqueOrThrow({ where: { id } });
  try {
    const reference = await db.paymentReference.findUnique({ where: { refNum: p.refNum! } });
    if (
      reference?.paymentId !== id ||
      !(await sepGateway.reverse(p.terminalId, p.refNum!, p.sessionKey))
    )
      throw new Error('Reverse unconfirmed');
    await db.payment.updateMany({
      where: { id, status: 'REFUNDING', leaseUntil: lease },
      data: { status: 'REVERSED', reversedAt: new Date(), retryAt: null, leaseUntil: null },
    });
  } catch {
    await db.payment.updateMany({
      where: { id, status: 'REFUNDING', leaseUntil: lease },
      data: {
        status:
          p.verifiedAt && Date.now() - p.verifiedAt.getTime() > 50 * 60000
            ? 'REVIEW_REQUIRED'
            : 'REFUND_PENDING',
        reason:
          p.verifiedAt && Date.now() - p.verifiedAt.getTime() > 50 * 60000
            ? 'REFUND_UNCONFIRMED'
            : p.reason,
        leaseUntil: null,
        retryAt: new Date(Date.now() + retryDelay(p)),
      },
    });
  }
  return db.payment.findUniqueOrThrow({ where: { id } });
}
export async function reconcilePayments() {
  if (!gatewayAvailable()) return;
  await db.payment.updateMany({
    where: { mode: paymentMode, status: 'READY', expiresAt: { lt: new Date() } },
    data: { status: 'EXPIRED', reason: 'EXPIRED' },
  });
  await db.payment.updateMany({
    where: { mode: paymentMode, status: 'CREATING', leaseUntil: { lt: new Date() } },
    data: { status: 'TOKEN_FAILED', leaseUntil: null, reason: 'BANK_UNAVAILABLE' },
  });
  const rows = await db.payment.findMany({
    where: {
      mode: paymentMode,
      status: { in: ['VERIFY_PENDING', 'VERIFYING', 'REFUND_PENDING', 'REFUNDING'] },
      AND: [
        { OR: [{ retryAt: null }, { retryAt: { lte: new Date() } }] },
        { OR: [{ leaseUntil: null }, { leaseUntil: { lte: new Date() } }] },
      ],
    },
    orderBy: { updatedAt: 'asc' },
    take: 20,
  });
  for (const p of rows) {
    if (['REFUND_PENDING', 'REFUNDING'].includes(p.status)) await reversePayment(p.id);
    else await verifyPayment(p.id);
  }
}
export async function retryPayment(id: string) {
  const p = await db.payment.findUnique({ where: { id } });
  if (!p || p.mode !== paymentMode) throw authError('پرداخت یافت نشد.', 'NOT_FOUND');
  if (
    p.status === 'REVIEW_REQUIRED' &&
    ['VERIFICATION_UNRESOLVED', 'REFUND_UNCONFIRMED', 'BANK_DETAILS_MISMATCH'].includes(
      p.reason ?? '',
    )
  ) {
    await db.payment.updateMany({
      where: { id, status: 'REVIEW_REQUIRED' },
      data: {
        status: p.reason === 'REFUND_UNCONFIRMED' ? 'REFUND_PENDING' : 'VERIFY_PENDING',
        leaseUntil: null,
        retryAt: new Date(),
      },
    });
    return retryPayment(id);
  }
  if (['REFUND_PENDING', 'REFUNDING'].includes(p.status))
    return paymentInfo(await reversePayment(id));
  if (['VERIFY_PENDING', 'VERIFYING'].includes(p.status))
    return paymentInfo(await verifyPayment(id));
  return paymentInfo(p);
}
export async function publicPayment(id: string, key: string) {
  let p = await findPayment(id, key);
  if (p.status === 'READY' && p.expiresAt <= new Date()) {
    await db.payment.updateMany({
      where: { id, status: 'READY' },
      data: { status: 'EXPIRED', reason: 'EXPIRED' },
    });
    p = await findPayment(id, key);
  }
  return {
    ...paymentInfo(p),
    orderId: p.orderId,
    orderNumber: p.order?.number ?? null,
    gatewayTest: !p.orderId,
    adminTestUrl: !p.orderId ? `${env.ADMIN_ORIGIN}/admin/payment-test` : null,
    paidAt: p.order?.paidAt?.toISOString() ?? null,
    redirectUrl: p.status === 'READY' ? redirectPath(p) : null,
    canRetry:
      !!p.order &&
      !p.order.paidAt &&
      ['CREATED', 'PENDING_PAYMENT'].includes(p.order.status) &&
      terminalFailure.includes(p.status),
  };
}
