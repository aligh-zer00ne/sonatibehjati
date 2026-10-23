import { describe, expect, it } from 'vitest';
import { storeInformationSchema } from './store-information.js';
import { canOpenAdminPath, adminLanding, hasPermission } from './permissions.js';
const input = {
  name: 'سنتی بهجتی',
  phone: '۰۹۱۳۱۵۶۴۸۷۶',
  address: 'اردکان، خیابان فروشگاه، پلاک ۱۲',
  postalCode: '۸۹۵۱۸۱۲۳۴۵',
};
describe('Store information', () => {
  it('normalizes Persian contact/postcode and trims names/addresses', () => {
    expect(storeInformationSchema.parse({ ...input, name: ` ${input.name} ` })).toEqual({
      ...input,
      name: input.name,
      phone: '09131564876',
      postalCode: '8951812345',
    });
  });
  it('requires actual contact digits and a complete ten-digit postcode', () => {
    for (const phone of ['', '-------', 'abc09131564876', '1234567890123456'])
      expect(storeInformationSchema.safeParse({ ...input, phone }).success).toBe(false);
    for (const postalCode of ['', '123', '12345678901', '12345abc90'])
      expect(storeInformationSchema.safeParse({ ...input, postalCode }).success).toBe(false);
  });
  it('rejects missing/oversized fields and unrelated properties', () => {
    expect(storeInformationSchema.safeParse({ ...input, name: ' ' }).success).toBe(false);
    expect(storeInformationSchema.safeParse({ ...input, address: 'x'.repeat(601) }).success).toBe(
      false,
    );
    expect(storeInformationSchema.safeParse({ ...input, shippingCost: 0 }).success).toBe(false);
  });
  it('separates management permission from order printing and other staff pages', () => {
    const staff = { role: 'STAFF', permissions: ['STORE_INFO'] };
    expect(adminLanding(staff)).toBe('/admin/store-information');
    expect(canOpenAdminPath(staff, '/admin/store-information')).toBe(true);
    expect(
      canOpenAdminPath({ role: 'STAFF', permissions: ['ORDERS'] }, '/admin/store-information'),
    ).toBe(false);
    expect(hasPermission({ role: 'OWNER', permissions: [] }, 'STORE_INFO')).toBe(true);
  });
});
