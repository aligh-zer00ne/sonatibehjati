import { z } from 'zod';
export const DESIGNER_DOMAIN = 'nexoraict.ir';
export const DESIGNER_URL = 'https://nexoraict.ir';
export const BRAND_NAME = 'حلواارده سنتی بهجتی اردکان';
export const formatNumber = (value: number) => new Intl.NumberFormat('fa-IR').format(value);
export const formatPrice = (value: number) => `${formatNumber(value)} تومان`;
export const normalizeDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
export const phoneSchema = z
  .string()
  .max(30)
  .transform((value) => normalizeDigits(value.trim()))
  .pipe(z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید.'));
export const cartLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});
export const productInputSchema = z.object({
  title: z.string().min(2).max(150),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  price: z.number().int().nonnegative(),
  weight: z.string().min(1),
  shortDescription: z.string().max(500),
  description: z.string(),
  categoryId: z.string().min(1),
  isActive: z.boolean(),
});

export const MAX_CART_QUANTITY = 99;
export const MAX_CART_LINES = 200;
export const normalizeSearch = (text: string) =>
  text
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
export const catalogSorts = ['FEATURED', 'NEWEST', 'PRICE_ASC', 'PRICE_DESC', 'NAME_ASC'] as const;
export const catalogFilterSchema = z
  .object({
    search: z.string().max(100).transform(normalizeSearch).default(''),
    category: z
      .string()
      .max(100)
      .regex(/^[a-z0-9-]*$/)
      .default(''),
    excludeSlug: z
      .string()
      .max(150)
      .regex(/^[a-z0-9-]*$/)
      .default(''),
    minPrice: z.number().int().min(0).max(2147483647).optional(),
    maxPrice: z.number().int().min(0).max(2147483647).optional(),
    sort: z.enum(catalogSorts).default('FEATURED'),
    page: z.number().int().min(1).max(10000).default(1),
    pageSize: z.number().int().min(1).max(24).default(12),
  })
  .strict()
  .refine(
    (value) =>
      value.minPrice === undefined ||
      value.maxPrice === undefined ||
      value.minPrice <= value.maxPrice,
    { message: 'حداقل قیمت نباید از حداکثر بیشتر باشد.' },
  );
export type CatalogFilter = z.infer<typeof catalogFilterSchema>;
export const selectionSchema = z
  .object({ ids: z.array(z.string().min(1).max(100)).max(MAX_CART_LINES) })
  .strict();

export const otpRequestSchema = z.object({ phone: phoneSchema }).strict();
export const OTP_LENGTH = 5;
export const otpVerifySchemaForLength = (length: 5 | 6) =>
  z
    .object({
      challengeId: z.string().uuid(),
      phone: phoneSchema,
      code: z
        .string()
        .max(12)
        .transform(normalizeDigits)
        .pipe(
          z
            .string()
            .regex(
              new RegExp(`^\\d{${length}}$`),
              length === 6 ? 'کد شش‌رقمی را وارد کنید.' : 'کد پنج‌رقمی را وارد کنید.',
            ),
        ),
    })
    .strict();
export const otpVerifySchema = otpVerifySchemaForLength(OTP_LENGTH);
export const OTP_LIFETIME_SECONDS = 180;
export const OTP_RESEND_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;
export const safeReturnPath = (value: string | null | undefined) => {
  if (
    !value ||
    value.length > 500 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    [...value].some((character) => character.charCodeAt(0) <= 32)
  )
    return '/account';
  try {
    const parsed = new URL(value, 'https://return.invalid');
    const pathname = decodeURIComponent(parsed.pathname).replace(/\/+$/, '');
    if (
      parsed.origin !== 'https://return.invalid' ||
      ['/login', '/verify', '/api'].includes(pathname) ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('//') ||
      pathname.includes('\\') ||
      pathname.includes('%') ||
      [...pathname].some((character) => character.charCodeAt(0) <= 32)
    )
      return '/account';
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/account';
  }
};
export const USER_ACCESS_COOKIE = 'behjati_user_access';
export const USER_REFRESH_COOKIE = 'behjati_user_refresh';

const boundedText = (min: number, max: number) => z.string().trim().min(min).max(max);
export const coordinatesSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .strict();
export type Coordinates = z.infer<typeof coordinatesSchema>;
export const addressInputSchema = z
  .object({
    title: boundedText(2, 80),
    recipientName: boundedText(2, 100),
    recipientPhone: phoneSchema,
    province: boundedText(2, 80),
    city: boundedText(2, 80),
    postalAddress: boundedText(10, 1000),
    postalCode: z
      .string()
      .max(20)
      .transform((value) => normalizeDigits(value.trim()))
      .pipe(z.string().regex(/^\d{10}$/, 'کد پستی ده‌رقمی وارد کنید.')),
    latitude: coordinatesSchema.shape.latitude.nullish(),
    longitude: coordinatesSchema.shape.longitude.nullish(),
    isDefault: z.boolean().default(false),
  })
  .strict()
  .refine((value) => (value.latitude == null) === (value.longitude == null), {
    message: 'هر دو مختصات موقعیت را مشخص کنید.',
  });
export const checkoutInputSchema = z
  .object({
    addressId: boundedText(1, 100),
    items: z
      .array(cartLineSchema.extend({ productId: boundedText(1, 100) }).strict())
      .min(1)
      .max(MAX_CART_LINES),
    discountCode: z
      .string()
      .trim()
      .max(50)
      .transform((value) => value.toUpperCase())
      .default(''),
  })
  .strict()
  .refine(
    (value) => new Set(value.items.map((item) => item.productId)).size === value.items.length,
    { message: 'محصول تکراری در سبد مجاز نیست.' },
  );
export const createOrderInputSchema = checkoutInputSchema.safeExtend({
  requestId: z.string().uuid(),
  expectedTotal: z.number().int().min(0).max(2147483647),
});

export const profileInputSchema = z
  .object({
    firstName: boundedText(1, 80),
    lastName: boundedText(1, 80),
    email: z
      .string()
      .trim()
      .max(254)
      .transform((value) => value.toLowerCase())
      .pipe(z.union([z.literal(''), z.email()])),
  })
  .strict();
export const orderStatuses = [
  'CREATED',
  'PENDING_PAYMENT',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELED',
] as const;
export const orderStatusLabels: Record<(typeof orderStatuses)[number], string> = {
  CREATED: 'ثبت‌شده',
  PENDING_PAYMENT: 'در انتظار پرداخت',
  PROCESSING: 'در حال آماده‌سازی',
  SHIPPED: 'ارسال‌شده',
  DELIVERED: 'تحویل‌شده',
  CANCELED: 'لغوشده',
};
export const ordersFilterSchema = z
  .object({
    page: z.number().int().min(1).max(10000).default(1),
    pageSize: z.number().int().min(1).max(20).default(10),
    status: z.enum(orderStatuses).nullish(),
  })
  .strict();
export const orderAddressSnapshotSchema = z.object({
  title: z.string().nullish(),
  recipientName: z.string().nullish(),
  recipientPhone: z.string().nullish(),
  province: z.string().nullish(),
  city: z.string().nullish(),
  postalAddress: z.string().nullish(),
  postalCode: z.string().nullish(),
  latitude: coordinatesSchema.shape.latitude.nullish(),
  longitude: coordinatesSchema.shape.longitude.nullish(),
});
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tehran',
  }).format(new Date(value));
