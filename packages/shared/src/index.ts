import { z } from 'zod';
export const BRAND_NAME = 'حلواارده سنتی بهجتی اردکان';
export const formatNumber = (value: number) => new Intl.NumberFormat('fa-IR').format(value);
export const formatPrice = (value: number) => `${formatNumber(value)} تومان`;
export const normalizeDigits = (value: string) =>
  value.replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
export const phoneSchema = z
  .string()
  .transform(normalizeDigits)
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
