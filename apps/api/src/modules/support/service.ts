import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { db } from '../../database/client.js';
import {
  entityId,
  ticketFilter,
  ticketInput,
  ticketReplyInput,
  reviewInput,
  reviewFilter,
} from '@behjati/shared/operations';
import { validate, omitNulls } from '../admin/validation.js';
import { authError } from '../auth/errors.js';
const ticketRelations = {
  user: { select: { firstName: true, lastName: true } },
  order: { select: { number: true } },
  messages: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] },
} satisfies Prisma.SupportTicketInclude;
type Ticket = Prisma.SupportTicketGetPayload<{ include: typeof ticketRelations }>;
export const presentTicket = (ticket: Ticket) => ({
  ...ticket,
  customerName: [ticket.user.firstName, ticket.user.lastName].filter(Boolean).join(' ') || 'مشتری',
  orderNumber: ticket.order?.number ?? null,
  createdAt: ticket.createdAt.toISOString(),
  updatedAt: ticket.updatedAt.toISOString(),
  messages: ticket.messages.map((message) => ({
    ...message,
    createdAt: message.createdAt.toISOString(),
  })),
});
export async function tickets(raw: Record<string, unknown>, userId?: string) {
  const { page, pageSize, status } = validate(ticketFilter, omitNulls(raw));
  const where = { ...(userId ? { userId } : {}), ...(status ? { status } : {}) };
  const [items, total] = await db.$transaction([
    db.supportTicket.findMany({
      where,
      include: ticketRelations,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.supportTicket.count({ where }),
  ]);
  return { items: items.map(presentTicket), total, page, pageSize };
}
export async function getTicket(id: string, userId?: string) {
  validate(entityId, id);
  const ticket = await db.supportTicket.findFirst({
    where: { id, ...(userId ? { userId } : {}) },
    include: ticketRelations,
  });
  if (!ticket) throw authError('تیکت یافت نشد.', 'NOT_FOUND');
  return presentTicket(ticket);
}
export async function createTicket(userId: string, raw: unknown) {
  const input = validate(ticketInput, raw);
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM User WHERE id = ${userId} FOR UPDATE`;
    if ((await tx.supportTicket.count({ where: { userId, status: { not: 'CLOSED' } } })) >= 20)
      throw authError('حداکثر ۲۰ تیکت باز می‌توانید داشته باشید.', 'BAD_USER_INPUT');
    if (input.orderId && !(await tx.order.findFirst({ where: { id: input.orderId, userId } })))
      throw authError('سفارش یافت نشد.', 'NOT_FOUND');
    return presentTicket(
      await tx.supportTicket.create({
        data: {
          userId,
          subject: input.subject,
          orderId: input.orderId,
          messages: { create: { body: input.body } },
        },
        include: ticketRelations,
      }),
    );
  });
}
export async function replyTicket(raw: unknown, userId?: string) {
  const input = validate(ticketReplyInput, raw);
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM SupportTicket WHERE id = ${input.id} FOR UPDATE`;
    const ticket = await tx.supportTicket.findFirst({
      where: { id: input.id, ...(userId ? { userId } : {}) },
    });
    if (!ticket) throw authError('تیکت یافت نشد.', 'NOT_FOUND');
    if (ticket.status === 'CLOSED')
      throw authError(
        'تیکت بسته است؛ تیکت جدید ثبت کنید یا از پشتیبانی بخواهید آن را باز کند.',
        'BAD_USER_INPUT',
      );
    if ((await tx.ticketMessage.count({ where: { ticketId: ticket.id } })) >= 200)
      throw authError('حداکثر پیام این تیکت ثبت شده است؛ تیکت جدید بسازید.', 'BAD_USER_INPUT');
    return presentTicket(
      await tx.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: userId ? 'OPEN' : 'IN_PROGRESS',
          updatedAt: new Date(),
          messages: { create: { body: input.body, fromSupport: !userId } },
        },
        include: ticketRelations,
      }),
    );
  });
}
export async function setTicketStatus(
  id: string,
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED',
  expectedUpdatedAt: string,
) {
  validate(entityId, id);
  validate(z.iso.datetime({ offset: true }), expectedUpdatedAt);
  return db.$transaction(async (tx) => {
    const changed = await tx.supportTicket.updateMany({
      where: { id, updatedAt: new Date(expectedUpdatedAt) },
      data: { status, updatedAt: new Date() },
    });
    if (!changed.count)
      throw authError('تیکت تغییر کرده است؛ صفحه را تازه کنید.', 'REQUEST_CONFLICT');
    return presentTicket(
      await tx.supportTicket.findUniqueOrThrow({ where: { id }, include: ticketRelations }),
    );
  });
}
const reviewRelations = {
  user: { select: { firstName: true, lastName: true } },
  product: { select: { title: true } },
} satisfies Prisma.ProductReviewInclude;
type Review = Prisma.ProductReviewGetPayload<{ include: typeof reviewRelations }>;
export const presentReview = (review: Review) => ({
  ...review,
  authorName: review.user.firstName || 'کاربر فروشگاه',
  productTitle: review.product.title,
  createdAt: review.createdAt.toISOString(),
  updatedAt: review.updatedAt.toISOString(),
});
export async function reviews(raw: Record<string, unknown>, productId?: string) {
  const { page, pageSize, status } = validate(reviewFilter, omitNulls(raw));
  if (productId) validate(entityId, productId);
  const where: Prisma.ProductReviewWhereInput = productId
    ? { productId, status: 'APPROVED', product: { isActive: true } }
    : { ...(status ? { status } : {}) };
  const [items, total] = await db.$transaction([
    db.productReview.findMany({
      where,
      include: reviewRelations,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.productReview.count({ where }),
  ]);
  return { items: items.map(presentReview), total, page, pageSize };
}
export async function myReview(userId: string, productId: string) {
  validate(entityId, productId);
  const review = await db.productReview.findUnique({
    where: { userId_productId: { userId, productId } },
    include: reviewRelations,
  });
  return review ? presentReview(review) : null;
}
export async function submitReview(userId: string, raw: unknown) {
  const input = validate(reviewInput, raw);
  if (!(await db.product.findFirst({ where: { id: input.productId, isActive: true } })))
    throw authError('محصول یافت نشد.', 'NOT_FOUND');
  return presentReview(
    await db.productReview.upsert({
      where: { userId_productId: { userId, productId: input.productId } },
      create: { ...input, userId },
      update: { rating: input.rating, body: input.body, status: 'PENDING', updatedAt: new Date() },
      include: reviewRelations,
    }),
  );
}
export async function moderateReview(
  id: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
  expectedUpdatedAt: string,
) {
  validate(entityId, id);
  validate(z.iso.datetime({ offset: true }), expectedUpdatedAt);
  return db.$transaction(async (tx) => {
    const changed = await tx.productReview.updateMany({
      where: { id, updatedAt: new Date(expectedUpdatedAt) },
      data: { status, updatedAt: new Date() },
    });
    if (!changed.count)
      throw authError('نظر تغییر کرده است؛ صفحه را تازه کنید.', 'REQUEST_CONFLICT');
    return presentReview(
      await tx.productReview.findUniqueOrThrow({ where: { id }, include: reviewRelations }),
    );
  });
}
