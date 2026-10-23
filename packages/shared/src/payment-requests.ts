import { z } from 'zod';
import { phoneSchema } from '@behjati/shared';
import type { PaymentResultData } from '@behjati/shared/payments';
export const paymentRequestInputSchema = z
  .object({
    requestId: z.string().uuid(),
    scope: z.enum(['CUSTOMER_BALANCE', 'CUSTOM_AMOUNT']),
    customerId: z.string().min(1).max(100).nullish(),
    amount: z.number().int().positive().max(2147483647),
    title: z.string().trim().min(1).max(200),
    payerName: z.string().trim().max(100).nullish(),
    payerPhone: phoneSchema.nullish(),
    expiresInHours: z.union([z.literal(24), z.literal(72), z.literal(168)]).default(72),
  })
  .strict()
  .refine((v) => (v.scope === 'CUSTOMER_BALANCE' ? !!v.customerId : !v.customerId), {
    message: 'نوع لینک و مشتری را بررسی کنید.',
  });
export type PublicPaymentRequest = {
  id: string;
  title: string;
  amount: number;
  expiresAt: string;
  paidAt: string | null;
  status: 'ACTIVE' | 'PAID' | 'EXPIRED' | 'CANCELED';
  gatewayAvailable: boolean;
  payment: PaymentResultData | null;
};
