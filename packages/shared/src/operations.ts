import { z } from 'zod';
export const entityId = z.string().min(1).max(100);
export const pageInput = z.object({
  page: z.number().int().min(1).max(100000).default(1),
  pageSize: z.number().int().min(1).max(50).default(20),
});
export const ticketFilter = pageInput.extend({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']).nullish(),
});
export const ticketInput = z.object({
  subject: z.string().trim().min(3).max(150),
  body: z.string().trim().min(3).max(4000),
  orderId: entityId.nullish(),
});
export const ticketReplyInput = z.object({
  id: entityId,
  body: z.string().trim().min(1).max(4000),
});
export const reviewInput = z.object({
  productId: entityId,
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(3).max(2000),
});
export const reviewFilter = pageInput.extend({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).nullish(),
});
export const couponInput = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,40}$/),
    type: z.enum(['PERCENT', 'FIXED']),
    value: z.number().int().positive().max(2147483647),
    minOrderAmount: z.number().int().min(0).max(2147483647),
    maxDiscountAmount: z.number().int().positive().max(2147483647).nullish(),
    startsAt: z.iso.datetime({ offset: true }),
    expiresAt: z.iso.datetime({ offset: true }),
    usageLimit: z.number().int().positive().max(1000000).nullish(),
    isActive: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'PERCENT' && value.value > 100)
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'درصد باید بین ۱ و ۱۰۰ باشد.' });
    if (Date.parse(value.expiresAt) <= Date.parse(value.startsAt))
      ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'پایان باید پس از شروع باشد.' });
  });
export const staffInput = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(128),
});
