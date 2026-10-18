import { expect, it } from 'vitest';
import { productDescription, temporaryPhotoDescription } from './photo-catalog.js';

it('replaces only the legacy temporary copy with recorded product facts without changing custom text', () => {
  const product = {
    title: 'حلواارده شکری',
    weight: '۵۰۰ گرم',
    description: temporaryPhotoDescription,
  };
  expect(productDescription(product)).toBe(
    'حلواارده شکری از محصولات سنتی بهجتی اردکان. وزن / حجم بسته‌بندی: ۵۰۰ گرم.',
  );
  const custom = 'توضیح واقعی ثبت‌شده توسط مدیر فروشگاه';
  expect(productDescription({ ...product, description: custom })).toBe(custom);
  expect(product.description).toBe(temporaryPhotoDescription);
});
