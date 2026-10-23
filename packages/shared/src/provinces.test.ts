import { describe, expect, it } from 'vitest';
import { iranProvinces, provinceCode } from './provinces.js';
describe('Order province classification', () => {
  it('has exactly 31 distinct internal province IDs and round-trips all names', () => {
    expect(iranProvinces).toHaveLength(31);
    expect(new Set(iranProvinces.map((p) => p.code)).size).toBe(31);
    for (const p of iranProvinces) expect(provinceCode(p.name)).toBe(p.code);
  });
  it('normalizes actual address spelling without assigning ambiguous or unknown text', () => {
    expect(provinceCode(' استان يزد ')).toBe('IR-25');
    expect(provinceCode('اذربايجان\u200cشرقی')).toBe('IR-01');
    expect(provinceCode('چهارمحال بختیاری')).toBe('IR-08');
    expect(provinceCode('خراسان')).toBe('unknown');
    expect(provinceCode('')).toBe('unknown');
    expect(provinceCode('نامشخص')).toBe('unknown');
  });
});
