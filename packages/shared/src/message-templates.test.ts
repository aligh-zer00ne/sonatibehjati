import { describe, expect, it } from 'vitest';
import {
  defaultMessageTemplates,
  messageTemplatesSchema,
  renderMessage,
  shipmentInputSchema,
} from './message-templates.js';
import { canOpenAdminPath } from './permissions.js';

describe('shop customer messages', () => {
  it('accepts defaults and rejects missing critical links/tracking or unknown placeholders', () => {
    expect(messageTemplatesSchema.safeParse(defaultMessageTemplates).success).toBe(true);
    for (const body of [
      'سلام',
      '{لینک_پرداخت} {کد_رهگیری}',
      '{لینک_پرداخت} {ناشناخته}',
      '{لینک_پرداخت} {',
    ])
      expect(
        messageTemplatesSchema.safeParse([{ ...defaultMessageTemplates[0], body }]).success,
      ).toBe(false);
    expect(
      messageTemplatesSchema.safeParse([defaultMessageTemplates[0], defaultMessageTemplates[0]])
        .success,
    ).toBe(false);
  });
  it('substitutes exactly once and preserves links, newline and literal customer values', () => {
    expect(
      renderMessage('{نام_مشتری}\n{لینک_پرداخت}', {
        نام_مشتری: '{مبلغ}',
        لینک_پرداخت: 'https://example.test/pay?a=1&b=2',
      }),
    ).toBe('{مبلغ}\nhttps://example.test/pay?a=1&b=2');
  });
  it('normalizes tracking digits but rejects URL and control characters', () => {
    const base = {
      orderId: 'order',
      shippingMethod: 'TIPAX',
      trackingNumber: '۱۲۳۴۵۶',
      expectedUpdatedAt: new Date().toISOString(),
    };
    expect(shipmentInputSchema.parse(base).trackingNumber).toBe('123456');
    for (const trackingNumber of ['https://test', '1\n2', 'a'.repeat(101)])
      expect(shipmentInputSchema.safeParse({ ...base, trackingNumber }).success).toBe(false);
  });
  it('grants template management separately from sending existing order templates', () => {
    expect(
      canOpenAdminPath({ role: 'STAFF', permissions: ['ORDERS'] }, '/admin/message-templates'),
    ).toBe(false);
    expect(
      canOpenAdminPath({ role: 'STAFF', permissions: ['MESSAGES'] }, '/admin/message-templates'),
    ).toBe(true);
  });
});
