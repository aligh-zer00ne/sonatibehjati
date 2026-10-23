import { createHash, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { Prisma, type PaymentRequest } from '@prisma/client';
import { z } from 'zod';
import { paymentRequestInputSchema } from '@behjati/shared/payment-requests';
import { db } from '../../database/client.js';
import { env } from '../../config/env.js';
import { authError } from '../auth/errors.js';
import { accountBalance } from '../admin/customer-accounts.js';
import {
  gatewayAvailable,
  paymentInfo,
  paymentMode,
  preparePayment,
  redirectPath,
  publicPayment,
} from './service.js';
import { validate, omitNulls } from '../admin/validation.js';

export const requestStatus = (r: PaymentRequest): 'ACTIVE' | 'PAID' | 'CANCELED' | 'EXPIRED' =>
  r.paidAt ? 'PAID' : r.canceledAt ? 'CANCELED' : r.expiresAt <= new Date() ? 'EXPIRED' : 'ACTIVE';
export const requestPath = (r: PaymentRequest) => `/pay/${r.id}/${r.key}`;
const include = {
  customer: { select: { firstName: true, lastName: true, phone: true } },
  payments: { orderBy: { createdAt: 'desc' as const }, take: 3 },
};
async function presented(id: string) {
  const r = await db.paymentRequest.findUniqueOrThrow({ where: { id }, include });
  return {
    ...r,
    scope: r.scope as 'CUSTOMER_BALANCE' | 'CUSTOM_AMOUNT',
    status: requestStatus(r),
    customerName: r.customer
      ? [r.customer.firstName, r.customer.lastName].filter(Boolean).join(' ') || r.customer.phone
      : null,
    url: env.STOREFRONT_ORIGIN + requestPath(r),
    createdAt: r.createdAt.toISOString(),
    expiresAt: r.expiresAt.toISOString(),
    paidAt: r.paidAt?.toISOString() ?? null,
    payments: r.payments.map(paymentInfo),
  };
}
export async function createPaymentRequest(admin: { id: string; email: string }, raw: unknown) {
  if (!gatewayAvailable()) throw authError('درگاه پرداخت در دسترس نیست.', 'PAYMENT_DISABLED');
  const input = validate(paymentRequestInputSchema, omitNulls(raw as Record<string, unknown>));
  const hash = createHash('sha256')
    .update(JSON.stringify({ ...input, adminId: admin.id }))
    .digest('hex');
  try {
    await db.$transaction(
      async (tx) => {
        if (input.customerId)
          await tx.$queryRaw`SELECT id FROM User WHERE id=${input.customerId} FOR UPDATE`;
        const existing = await tx.paymentRequest.findUnique({ where: { id: input.requestId } });
        if (existing) {
          if (existing.mode !== paymentMode || existing.requestHash !== hash)
            throw authError('این درخواست با اطلاعات دیگری ثبت شده است.', 'REQUEST_CONFLICT');
          return;
        }
        if (input.scope === 'CUSTOMER_BALANCE') {
          if (!(await tx.user.findUnique({ where: { id: input.customerId! } })))
            throw authError('مشتری یافت نشد.', 'NOT_FOUND');
          const balance = await accountBalance(tx, input.customerId!);
          if (balance <= 0) throw authError('این مشتری مانده بدهکار ندارد.', 'BAD_USER_INPUT');
          if (balance !== input.amount)
            throw authError('مانده مشتری تغییر کرده است؛ حساب را به‌روز کنید.', 'PRICE_CHANGED');
        }
        await tx.paymentRequest.create({
          data: {
            id: input.requestId,
            mode: paymentMode,
            key: randomBytes(32).toString('hex'),
            requestHash: hash,
            scope: input.scope,
            customerId: input.customerId ?? null,
            title: input.title,
            amount: input.amount,
            payerName: input.payerName || null,
            payerPhone: input.payerPhone || null,
            createdByAdminId: admin.id,
            createdByEmail: admin.email,
            expiresAt: new Date(Date.now() + input.expiresInHours * 3600000),
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 15000 },
    );
  } catch (error) {
    // A generic request has no customer row to lock. A concurrent replay can race its UUID insert.
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002')
      throw error;
    const existing = await db.paymentRequest.findUnique({ where: { id: input.requestId } });
    if (!existing || existing.mode !== paymentMode || existing.requestHash !== hash)
      throw authError('این درخواست با اطلاعات دیگری ثبت شده است.', 'REQUEST_CONFLICT');
  }
  return presented(input.requestId);
}
const listing = z
  .object({
    customerId: z.string().min(1).max(100).optional(),
    scope: z.enum(['CUSTOMER_BALANCE', 'CUSTOM_AMOUNT']).optional(),
    status: z.enum(['ACTIVE', 'PAID', 'EXPIRED', 'CANCELED']).optional(),
    page: z.number().int().min(1).max(1000000).default(1),
  })
  .strict();
export async function paymentRequests(raw: unknown) {
  const input = validate(listing, omitNulls(raw as Record<string, unknown>));
  const where: Prisma.PaymentRequestWhereInput = {
    mode: paymentMode,
    ...(input.customerId ? { customerId: input.customerId } : {}),
    ...(input.scope ? { scope: input.scope } : {}),
  };
  if (input.status === 'PAID') where.paidAt = { not: null };
  else if (input.status === 'CANCELED') {
    where.canceledAt = { not: null };
    where.paidAt = null;
  } else if (input.status) {
    where.paidAt = null;
    where.canceledAt = null;
    where.expiresAt = input.status === 'ACTIVE' ? { gt: new Date() } : { lte: new Date() };
  }
  const [rows, total] = await db.$transaction([
    db.paymentRequest.findMany({
      where,
      select: { id: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (input.page - 1) * 20,
      take: 20,
    }),
    db.paymentRequest.count({ where }),
  ]);
  return {
    items: await Promise.all(rows.map((r) => presented(r.id))),
    total,
    page: input.page,
    gatewayAvailable: gatewayAvailable(),
  };
}
export async function cancelPaymentRequest(id: string) {
  if (!z.string().uuid().safeParse(id).success)
    throw authError('شناسه معتبر نیست.', 'BAD_USER_INPUT');
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM PaymentRequest WHERE id=${id} FOR UPDATE`;
    const request = await tx.paymentRequest.findUnique({ where: { id } });
    if (!request || request.mode !== paymentMode) throw authError('لینک یافت نشد.', 'NOT_FOUND');
    if (request.paidAt) throw authError('پرداخت تأییدشده قابل لغو نیست.', 'BAD_USER_INPUT');
    const active = await tx.payment.count({
      where: {
        paymentRequestId: id,
        status: {
          in: [
            'CREATING',
            'READY',
            'VERIFY_PENDING',
            'VERIFYING',
            'REFUND_PENDING',
            'REFUNDING',
            'REVIEW_REQUIRED',
          ],
        },
      },
    });
    if (active) throw authError('تراکنش قبلی هنوز تعیین تکلیف نشده است.', 'PAYMENT_PENDING');
    await tx.paymentRequest.update({
      where: { id },
      data: { canceledAt: request.canceledAt ?? new Date() },
    });
  });
  return presented(id);
}
export async function findRequest(id: string, key: string) {
  if (!z.string().uuid().safeParse(id).success || !/[a-f0-9]{64}/.test(key) || key.length !== 64)
    throw authError('لینک پرداخت یافت نشد.', 'NOT_FOUND');
  const r = await db.paymentRequest.findUnique({ where: { id } });
  if (!r || r.mode !== paymentMode || !timingSafeEqual(Buffer.from(r.key), Buffer.from(key)))
    throw authError('لینک پرداخت یافت نشد.', 'NOT_FOUND');
  return r;
}
export async function publicRequest(id: string, key: string) {
  let request = await findRequest(id, key);
  const latest = await db.payment.findFirst({
    where: {
      paymentRequestId: id,
      mode: paymentMode,
      ...(request.acceptedPaymentId ? { id: request.acceptedPaymentId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  // A verification may commit between these reads. Never offer another payment after success.
  if (!request.paidAt && latest?.status === 'SUCCEEDED' && latest.acceptedAt)
    request = { ...request, paidAt: latest.acceptedAt };
  return {
    id,
    title: request.title,
    amount: request.amount,
    status: requestStatus(request),
    expiresAt: request.expiresAt.toISOString(),
    paidAt: request.paidAt?.toISOString() ?? null,
    gatewayAvailable: gatewayAvailable(),
    payment: latest ? await publicPayment(latest.id, latest.callbackKey) : null,
  };
}
export async function startRequestPayment(id: string, key: string) {
  if (!gatewayAvailable()) throw authError('درگاه پرداخت در دسترس نیست.', 'PAYMENT_DISABLED');
  const found = await findRequest(id, key);
  const reserved = await db.$transaction(
    async (tx) => {
      if (found.customerId)
        await tx.$queryRaw`SELECT id FROM User WHERE id=${found.customerId} FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM PaymentRequest WHERE id=${id} FOR UPDATE`;
      const request = await tx.paymentRequest.findUniqueOrThrow({ where: { id } });
      if (requestStatus(request) !== 'ACTIVE')
        throw authError('این لینک پرداخت فعال نیست.', 'BAD_USER_INPUT');
      const old = await tx.payment.findFirst({
        where: {
          paymentRequestId: id,
          mode: paymentMode,
          status: { notIn: ['TOKEN_FAILED', 'CANCELED', 'FAILED', 'EXPIRED', 'REVERSED'] },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (old) {
        if (old.status === 'READY' && old.expiresAt > new Date())
          return { payment: old, create: false, phone: '' };
        if (
          (old.status === 'READY' && old.expiresAt <= new Date()) ||
          (old.status === 'CREATING' && (!old.leaseUntil || old.leaseUntil <= new Date()))
        )
          await tx.payment.update({
            where: { id: old.id },
            data: { status: 'EXPIRED', leaseUntil: null, reason: 'EXPIRED' },
          });
        else
          throw authError('پرداخت قبلی در حال بررسی است؛ دوباره پرداخت نکنید.', 'PAYMENT_PENDING');
      }
      if (
        (await tx.payment.count({
          where: { paymentRequestId: id, createdAt: { gte: new Date(Date.now() - 3600000) } },
        })) >= 10
      )
        throw authError('تلاش‌های زیادی ثبت شده؛ کمی بعد دوباره امتحان کنید.', 'RATE_LIMITED');
      const customer = request.customerId
        ? await tx.user.findUniqueOrThrow({
            where: { id: request.customerId },
            select: { phone: true },
          })
        : null;
      const payment = await tx.payment.create({
        data: {
          id: randomUUID(),
          mode: paymentMode,
          paymentRequestId: id,
          amountRials: BigInt(request.amount) * 10n,
          terminalId: env.SEP_TERMINAL_ID!,
          callbackKey: randomBytes(32).toString('hex'),
          sessionKey: randomInt(1, 2147483647),
          expiresAt: new Date(Date.now() + 20 * 60000),
          leaseUntil: new Date(Date.now() + 30000),
        },
      });
      return { payment, create: true, phone: customer?.phone ?? request.payerPhone ?? '' };
    },
    { timeout: 15000, isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
  );
  return reserved.create
    ? preparePayment(reserved.payment, reserved.phone)
    : { redirectUrl: redirectPath(reserved.payment) };
}
