import { describe, expect, it } from 'vitest';
import { smsHref } from './customer-messages';

describe('phone SMS composer', () => {
  it('keeps the full Persian body and URL encoded for Android and iOS', () => {
    const text = 'سلام\nhttps://example.test/pay?a=1&b=2\nکد: ۱۲۳۴';
    for (const [ua, separator] of [
      ['Android', '?'],
      ['iPhone', '&'],
      ['iPad', '&'],
    ]) {
      const href = smsHref('۰۹۱۲-۳۴۵۶۷۸۹', text, ua)!;
      expect(href.startsWith(`sms:09123456789${separator}body=`)).toBe(true);
      expect(decodeURIComponent(href.split('body=')[1]!)).toBe(text);
    }
  });
  it('normalizes country prefix and refuses unsafe or missing recipients', () => {
    expect(smsHref('989123456789', 'متن', 'Android')).toMatch(/^sms:\+989123456789/);
    for (const value of ['', '123', '09123456789?body=bad', 'javascript:alert(1)'])
      expect(smsHref(value, 'test', 'Android')).toBeUndefined();
  });
});
