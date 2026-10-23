import { describe, it, expect } from 'vitest';
import {
  adminLoginSchema,
  adminProductInputSchema,
  assetUrlSchema,
  adminOrdersFilterSchema,
  adminReportFilterSchema,
  orderStatusTransitions,
  defaultReportRange,
  adminCustomerEditSchema,
  manualOrderEditSchema,
} from './admin';
const product = {
  title: 'محصول نمونه',
  slug: 'sample-product',
  price: 100000,
  weight: '۵۰۰ گرم',
  categoryId: 'category',
  shortDescription: '',
  description: '',
  isActive: true,
  images: [{ url: '/images/halva.webp', alt: 'تصویر محصول' }],
};
describe('Admin input boundaries', () => {
  it('normalizes email and bounds passwords', () => {
    expect(adminLoginSchema.parse({ email: ' ADMIN@Example.COM ', password: 'valid' }).email).toBe(
      'admin@example.com',
    );
    expect(
      adminLoginSchema.safeParse({ email: 'admin@example.com', password: 'x'.repeat(129) }).success,
    ).toBe(false);
  });
  it('bounds product money, slug and images', () => {
    expect(adminProductInputSchema.safeParse(product).success).toBe(true);
    for (const patch of [
      { price: -1 },
      { price: 1.5 },
      { price: 2147483648 },
      { slug: '../bad' },
      { images: [] },
      { images: Array(9).fill(product.images[0]) },
      { stock: 1 },
    ])
      expect(adminProductInputSchema.safeParse({ ...product, ...patch }).success).toBe(false);
  });
  it('normalizes ordinary English slug input and explains unsupported text in Persian', () => {
    expect(adminProductInputSchema.parse({ ...product, slug: '  My_Product ۵۰۰  ' }).slug).toBe(
      'my-product-500',
    );
    const invalid = adminProductInputSchema.safeParse({ ...product, slug: 'ارده سنتی' });
    expect(invalid.success).toBe(false);
    if (!invalid.success) expect(invalid.error.issues[0]?.message).toContain('حروف انگلیسی');
  });
  it('rejects unsafe asset schemes and permits local or HTTPS assets', () => {
    for (const url of [
      'javascript:alert(1)',
      'data:image/svg+xml,test',
      '//evil.test/a.png',
      'http://external.test/a.png',
      'https://user:pass@example.com/a.png',
      '/images/ bad.png',
      '/images/\\bad.png',
    ])
      expect(assetUrlSchema.safeParse(url).success).toBe(false);
    expect(assetUrlSchema.safeParse('https://example.com/image.webp').success).toBe(true);
  });
  it('bounds pagination, Gregorian dates and date ordering', () => {
    for (const input of [
      { page: 0 },
      { pageSize: 51 },
      { number: 1.5 },
      { from: '2026-02-30' },
      { from: '2026-10-04', to: '2026-10-03' },
      { status: 'PAID' },
    ])
      expect(adminOrdersFilterSchema.safeParse(input).success).toBe(false);
    expect(adminOrdersFilterSchema.parse({ search: '۱۲۳' }).search).toBe('123');
  });
  it('caps report periods and uses Tehran dates across UTC midnight', () => {
    expect(
      adminReportFilterSchema.safeParse({ from: '2025-01-01', to: '2026-01-02' }).success,
    ).toBe(false);
    expect(
      adminReportFilterSchema.safeParse({ from: '2026-10-03', to: '2026-10-03' }).success,
    ).toBe(true);
    expect(defaultReportRange(new Date('2026-10-02T21:00:00Z')).to).toBe('2026-10-03');
  });
  it('keeps terminal states immutable and prevents skipping fulfilment', () => {
    expect(orderStatusTransitions.DELIVERED).toEqual([]);
    expect(orderStatusTransitions.CANCELED).toEqual([]);
    expect(orderStatusTransitions.PENDING_PAYMENT).not.toContain('DELIVERED');
    expect(orderStatusTransitions.SHIPPED).toEqual(['DELIVERED']);
  });
});

describe('Customer and manual invoice corrections', () => {
  const customer = {
    id: 'customer',
    expectedRevision: 'a'.repeat(64),
    requestId: '050b6ed8-92ab-4e1d-95d1-665c649d3661',
    firstName: 'مشتری',
    lastName: '',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    email: '',
    address: null,
  };
  it('requires a record revision and validates customer identity without accepting permissions', () => {
    expect(adminCustomerEditSchema.parse(customer).phone).toBe('09123456789');
    for (const patch of [{ expectedRevision: '' }, { phone: '123' }, { role: 'OWNER' }])
      expect(adminCustomerEditSchema.safeParse({ ...customer, ...patch }).success).toBe(false);
  });
  it('bounds edited lines and disallows injecting a received amount into invoice correction', () => {
    const invoice = {
      orderId: 'order',
      expectedUpdatedAt: new Date().toISOString(),
      requestId: customer.requestId,
      customerId: customer.id,
      salesChannel: 'IN_PERSON',
      pickup: true,
      shippingMethod: 'POST',
      manualShippingCost: 0,
      items: [{ productId: 'product', quantity: 1, unitPrice: 100 }],
      expectedTotal: 100,
    };
    expect(manualOrderEditSchema.safeParse(invoice).success).toBe(true);
    for (const patch of [
      { receivedAmount: 100 },
      { items: [] },
      { salesChannel: 'WEBSITE' },
      { expectedTotal: -1 },
    ])
      expect(manualOrderEditSchema.safeParse({ ...invoice, ...patch }).success).toBe(false);
  });
});
