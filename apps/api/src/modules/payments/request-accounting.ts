import { createHash } from 'node:crypto';
import type { Payment, Prisma } from '@prisma/client';
import { allocateCredits } from '../admin/customer-accounts.js';

/** Called only inside the bank-verified payment transaction, after its user/request locks. */
export async function acceptPaymentRequest(tx: Prisma.TransactionClient, payment: Payment) {
  const request = await tx.paymentRequest.findUniqueOrThrow({
    where: { id: payment.paymentRequestId! },
  });
  if (request.mode !== payment.mode) return 'PAYMENT_MODE_MISMATCH';
  if (request.paidAt) return 'DUPLICATE_PAYMENT';
  if (request.canceledAt) return 'PAYMENT_REQUEST_CANCELED';
  if (payment.createdAt > request.expiresAt) return 'PAYMENT_REQUEST_EXPIRED';
  if (payment.amountRials !== BigInt(request.amount) * 10n) return 'AMOUNT_MISMATCH';
  if (request.customerId) {
    await tx.customerAccountEntry.create({
      data: {
        id: payment.id,
        paymentId: payment.id,
        userId: request.customerId,
        direction: 'RECEIPT',
        method: 'ONLINE',
        amount: request.amount,
        remaining: request.amount,
        note: `پرداخت لینک: ${request.title} · رسید بانک: ${payment.refNum ?? ''}`,
        adminId: request.createdByAdminId,
        adminEmail: request.createdByEmail,
        requestHash: createHash('sha256')
          .update(`verified:${payment.id}:${request.id}:${request.amount}`)
          .digest('hex'),
      },
    });
    await allocateCredits(tx, request.customerId);
  }
  await tx.paymentRequest.update({
    where: { id: request.id },
    data: { paidAt: new Date(), acceptedPaymentId: payment.id },
  });
  return null;
}
