import { describe, expect, it } from 'vitest';
import { otpRequestSchema, otpVerifySchema, safeReturnPath } from './index.js';
describe('auth input and return paths', () => {
  it('normalizes Persian and Arabic digits while preserving leading zeroes', () => {
    expect(otpRequestSchema.parse({ phone: '۰۹۰۰۰۰۰۰۰۰۱' }).phone).toBe('09000000001');
    expect(
      otpVerifySchema.parse({
        challengeId: 'e872f995-6d7e-47b6-a73c-6550357763c3',
        phone: '٠٩٠٠٠٠٠٠٠٠١',
        code: '٠١٢٣٤٥',
      }).code,
    ).toBe('012345');
    expect(
      otpVerifySchema.safeParse({ challengeId: 'no', phone: '09000000001', code: '12345' }).success,
    ).toBe(false);
  });
  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/login',
    '/verify',
    '/api/auth',
    '/cart\n',
    '/%5cevil.example',
    '/%2f%2fevil.example',
    '/login/',
    '/api',
    '/%0a/cart',
  ])('prevents unsafe redirect %j', (path) => expect(safeReturnPath(path)).toBe('/account'));
  it('preserves the destination within the store', () =>
    expect(safeReturnPath('/cart?from=login')).toBe('/cart?from=login'));
});
