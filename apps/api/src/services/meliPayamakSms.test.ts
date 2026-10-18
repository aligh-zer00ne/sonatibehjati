import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { MeliPayamakSMSService } from './meliPayamakSms.js';
import { DevelopmentSMSService } from './smsService.js';
const config = {
  hostname: 'console.melipayamak.com',
  port: 443,
  path: '/api/send/shared/{apiKey}',
  apiKey: 'test/key',
  bodyId: 123,
};
beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
describe('user-supplied SMS adapter', () => {
  it.each(['123456', '1234', '12a45', '۱۲۳۴۵'])(
    'rejects an invalid production OTP before contacting the provider: %s',
    async (code) => {
      const fetcher = vi.fn<typeof fetch>();
      await expect(
        new MeliPayamakSMSService(config, fetcher).sendOTP('09000000001', code),
      ).rejects.toThrow();
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
  it('sends the template to the configured path and accepts a positive recId', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ recId: '1234567' }), { status: 200 }));
    const service = new MeliPayamakSMSService(config, fetcher);
    await service.sendOTP('۰۹۰۰۰۰۰۰۰۰۱', '12345');
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      'https://console.melipayamak.com:443/api/send/shared/test%2Fkey',
    );
    const request = fetcher.mock.calls[0]?.[1];
    expect(JSON.parse(String(request?.body))).toEqual({
      to: '09000000001',
      bodyId: 123,
      args: ['12345'],
    });
    expect(request?.redirect).toBe('error');
    expect(request?.signal).toBeInstanceOf(AbortSignal);
    expect(console.warn).not.toHaveBeenCalled();
  });
  it('records a redacted provider rejection while keeping the public error generic', async () => {
    const phone = '09000000001';
    const code = '01234';
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          recId: -5,
          status: `Template unavailable\n${config.apiKey} ${encodeURIComponent(config.apiKey)} ${phone} ${code} https://example.invalid/private`,
          request: { phone, code, key: config.apiKey },
        }),
      ),
    );
    await expect(new MeliPayamakSMSService(config, fetcher).sendOTP(phone, code)).rejects.toThrow(
      'ارسال پیامک انجام نشد؛ دوباره تلاش کنید.',
    );
    expect(console.warn).toHaveBeenCalledOnce();
    expect(console.warn).toHaveBeenCalledWith(
      '[SMS delivery failed]',
      expect.objectContaining({
        reason: 'provider_rejected',
        httpStatus: 200,
        providerCode: -5,
        bodyId: config.bodyId,
        providerStatus: expect.stringContaining('Template unavailable'),
      }),
    );
    const log = JSON.stringify(vi.mocked(console.warn).mock.calls);
    for (const secret of [
      config.apiKey,
      encodeURIComponent(config.apiKey),
      phone,
      code,
      'https://example.invalid/private',
    ])
      expect(log).not.toContain(secret);
  });
  it('distinguishes HTTP errors from malformed successful responses without logging HTML', async () => {
    for (const [status, reason] of [
      [403, 'http_error'],
      [200, 'invalid_response'],
    ] as const) {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response('<html>private body</html>', { status }));
      await expect(
        new MeliPayamakSMSService(config, fetcher).sendOTP('09000000001', '12345'),
      ).rejects.toThrow();
      expect(console.warn).toHaveBeenLastCalledWith(
        '[SMS delivery failed]',
        expect.objectContaining({ reason, httpStatus: status }),
      );
    }
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain('private body');
  });
  it('records only known transport codes and timeout categories without raw errors', async () => {
    for (const [error, detail] of [
      [
        new Error('private URL', { cause: { code: 'ENOTFOUND' } }),
        { reason: 'network_error', transportCode: 'ENOTFOUND' },
      ],
      [new DOMException('private URL', 'TimeoutError'), { reason: 'timeout' }],
      [
        new Error('private URL', { cause: { code: 'private-secret' } }),
        { reason: 'network_error' },
      ],
    ] as const) {
      const fetcher = vi.fn<typeof fetch>().mockRejectedValue(error);
      await expect(
        new MeliPayamakSMSService(config, fetcher).sendOTP('09000000001', '12345'),
      ).rejects.toThrow();
      expect(console.warn).toHaveBeenLastCalledWith('[SMS delivery failed]', {
        provider: 'melipayamak',
        bodyId: config.bodyId,
        ...detail,
      });
    }
    const log = JSON.stringify(vi.mocked(console.warn).mock.calls);
    expect(log).not.toContain('private URL');
    expect(log).not.toContain('private-secret');
  });
  it.each([{}, { recId: 0 }, { recId: -5 }, { recId: 'not-a-number' }, { recId: true }])(
    'rejects provider errors safely %j',
    async (payload) => {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(JSON.stringify(payload)));
      await expect(
        new MeliPayamakSMSService(config, fetcher).sendOTP('09000000001', '12345'),
      ).rejects.toThrow('ارسال پیامک انجام نشد');
    },
  );
  it('does not disclose keys or provider responses on failure', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error('secret test/key response body'));
    await expect(
      new MeliPayamakSMSService(config, fetcher).sendOTP('09000000001', '12345'),
    ).rejects.not.toThrow('test/key');
    expect(() => new MeliPayamakSMSService({ ...config, bodyId: 0 })).toThrow();
  });
  it('never logs development OTPs in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const logger = vi.spyOn(console, 'info');
    await expect(new DevelopmentSMSService().sendOTP('09000000001', '12345')).rejects.toThrow();
    expect(logger).not.toHaveBeenCalled();
    logger.mockRestore();
  });
});
