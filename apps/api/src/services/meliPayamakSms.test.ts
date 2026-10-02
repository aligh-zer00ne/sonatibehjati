import { describe, expect, it, vi, afterEach } from 'vitest';
import { MeliPayamakSMSService } from './meliPayamakSms.js';
import { DevelopmentSMSService } from './smsService.js';
const config = {
  hostname: 'console.melipayamak.com',
  port: 443,
  path: '/api/send/shared/{apiKey}',
  apiKey: 'test/key',
  bodyId: 123,
};
afterEach(() => vi.unstubAllEnvs());
describe('user-supplied SMS adapter', () => {
  it('sends the template to the configured path and accepts a positive recId', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ recId: '1234567' }), { status: 200 }));
    const service = new MeliPayamakSMSService(config, fetcher);
    await service.sendOTP('۰۹۰۰۰۰۰۰۰۰۱', '123456');
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      'https://console.melipayamak.com:443/api/send/shared/test%2Fkey',
    );
    const request = fetcher.mock.calls[0]?.[1];
    expect(JSON.parse(String(request?.body))).toEqual({
      to: '09000000001',
      bodyId: 123,
      args: ['123456'],
    });
    expect(request?.redirect).toBe('error');
    expect(request?.signal).toBeInstanceOf(AbortSignal);
  });
  it.each([{}, { recId: 0 }, { recId: -5 }, { recId: 'not-a-number' }, { recId: true }])(
    'rejects provider errors safely %j',
    async (payload) => {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(JSON.stringify(payload)));
      await expect(
        new MeliPayamakSMSService(config, fetcher).sendOTP('09000000001', '123456'),
      ).rejects.toThrow('ارسال پیامک انجام نشد');
    },
  );
  it('does not disclose keys or provider responses on failure', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error('secret test/key response body'));
    await expect(
      new MeliPayamakSMSService(config, fetcher).sendOTP('09000000001', '123456'),
    ).rejects.not.toThrow('test/key');
    expect(() => new MeliPayamakSMSService({ ...config, bodyId: 0 })).toThrow();
  });
  it('never logs development OTPs in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const logger = vi.spyOn(console, 'info');
    await expect(new DevelopmentSMSService().sendOTP('09000000001', '123456')).rejects.toThrow();
    expect(logger).not.toHaveBeenCalled();
    logger.mockRestore();
  });
});
