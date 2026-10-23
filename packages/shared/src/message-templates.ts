import { z } from 'zod';
import { normalizeDigits } from '@behjati/shared';
import { shippingMethods } from '@behjati/shared/sales';

export const messageVariables = {
  نام_مشتری: 'نام مشتری',
  نام_فروشگاه: 'نام فروشگاه',
  مبلغ: 'مبلغ به ریال',
  لینک_پرداخت: 'لینک پرداخت',
  شماره_سفارش: 'شماره سفارش',
  روش_ارسال: 'روش ارسال',
  کد_رهگیری: 'کد رهگیری',
};
export type MessageKind = 'PAYMENT' | 'SHIPPING';
export const variablesFor = (kind: MessageKind) =>
  kind === 'PAYMENT'
    ? (['نام_مشتری', 'نام_فروشگاه', 'مبلغ', 'لینک_پرداخت'] as const)
    : (['نام_مشتری', 'نام_فروشگاه', 'شماره_سفارش', 'روش_ارسال', 'کد_رهگیری'] as const);
export const messageTemplateSchema = z
  .object({
    id: z.string().regex(/^[a-zA-Z0-9-]{1,60}$/),
    kind: z.enum(['PAYMENT', 'SHIPPING']),
    title: z.string().trim().min(1).max(80),
    body: z.string().trim().min(1).max(1600),
  })
  .strict()
  .superRefine((v, ctx) => {
    const required = v.kind === 'PAYMENT' ? 'لینک_پرداخت' : 'کد_رهگیری';
    if (!v.body.includes(`{${required}}`))
      ctx.addIssue({
        code: 'custom',
        path: ['body'],
        message: `متن باید شامل {${required}} باشد.`,
      });
    const allowed: readonly string[] = variablesFor(v.kind);
    const tokens = [...v.body.matchAll(/\{([^{}]*)\}/g)];
    if (
      tokens.some((m) => !allowed.includes(m[1]!)) ||
      /[{}]/.test(v.body.replace(/\{[^{}]*\}/g, ''))
    )
      ctx.addIssue({
        code: 'custom',
        path: ['body'],
        message: 'از جای‌گذارهای همین نوع پیام استفاده کنید.',
      });
  });
export const messageTemplatesSchema = z
  .array(messageTemplateSchema)
  .max(50)
  .refine(
    (items) => new Set(items.map((v) => v.id)).size === items.length,
    'شناسهٔ قالب‌ها نباید تکراری باشد.',
  );
export type MessageTemplate = z.infer<typeof messageTemplateSchema>;
export const defaultMessageTemplates: MessageTemplate[] = [
  {
    id: 'payment-default',
    kind: 'PAYMENT',
    title: 'درخواست پرداخت',
    body: '{نام_مشتری} گرامی\nمبلغ قابل پرداخت: {مبلغ}\nلینک پرداخت:\n{لینک_پرداخت}\n{نام_فروشگاه}',
  },
  {
    id: 'shipping-default',
    kind: 'SHIPPING',
    title: 'سفارش شما ارسال شد',
    body: '{نام_مشتری} گرامی\nسفارش {شماره_سفارش} شما با {روش_ارسال} ارسال شد.\nکد رهگیری: {کد_رهگیری}\nبا سپاس از خرید شما\n{نام_فروشگاه}',
  },
];
export function renderMessage(
  body: string,
  values: Partial<Record<keyof typeof messageVariables, string>>,
) {
  // One pass: user/order values are never interpreted as another template.
  return body.replace(
    /\{([^{}]*)\}/g,
    (token, key: keyof typeof messageVariables) => values[key] ?? token,
  );
}
export const shipmentInputSchema = z
  .object({
    orderId: z.string().min(1).max(100),
    shippingMethod: z.enum(shippingMethods),
    trackingNumber: z
      .string()
      .transform(normalizeDigits)
      .pipe(
        z
          .string()
          .trim()
          .max(100)
          .regex(/^[A-Za-z0-9 -]*$/),
      ),
    expectedUpdatedAt: z.iso.datetime(),
    expectedLabelUpdatedAt: z.iso.datetime().nullish(),
  })
  .strict();
