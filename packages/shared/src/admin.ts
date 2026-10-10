import { z } from 'zod';
import { orderStatuses, normalizeDigits, catalogSorts } from '@behjati/shared';
const text = (min: number, max: number) => z.string().trim().min(min).max(max);
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
export const adminProductInputSchema = z
  .object({
    ...promotionFields,
    title: text(2, 150),
    slug: text(1, 150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    price: z.number().int().min(0).max(2147483647),
    weight: text(1, 100),
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
export const adminUsersFilterSchema = z.object({ ...page, search }).strict();
export const adminReportFilterSchema = z
  .object({ from: z.iso.date(), to: z.iso.date(), status: z.enum(orderStatuses).nullish() })
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
