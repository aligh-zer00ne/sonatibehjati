import { describe, expect, it } from 'vitest';
import { productPhotoUrl } from './photo-catalog';

describe('product photo delivery', () => {
  it('invalidates old bundled photos consistently for the store and admin', () => {
    expect(productPhotoUrl('/images/products/tahini-blue.webp')).toBe(
      '/images/products/tahini-blue.webp?v=styled-3',
    );
  });
  it.each([
    '/uploads/products/9b89ef5c-800d-4c68-9e5e-25168ee2e4a6.webp',
    'https://example.com/uploaded-product.webp',
    '/images/custom-product.webp',
    '/images/products/tahini-blue.webp?v=styled-3',
  ])('preserves administrator-defined image URL %s', (url) => {
    expect(productPhotoUrl(url)).toBe(url);
  });
});
