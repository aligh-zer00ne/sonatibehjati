import { createHash, randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { accountEntryInputSchema } from '@behjati/shared/admin';
import { db } from '../../database/client.js';
import { authError } from '../auth/errors.js';
import { validate, omitNulls } from './validation.js';

type Tx = Prisma.TransactionClient;
export async function accountBalance(tx: Tx, userId: string) {
  const [sales, entries] = await Promise.all([
    tx.order.aggregate({
      where: {
        userId,
        salesChannel: { in: ['INSTAGRAM', 'IN_PERSON'] },
        status: { not: 'CANCELED' },
      },
      _sum: { total: true },
    }),
    tx.customerAccountEntry.groupBy({
      by: ['direction'],
      where: { userId },
      _sum: { amount: true },
    }),
  ]);
  return (
    (sales._sum.total ?? 0) +
    entries.reduce((sum, e) => sum + (e.direction === 'PAYMENT' ? 1 : -1) * (e._sum.amount ?? 0), 0)
  );
}

export async function allocateCredits(tx: Tx, userId: string, targetOrderId?: string) {
  const credits = await tx.customerAccountEntry.findMany({
    where: { userId, direction: 'RECEIPT', remaining: { gt: 0 } },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
  const orders = await tx.order.findMany({
    where: {
      userId,
      salesChannel: { in: ['INSTAGRAM', 'IN_PERSON'] },
      status: { not: 'CANCELED' },
      ...(targetOrderId ? { id: targetOrderId } : {}),
      offlinePaidAmount: { lt: tx.order.fields.total },
    },
    orderBy: [{ createdAt: 'asc' }, { number: 'asc' }],
  });
  for (const order of orders) {
    let outstanding = order.total - order.offlinePaidAmount;
    for (const credit of credits) {
      const amount = Math.min(outstanding, credit.remaining);
      if (amount <= 0) continue;
      await tx.offlinePayment.create({
        data: {
          id: randomUUID(),
          orderId: order.id,
          accountEntryId: credit.id,
          amount,
          method: credit.method,
          adminId: credit.adminId,
          adminEmail: credit.adminEmail,
          createdAt: credit.createdAt,
        },
      });
      await tx.customerAccountEntry.update({
        where: { id: credit.id },
        data: { remaining: { decrement: amount } },
      });
      await tx.order.update({
        where: { id: order.id },
        data: {
          offlinePaidAmount: { increment: amount },
          updatedAt: new Date(Math.max(Date.now(), order.updatedAt.getTime() + 1)),
        },
      });
      outstanding -= amount;
      credit.remaining -= amount;
    }
  }
}

export async function postAccountEntry(
  tx: Tx,
  admin: { id: string; email: string },
  raw: unknown,
  targetOrderId?: string,
) {
  const input = validate(accountEntryInputSchema, omitNulls(raw as Record<string, unknown>));
  const fingerprint = createHash('sha256')
    .update(JSON.stringify({ ...input, adminId: admin.id, targetOrderId: targetOrderId ?? null }))
    .digest('hex');
  // Every posting and manual invoice takes this lock first; allocations serialize per customer.
  await tx.$queryRaw`SELECT id FROM User WHERE id=${input.customerId} FOR UPDATE`;
  const user = await tx.user.findUnique({ where: { id: input.customerId } });
  if (!user) throw authError('مشتری یافت نشد.', 'NOT_FOUND');
  const existing = await tx.customerAccountEntry.findUnique({ where: { id: input.requestId } });
  if (existing) {
    if (existing.requestHash !== fingerprint)
      throw authError('این درخواست قبلاً با اطلاعات دیگری ثبت شده است.', 'REQUEST_CONFLICT');
    return existing;
  }
  if (input.direction === 'PAYMENT') {
    await allocateCredits(tx, user.id);
    const creditBalance = Math.max(0, -(await accountBalance(tx, user.id)));
    if (input.amount > creditBalance)
      throw authError('پرداخت به مشتری بیشتر از بستانکاری اوست.', 'BAD_USER_INPUT');
    let remainder = input.amount;
    const credits = await tx.customerAccountEntry.findMany({
      where: { userId: user.id, direction: 'RECEIPT', remaining: { gt: 0 } },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    for (const entry of credits) {
      const used = Math.min(remainder, entry.remaining);
      if (used)
        await tx.customerAccountEntry.update({
          where: { id: entry.id },
          data: { remaining: { decrement: used } },
        });
      remainder -= used;
    }
    if (remainder)
      throw authError('ماندهٔ قابل پرداخت همگام نیست؛ دوباره بررسی کنید.', 'REQUEST_CONFLICT');
  }
  const entry = await tx.customerAccountEntry.create({
    data: {
      id: input.requestId,
      userId: user.id,
      direction: input.direction,
      amount: input.amount,
      remaining: input.direction === 'RECEIPT' ? input.amount : 0,
      method: input.method,
      note: input.note,
      chequeNumber: input.method === 'CHECK' ? input.chequeNumber : null,
      chequeBank: input.method === 'CHECK' ? input.chequeBank : null,
      chequeDueDate:
        input.method === 'CHECK' && input.chequeDueDate
          ? new Date(input.chequeDueDate + 'T00:00:00Z')
          : null,
      adminId: admin.id,
      adminEmail: admin.email,
      requestHash: fingerprint,
    },
  });
  if (input.direction === 'RECEIPT') await allocateCredits(tx, user.id, targetOrderId);
  return entry;
}

export async function customerAccount(userId: string, page = 1, invoicePage = 1) {
  if (
    !userId ||
    userId.length > 100 ||
    !Number.isInteger(page) ||
    page < 1 ||
    page > 1000000 ||
    !Number.isInteger(invoicePage) ||
    invoicePage < 1 ||
    invoicePage > 1000000
  )
    throw authError('اطلاعات حساب معتبر نیست.', 'BAD_USER_INPUT');
  return db.$transaction(
    async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, phone: true, firstName: true, lastName: true },
      });
      if (!user) throw authError('مشتری یافت نشد.', 'NOT_FOUND');
      const [balance, entries, total, invoices, invoiceTotal, sums, invoiced] = await Promise.all([
        accountBalance(tx, userId),
        tx.customerAccountEntry.findMany({
          where: { userId },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          skip: (page - 1) * 20,
          take: 20,
          include: {
            allocations: {
              where: { voided: false },
              include: { order: { select: { number: true } } },
            },
          },
        }),
        tx.customerAccountEntry.count({ where: { userId } }),
        tx.order.findMany({
          where: {
            userId,
            salesChannel: { in: ['INSTAGRAM', 'IN_PERSON'] },
            status: { not: 'CANCELED' },
          },
          select: { id: true, number: true, total: true, offlinePaidAmount: true, createdAt: true },
          orderBy: [{ createdAt: 'desc' }, { number: 'desc' }],
          skip: (invoicePage - 1) * 20,
          take: 20,
        }),
        tx.order.count({
          where: {
            userId,
            salesChannel: { in: ['INSTAGRAM', 'IN_PERSON'] },
            status: { not: 'CANCELED' },
          },
        }),
        tx.customerAccountEntry.groupBy({
          by: ['direction'],
          where: { userId },
          _sum: { amount: true },
        }),
        tx.order.aggregate({
          where: {
            userId,
            salesChannel: { in: ['INSTAGRAM', 'IN_PERSON'] },
            status: { not: 'CANCELED' },
          },
          _sum: { total: true },
        }),
      ]);
      return {
        user,
        balance,
        invoiceTotal,
        invoicePage,
        received: sums.find((e) => e.direction === 'RECEIPT')?._sum.amount ?? 0,
        paid: sums.find((e) => e.direction === 'PAYMENT')?._sum.amount ?? 0,
        invoiced: invoiced._sum.total ?? 0,
        entries: entries.map((e) => ({
          ...e,
          createdAt: e.createdAt.toISOString(),
          chequeDueDate: e.chequeDueDate?.toISOString().slice(0, 10) ?? null,
          allocations: e.allocations.map((a) => ({
            orderId: a.orderId,
            number: a.order.number,
            amount: a.amount,
          })),
        })),
        total,
        page,
        invoices: invoices.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() })),
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
}

export async function recordAccountEntry(admin: { id: string; email: string }, raw: unknown) {
  const input = validate(accountEntryInputSchema, omitNulls(raw as Record<string, unknown>));
  await db.$transaction((tx) => postAccountEntry(tx, admin, input), {
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    timeout: 15000,
  });
  return customerAccount(input.customerId);
}
