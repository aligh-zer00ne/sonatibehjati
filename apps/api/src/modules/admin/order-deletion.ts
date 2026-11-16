import { createHash, randomUUID } from 'node:crypto';
import { Prisma, type PaymentStatus } from '@prisma/client';
import { db } from '../../database/client.js';
import { authError } from '../auth/errors.js';
import { allocateCredits } from './customer-accounts.js';

type Tx = Prisma.TransactionClient;
/** Bank operations that may still change the order; deleting under them would lose the result. */
const unsettledPayments: PaymentStatus[] = [
  'CREATING',
  'READY',
  'VERIFYING',
  'VERIFY_PENDING',
  'REFUND_PENDING',
  'REFUNDING',
  'REVIEW_REQUIRED',
];
export const canceledOrderRetentionDays = 30;
type Actor = { id: string; email: string };
const system: Actor = { id: 'system', email: 'retention@system' };

/**
 * Permanently removes an order. Settled bank transactions are detached (not erased) so their
 * references still block replay; customer credit allocated to the invoice is returned to the
 * customer and re-applied to other open invoices. A full snapshot is kept in the audit log.
 */
async function removeOrder(tx: Tx, orderId: string, actor: Actor, reason: string) {
  const head = await tx.order.findUnique({ where: { id: orderId }, select: { userId: true } });
  if (!head) return false;
  // Same lock order as account postings: customer first, then the invoice.
  await tx.$queryRaw`SELECT id FROM User WHERE id=${head.userId} FOR UPDATE`;
  await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id=${orderId} FOR UPDATE`;
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      offlinePayments: true,
      statusEvents: true,
      shippingLabel: true,
      payments: { select: { id: true, status: true, amountRials: true, refNum: true } },
    },
  });
  if (!order) return false;
  if (order.payments.some((payment) => unsettledPayments.includes(payment.status)))
    throw authError(
      'تراکنش بانکی این سفارش هنوز نهایی نشده است؛ پس از تعیین وضعیت دوباره تلاش کنید.',
      'BAD_USER_INPUT',
    );
  let returnedCredit = false;
  for (const allocation of order.offlinePayments)
    if (allocation.accountEntryId && !allocation.voided) {
      await tx.customerAccountEntry.update({
        where: { id: allocation.accountEntryId },
        data: { remaining: { increment: allocation.amount } },
      });
      returnedCredit = true;
    }
  await tx.payment.updateMany({ where: { orderId }, data: { orderId: null } });
  await tx.supportTicket.updateMany({ where: { orderId }, data: { orderId: null } });
  await tx.orderItem.deleteMany({ where: { orderId } });
  // Cascades offline allocations, status history and the shipping label.
  await tx.order.delete({ where: { id: orderId } });
  const snapshot = JSON.parse(
    JSON.stringify(order, (_, value) => (typeof value === 'bigint' ? value.toString() : value)),
  ) as Prisma.InputJsonValue;
  await tx.adminRecordChange.create({
    data: {
      id: randomUUID(),
      entityType: 'ORDER_DELETION',
      entityId: orderId,
      adminId: actor.id,
      adminEmail: actor.email,
      requestHash: createHash('sha256').update(`${orderId}:${reason}`).digest('hex'),
      before: snapshot,
      after: { deleted: true, reason, number: order.number },
    },
  });
  if (returnedCredit) await allocateCredits(tx, order.userId);
  return true;
}

export async function deleteAdminOrder(actor: Actor, id: string, expectedUpdatedAt: string) {
  if (!id || id.length > 100 || !expectedUpdatedAt || expectedUpdatedAt.length > 40)
    throw authError('سفارش معتبر نیست.', 'BAD_USER_INPUT');
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, select: { updatedAt: true } });
    if (!order) throw authError('سفارش یافت نشد یا قبلاً حذف شده است.', 'NOT_FOUND');
    if (order.updatedAt.toISOString() !== expectedUpdatedAt)
      throw authError('سفارش تغییر کرده است؛ اطلاعات جدید را دریافت کنید.', 'REQUEST_CONFLICT');
    await removeOrder(tx, id, actor, 'ADMIN_DELETE');
    return true;
  });
}

/** Removes orders that have stayed canceled longer than the retention window. */
export async function purgeCanceledOrders(
  now = new Date(),
  limit = 50,
  scope: Prisma.OrderWhereInput = {},
) {
  const cutoff = new Date(now.getTime() - canceledOrderRetentionDays * 86400000);
  const candidates = await db.order.findMany({
    where: { ...scope, status: 'CANCELED', updatedAt: { lt: cutoff } },
    select: { id: true },
    orderBy: { updatedAt: 'asc' },
    take: limit,
  });
  let removed = 0;
  for (const { id } of candidates) {
    try {
      const done = await db.$transaction(async (tx) => {
        // Re-check under lock: the order may have been edited or reopened meanwhile.
        const current = await tx.order.findUnique({
          where: { id },
          select: { status: true, updatedAt: true },
        });
        if (current?.status !== 'CANCELED' || current.updatedAt >= cutoff) return false;
        return removeOrder(tx, id, system, 'CANCELED_RETENTION');
      });
      if (done) removed++;
    } catch {
      // An unsettled payment or a concurrent change keeps the order until the next run.
    }
  }
  return removed;
}

export function startCanceledOrderCleanup(intervalMs = 6 * 3600000) {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      const removed = await purgeCanceledOrders();
      if (removed) console.info(`Removed ${removed} canceled orders past retention.`);
    } catch {
      console.error('Canceled order cleanup will retry.');
    } finally {
      running = false;
    }
  };
  const timer = setInterval(() => void run(), intervalMs);
  timer.unref();
  const first = setTimeout(() => void run(), 60000);
  first.unref();
  return () => {
    clearInterval(timer);
    clearTimeout(first);
  };
}
