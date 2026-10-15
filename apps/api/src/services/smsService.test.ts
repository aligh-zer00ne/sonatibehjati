import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSMSService } from './smsService.js';

const config = {
  hostname: 'console.melipayamak.com',
  port: 443,
  path: '/api/send/shared/{apiKey}',
  apiKey: 'test-only-key',
  bodyId: 123,
};
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('SMS environment boundary', () => {
  it('sends no SMS and logs no code in explicit production checkout testing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const logger = vi.spyOn(console, 'info');
    await createSMSService('production', { ...config, apiKey: '', bodyId: 0 }, true, true).sendOTP(
      '09000000001',
      '123456',
    );
    expect(fetcher).not.toHaveBeenCalled();
    expect(logger).not.toHaveBeenCalled();
  });
  it.each(['development', 'test'])('never contacts the real provider in %s', async (mode) => {
    vi.stubEnv('NODE_ENV', mode);
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    vi.spyOn(console, 'info').mockImplementation(() => {});
    await createSMSService(mode, config).sendOTP('09000000001', '12345');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('disables SMS entirely in production gateway review without provider credentials', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const logger = vi.spyOn(console, 'info');
    await expect(
      createSMSService('production', { ...config, apiKey: '', bodyId: 0 }, false).sendOTP(
        '09000000001',
        '12345',
      ),
    ).rejects.toThrow('disabled');
    expect(fetcher).not.toHaveBeenCalled();
    expect(logger).not.toHaveBeenCalled();
  });
  it('uses the real provider in production without logging the OTP', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ recId: 123 })));
    vi.stubGlobal('fetch', fetcher);
    const logger = vi.spyOn(console, 'info');
    await createSMSService('production', config).sendOTP('09000000001', '00042');
    expect(fetcher).toHaveBeenCalledExactlyOnceWith(
      'https://console.melipayamak.com:443/api/send/shared/test-only-key',
      expect.objectContaining({
        body: JSON.stringify({ to: '09000000001', bodyId: 123, args: ['00042'] }),
      }),
    );
    expect(logger).not.toHaveBeenCalled();
  });
});
