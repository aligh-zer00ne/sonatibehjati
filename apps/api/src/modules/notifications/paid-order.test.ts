import { describe, expect, it, vi } from 'vitest';
vi.mock('../../database/client.js', () => ({ db: {} }));
vi.mock('../../config/env.js', () => ({
  env: { NODE_ENV: 'test', EITAA_BOT_TOKEN: 'bot1:x', EITAA_CHAT_ID: '1' },
}));
vi.mock('../checkout/shipping-settings.js', () => ({ orderShippingMethodLabel: async () => null }));
import { eitaaConfigured, paidOrderMessage } from './paid-order';
const order = {
  id: 'order-1',
  number: 1234,
  total: 250000,
  shipping: 60000,
  discount: 10000,
  salesChannel: 'WEBSITE' as const,
  addressSnapshot: { recipientName: 'زهرا احمدی', province: 'یزد', city: 'اردکان' },
  user: { firstName: null, lastName: null, phone: '09120000000' },
  items: [{ productTitle: 'حلواارده شکری', productWeight: '۵۰۰ گرم', quantity: 2 }],
};
describe('paid order notification', () => {
  it('summarizes the order in rial with recipient name and admin link', () => {
    const text = paidOrderMessage(order, {
      carrier: 'چاپار',
      adminOrigin: 'https://admin.sonatibehjati.ir/',
    });
    expect(text).toContain('سفارش جدید پرداخت شد');
    expect(text).toContain('شماره سفارش: ۱٬۲۳۴');
    expect(text).toContain('مشتری: زهرا احمدی');
    expect(text).toContain('مبلغ پرداختی: ۲٬۵۰۰٬۰۰۰ ریال');
    expect(text).toContain('ارسال: چاپار (۶۰۰٬۰۰۰ ریال)');
    expect(text).toContain('مقصد: یزد، اردکان');
    expect(text).toContain('• حلواارده شکری ۵۰۰ گرم × ۲');
    expect(text).toContain('https://admin.sonatibehjati.ir/admin/orders/order-1');
    expect(paidOrderMessage(order, { carrier: null, adminOrigin: 'x', test: true })).toMatch(
      /^🧪 \[آزمایشی\]/,
    );
  });
  it('never reaches the real chat from automated test runs', () => {
    expect(eitaaConfigured()).toBe(false);
  });
});
