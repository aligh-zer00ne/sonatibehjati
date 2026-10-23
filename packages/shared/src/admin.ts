import { z } from 'zod';
import { shippingMethods, salesChannels, offlinePaymentMethods } from '@behjati/shared/sales';
import {
  orderStatuses,
  normalizeDigits,
  catalogSorts,
  phoneSchema,
  addressInputSchema,
} from '@behjati/shared';
const text = (min: number, max: number) => z.string().trim().min(min).max(max);
export const adminPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(12).max(128),
  })
  .strict()
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'رمز جدید باید با رمز فعلی متفاوت باشد.',
    path: ['newPassword'],
  });
const labelPhone = z
  .string()
  .trim()
  .max(30)
  .transform(normalizeDigits)
  .refine((value) => !value || /^\+?[0-9 ()-]{7,30}$/.test(value), 'شماره تماس معتبر وارد کنید.');
const labelPostalCode = z
  .string()
  .trim()
  .transform(normalizeDigits)
  .refine((value) => !value || /^\d{10}$/.test(value), 'کد پستی باید ده رقم باشد.');
export const shippingLabelSchema = z
  .object({
    senderName: text(1, 120),
    senderPhone: labelPhone,
    senderAddress: text(0, 600),
    senderPostalCode: labelPostalCode,
    recipientName: text(1, 120),
    recipientPhone: labelPhone,
    recipientAddress: text(1, 600),
    recipientPostalCode: labelPostalCode,
    carrier: text(0, 80),
    trackingNumber: text(0, 100),
    packageWeight: text(0, 80),
    packageContent: text(0, 300),
    note: text(0, 200),
    paperSize: z.enum(['THERMAL', 'A5']),
  })
  .strict();
export type ShippingLabelValues = z.infer<typeof shippingLabelSchema>;
export const adminLoginSchema = z
  .object({
    email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
    password: z.string().min(1).max(128),
  })
  .strict();
const page = {
  page: z.number().int().min(1).max(10000).default(1),
  pageSize: z.number().int().min(1).max(50).default(20),
};
const search = z.string().trim().max(100).transform(normalizeDigits).default('');
export const adminProductsFilterSchema = z
  .object({
    ...page,
    search,
    categoryId: text(1, 100).nullish(),
    active: z.boolean().nullish(),
    sort: z.enum(catalogSorts).default('NEWEST'),
  })
  .strict();
export const assetUrlSchema = z
  .string()
  .trim()
  .max(1000)
  .refine((value) => {
    if (
      value.startsWith('/') &&
      !value.startsWith('//') &&
      !value.includes('\\') &&
      !/[\s<>]/.test(value)
    )
      return true;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password;
    } catch {
      return false;
    }
  }, 'مسیر فایل محلی یا نشانی HTTPS معتبر وارد کنید.');
const promotionFields = {
  discountPercent: z.number().int().min(1).max(99).nullish(),
  discountTitle: text(0, 80).nullish(),
  discountStartsAt: z.iso.datetime().nullish(),
  discountEndsAt: z.iso.datetime().nullish(),
};
const validPromotion = (value: {
  discountPercent?: number | null;
  discountStartsAt?: string | null;
  discountEndsAt?: string | null;
}) =>
  value.discountPercent == null ||
  Boolean(
    value.discountStartsAt &&
    value.discountEndsAt &&
    Date.parse(value.discountStartsAt) < Date.parse(value.discountEndsAt),
  );
export const adminPromotionInputSchema = z
  .object(promotionFields)
  .strict()
  .refine(validPromotion, {
    message: 'برای تخفیف، زمان شروع و پایان معتبر وارد کنید.',
    path: ['discountEndsAt'],
  });
export const adminPromotionTargetsSchema = z
  .array(z.object({ id: text(1, 100), expectedUpdatedAt: z.iso.datetime() }).strict())
  .min(1)
  .max(50)
  .refine((items) => new Set(items.map((item) => item.id)).size === items.length);
export const adminPriceChangesSchema = z
  .array(
    z
      .object({
        id: text(1, 100),
        price: z.number().int().min(0).max(2147483647),
        expectedUpdatedAt: z.iso.datetime(),
      })
      .strict(),
  )
  .min(1)
  .max(500)
  .refine(
    (items) => new Set(items.map((item) => item.id)).size === items.length,
    'محصول تکراری است.',
  );

export const productSlugSchema = z
  .string()
  .trim()
  .transform((value) =>
    normalizeDigits(value)
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, ''),
  )
  .pipe(
    z
      .string()
      .min(1, 'نامک محصول را وارد کنید.')
      .max(150, 'نامک حداکثر ۱۵۰ حرف است.')
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'نامک را با حروف انگلیسی، عدد و خط تیره بنویسید؛ مثال: tahini-500.',
      ),
  );
export const adminProductInputSchema = z
  .object({
    ...promotionFields,
    title: text(2, 150),
    slug: productSlugSchema,
    price: z.number().int().min(0).max(2147483647),
    weight: text(1, 100),
    shippingWeightGrams: z.number().int().positive().max(1000000).optional(),
    shippingBaseCost: z.number().int().min(0).max(2147483647).optional(),
    shippingAdditionalKgCost: z.number().int().min(0).max(2147483647).optional(),
    shortDescription: text(0, 500),
    description: text(0, 10000),
    categoryId: text(1, 100),
    isActive: z.boolean(),
    badge: text(0, 80).nullish(),
    images: z
      .array(z.object({ url: assetUrlSchema, alt: text(1, 150) }).strict())
      .min(1)
      .max(8),
  })
  .strict()
  .refine(validPromotion, {
    message: 'برای تخفیف، زمان شروع و پایان معتبر وارد کنید.',
    path: ['discountEndsAt'],
  });
export const adminOrdersFilterSchema = z
  .object({
    ...page,
    search,
    status: z.enum(orderStatuses).nullish(),
    userId: text(1, 100).nullish(),
    salesChannel: z.enum(salesChannels).nullish(),
    manualOnly: z.boolean().nullish(),
    shippingMethod: z.enum(shippingMethods).nullish(),
    number: z.number().int().positive().max(2147483647).nullish(),
    city: text(0, 80).default(''),
    from: z.iso.date().nullish(),
    to: z.iso.date().nullish(),
    sort: z.enum(['NEWEST', 'OLDEST', 'TOTAL_DESC', 'TOTAL_ASC']).default('NEWEST'),
  })
  .strict()
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'بازه تاریخ معتبر نیست.',
  });
export const adminUsersFilterSchema = z
  .object({ ...page, search, salesChannel: z.enum(salesChannels).nullish() })
  .strict();
export const adminReportFilterSchema = z
  .object({
    from: z.iso.date(),
    to: z.iso.date(),
    status: z.enum(orderStatuses).nullish(),
    salesChannel: z.enum(salesChannels).nullish(),
    shippingMethod: z.enum(shippingMethods).nullish(),
  })
  .strict()
  .refine(
    (value) => {
      const distance = (Date.parse(value.to) - Date.parse(value.from)) / 86400000;
      return distance >= 0 && distance <= 365;
    },
    { message: 'بازه گزارش باید حداکثر ۳۶۶ روز باشد.' },
  );
export const orderStatusTransitions: Record<
  (typeof orderStatuses)[number],
  readonly (typeof orderStatuses)[number][]
> = {
  CREATED: ['PENDING_PAYMENT', 'CANCELED'],
  PENDING_PAYMENT: ['PROCESSING', 'CANCELED'],
  PROCESSING: ['SHIPPED', 'CANCELED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELED: [],
};
export const orderStatusChangeSchema = z
  .object({
    id: text(1, 100),
    status: z.enum(orderStatuses),
    expectedStatus: z.enum(orderStatuses),
  })
  .strict();

export const tehranDate = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
export function defaultReportRange(now = new Date()) {
  const to = tehranDate(now);
  return { from: new Date(Date.parse(to) - 29 * 86400000).toISOString().slice(0, 10), to };
}

export const adminCustomerInputSchema = z
  .object({
    phone: phoneSchema,
    firstName: text(1, 100),
    lastName: text(0, 100).default(''),
    salesChannel: z.enum(['INSTAGRAM', 'IN_PERSON']),
    address: addressInputSchema.nullish(),
  })
  .strict()
  .refine((v) => v.salesChannel !== 'INSTAGRAM' || !!v.address, {
    message: 'نشانی و کد پستی مشتری اینستاگرامی لازم است.',
    path: ['address'],
  });
export const manualLineSchema = z
  .object({
    productId: text(1, 100),
    quantity: z.number().int().min(1).max(99),
    unitPrice: z.number().int().min(0).max(2147483647).nullish(),
    discountAmount: z.number().int().min(0).max(2147483647).nullish(),
    discountPercent: z.number().min(0).max(100).nullish(),
  })
  .strict()
  .refine((v) => !v.discountAmount || !v.discountPercent, {
    message: 'تخفیف ردیف را درصدی یا مبلغی وارد کنید.',
  });
export const manualQuoteInputSchema = z
  .object({
    items: z.array(manualLineSchema).min(1).max(50),
    discountCode: z.literal('').default(''),
    manualShippingCost: z.number().int().min(0).max(2147483647).default(0),
    shippingMethod: z.enum(shippingMethods).default('POST'),
    pickup: z.boolean().default(false),
  })
  .strict()
  .refine((v) => new Set(v.items.map((i) => i.productId)).size === v.items.length);
export const manualOrderInputSchema = manualQuoteInputSchema
  .safeExtend({
    customerId: text(1, 100),
    salesChannel: z.enum(['INSTAGRAM', 'IN_PERSON']),
    address: addressInputSchema.nullish(),
    receivedAmount: z.number().int().min(0).max(2147483647),
    paymentMethod: z.enum(offlinePaymentMethods).nullish(),
    requestId: z.string().uuid(),
    expectedTotal: z.number().int().min(0).max(2147483647),
  })
  .refine((v) => v.pickup || !!v.address, {
    message: 'نشانی ارسال را وارد کنید.',
    path: ['address'],
  })
  .refine((v) => !v.receivedAmount || !!v.paymentMethod, {
    message: 'نوع پرداخت را انتخاب کنید.',
    path: ['paymentMethod'],
  });
export const accountEntryInputSchema = z
  .object({
    customerId: text(1, 100),
    direction: z.enum(['RECEIPT', 'PAYMENT']),
    amount: z.number().int().positive().max(2147483647),
    method: z.enum(offlinePaymentMethods),
    note: text(0, 500).default(''),
    chequeNumber: text(0, 60).default(''),
    chequeBank: text(0, 100).default(''),
    chequeDueDate: z.iso.date().nullish(),
    requestId: z.string().uuid(),
  })
  .strict()
  .refine((v) => v.method !== 'CHECK' || (!!v.chequeNumber && !!v.chequeDueDate), {
    message: 'شماره و تاریخ سررسید چک لازم است.',
  });
export const offlinePaymentInputSchema = z
  .object({
    orderId: text(1, 100),
    amount: z.number().int().positive().max(2147483647),
    method: z.enum(offlinePaymentMethods),
    requestId: z.string().uuid(),
    expectedUpdatedAt: z.iso.datetime(),
  })
  .strict();

export const adminCustomerEditSchema = z
  .object({
    id: text(1, 100),
    expectedRevision: z.string().regex(/^[a-f0-9]{64}$/),
    requestId: z.string().uuid(),
    phone: phoneSchema,
    firstName: text(1, 100),
    lastName: text(0, 100).default(''),
    email: z.union([z.literal(''), z.email().max(254)]).default(''),
    address: addressInputSchema.nullish(),
  })
  .strict();
export const manualOrderEditSchema = manualQuoteInputSchema
  .safeExtend({
    orderId: text(1, 100),
    expectedUpdatedAt: z.iso.datetime(),
    requestId: z.string().uuid(),
    customerId: text(1, 100),
    salesChannel: z.enum(['INSTAGRAM', 'IN_PERSON']),
    address: addressInputSchema.nullish(),
    expectedTotal: z.number().int().min(0).max(2147483647),
  })
  .refine((v) => v.pickup || !!v.address, {
    message: 'نشانی ارسال را وارد کنید.',
    path: ['address'],
  });
