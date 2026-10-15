import { describe, expect, it, vi } from 'vitest';
import { randomInt } from 'node:crypto';
import { createOtpCode } from './otp-code.js';

vi.mock('node:crypto', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:crypto')>()),
  randomInt: vi.fn(() => 42),
}));

describe('OTP modes', () => {
  it('uses six digits in production only for explicit checkout payment testing', () => {
    vi.mocked(randomInt).mockClear();
    expect(createOtpCode('production', undefined, true)).toBe('123456');
    expect(randomInt).not.toHaveBeenCalled();
    expect(createOtpCode('production', '123456', false)).toBe('00042');
  });
  it('uses the configured code only in development', () => {
    vi.mocked(randomInt).mockClear();
    expect(createOtpCode('development', '12345')).toBe('12345');
    expect(randomInt).not.toHaveBeenCalled();
  });
  it.each(['production', 'test'])('ignores the fixed code in %s', (environment) => {
    expect(createOtpCode(environment, '12345')).toBe('00042');
  });
  it('keeps older preview settings usable with a five-digit code', () => {
    expect(createOtpCode('development', '123456')).toBe('12345');
  });
  it('restores random codes when the development option is disabled', () => {
    expect(createOtpCode('development')).toBe('00042');
    expect(randomInt).toHaveBeenLastCalledWith(0, 100000);
  });
});
