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
