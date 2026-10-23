import { z } from 'zod';
import { BRAND_NAME, normalizeDigits } from '@behjati/shared';
export const defaultStoreInformation = {
  name: BRAND_NAME,
  phone: '09131564876',
  address: 'اردکان، استان یزد، ایران',
  postalCode: '',
};
export const storeInformationSchema = z
  .object({
    name: z.string().trim().min(2, 'نام فروشگاه را وارد کنید.').max(120),
    phone: z
      .string()
      .trim()
      .max(30)
      .transform(normalizeDigits)
      .refine(
        (value) =>
          /^\+?[0-9 ()-]{7,30}$/.test(value) &&
          value.replace(/\D/g, '').length >= 7 &&
          value.replace(/\D/g, '').length <= 15,
        'شماره تماس معتبر وارد کنید.',
      ),
    address: z.string().trim().min(5, 'نشانی کامل فروشگاه را وارد کنید.').max(600),
    postalCode: z
      .string()
      .trim()
      .transform(normalizeDigits)
      .pipe(z.string().regex(/^\d{10}$/, 'کد پستی باید ده رقم باشد.')),
  })
  .strict();
export type StoreInformationValues = z.infer<typeof storeInformationSchema>;
