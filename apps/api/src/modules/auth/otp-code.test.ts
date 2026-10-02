import { describe, expect, it, vi } from 'vitest';
import { randomInt } from 'node:crypto';
import { createOtpCode } from './otp-code.js';

vi.mock('node:crypto', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:crypto')>()),
  randomInt: vi.fn(() => 42),
}));

describe('temporary development OTP', () => {
  it('uses the configured code only in development', () => {
    vi.mocked(randomInt).mockClear();
    expect(createOtpCode('development', '123456')).toBe('123456');
    expect(randomInt).not.toHaveBeenCalled();
  });
  it.each(['production', 'test'])('ignores the fixed code in %s', (environment) => {
    expect(createOtpCode(environment, '123456')).toBe('000042');
  });
  it('restores random codes when the development option is disabled', () => {
    expect(createOtpCode('development')).toBe('000042');
  });
});
