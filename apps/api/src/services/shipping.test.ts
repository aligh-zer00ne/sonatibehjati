import { describe, it, expect } from 'vitest';
import { FixedShippingService } from './shipping.js';
describe('fixed shipping adapter', () => {
  it('returns the configured cost', async () => {
    expect(await new FixedShippingService(60000).calculateShipping()).toBe(60000);
  });
  it('rejects negative or fractional amounts', () => {
    expect(() => new FixedShippingService(-1)).toThrow();
    expect(() => new FixedShippingService(0.5)).toThrow();
  });
});
