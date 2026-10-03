import { describe, expect, it } from 'vitest';
import {
  profileInputSchema,
  ordersFilterSchema,
  orderAddressSnapshotSchema,
  formatDate,
} from './index';
describe('Account validation', () => {
  it('normalizes profile without accepting identity or phone changes', () => {
    expect(
      profileInputSchema.parse({
        firstName: ' علی ',
        lastName: ' غفوری ',
        email: ' USER@Example.COM ',
      }),
    ).toEqual({ firstName: 'علی', lastName: 'غفوری', email: 'user@example.com' });
    expect(
      profileInputSchema.safeParse({
        firstName: 'علی',
        lastName: 'غفوری',
        email: '',
        phone: '09123456789',
      }).success,
    ).toBe(false);
    expect(
      profileInputSchema.safeParse({
        firstName: 'علی',
        lastName: 'غفوری',
        email: '',
        userId: 'another',
      }).success,
    ).toBe(false);
  });
  it('requires names and validates optional email', () => {
    expect(
      profileInputSchema.safeParse({ firstName: ' ', lastName: 'غفوری', email: '' }).success,
    ).toBe(false);
    expect(
      profileInputSchema.safeParse({ firstName: 'علی', lastName: 'غفوری', email: 'invalid' })
        .success,
    ).toBe(false);
    expect(
      profileInputSchema.safeParse({ firstName: 'علی', lastName: 'غفوری', email: '' }).success,
    ).toBe(true);
  });
  it('bounds pagination and status', () => {
    expect(ordersFilterSchema.parse({})).toEqual({ page: 1, pageSize: 10 });
    for (const input of [
      { page: 0 },
      { page: 10001 },
      { pageSize: 21 },
      { page: 1.5 },
      { status: 'UNKNOWN' },
      { userId: 'another' },
    ])
      expect(ordersFilterSchema.safeParse(input).success).toBe(false);
  });
  it('supports historical incomplete snapshots without reading current address', () => {
    expect(
      orderAddressSnapshotSchema.parse({ city: 'اردکان', postalAddress: 'نشانی قدیمی' }),
    ).toEqual({ city: 'اردکان', postalAddress: 'نشانی قدیمی' });
    expect(orderAddressSnapshotSchema.safeParse({ latitude: 100 }).success).toBe(false);
  });
  it('formats dates with Persian digits and the Tehran calendar', () => {
    expect(formatDate('2026-10-03T12:00:00Z')).toMatch(/[۰-۹]/);
    expect(formatDate('2026-10-03T12:00:00Z')).not.toMatch(/[0-9]/);
  });
});
