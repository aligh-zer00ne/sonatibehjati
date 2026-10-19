import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { XMLParser } from 'fast-xml-parser';
import { MeliPayamakSoapService } from './meliPayamakSoap.js';
import { createSMSService } from './smsService.js';

const config = { username: 'fixture-user', password: 'fixture<&"password', bodyId: 559650 };
const result = (receipt: string) =>
  `<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><SendByBaseNumberResponse xmlns="http://tempuri.org/"><SendByBaseNumberResult>${receipt}</SendByBaseNumberResult></SendByBaseNumberResponse></s:Body></s:Envelope>`;
beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('SOAP pattern SMS', () => {
  it('sends one escaped HTTPS SOAP request with a five-digit array argument and the approved bodyId', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(result('1234567890123456789')));
    const service = new MeliPayamakSoapService(config, fetcher);
    expect(await service.sendOTP('۰۹۰۰۰۰۰۰۰۰۱', '00042')).toBeUndefined();
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, options] = fetcher.mock.calls[0];
    expect(url).toBe('https://api.payamak-panel.com/post/send.asmx');
    expect(options?.headers).toEqual({
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: '"http://tempuri.org/SendByBaseNumber"',
    });
    expect(options?.redirect).toBe('error');
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    const xml = String(options?.body);
    expect(xml).not.toContain(config.password);
    expect(xml).toContain('<SendByBaseNumber xmlns="http://tempuri.org/">');
    const parsed = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
      parseTagValue: false,
    }).parse(xml);
    expect(parsed.Envelope.Body.SendByBaseNumber).toEqual({
      username: config.username,
      password: config.password,
      text: { string: '00042' },
      to: '09000000001',
      bodyId: '559650',
    });
    expect(console.warn).not.toHaveBeenCalled();
  });
  it('preserves receipt IDs beyond JavaScript safe-integer precision', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(result('1234567890123456789')));
    expect(
      await new MeliPayamakSoapService(config, fetcher).sendByBaseNumber(
        ['00042'],
        '09000000001',
        559650,
      ),
    ).toBe('1234567890123456789');
  });
  it.each(['123456', '1234', '12a45', '۱۲۳۴۵'])(
    'rejects an invalid OTP without a request: %s',
    async (code) => {
      const fetcher = vi.fn<typeof fetch>();
      await expect(
        new MeliPayamakSoapService(config, fetcher).sendOTP('09000000001', code),
      ).rejects.toThrow();
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
  it.each([-110, -6, -1, 0])(
    'rejects provider code %s without logging credentials or retrying',
    async (code) => {
      const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(result(String(code))));
      await expect(
        new MeliPayamakSoapService(config, fetcher).sendOTP('09000000001', '00042'),
      ).rejects.toThrow('ارسال پیامک انجام نشد');
      expect(fetcher).toHaveBeenCalledOnce();
      expect(console.warn).toHaveBeenCalledWith('[SMS delivery failed]', {
        provider: 'melipayamak',
        mode: 'soap',
        bodyId: 559650,
        reason: 'provider_rejected',
        httpStatus: 200,
        providerCode: code,
      });
      const log = JSON.stringify(vi.mocked(console.warn).mock.calls);
      for (const secret of [config.username, config.password, '09000000001', '00042'])
        expect(log).not.toContain(secret);
    },
  );
  it.each([
    '<html>upstream error</html>',
    result('not-a-receipt'),
    result('123</SendByBaseNumberResult><SendByBaseNumberResult>456'),
    '<Envelope><Body>',
    '<!DOCTYPE Envelope [<!ENTITY secret "12345">]>' + result('&secret;'),
    ' '.repeat(65537),
  ])('rejects malformed or ambiguous SOAP responses without raw-body logs', async (xml) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(xml));
    await expect(
      new MeliPayamakSoapService(config, fetcher).sendOTP('09000000001', '00042'),
    ).rejects.toThrow();
    expect(console.warn).toHaveBeenLastCalledWith(
      '[SMS delivery failed]',
      expect.objectContaining({ reason: 'invalid_response' }),
    );
  });
  it('keeps SOAP fault details private', async () => {
    const xml =
      '<Envelope><Body><Fault><faultstring>fixture-user password 09000000001 00042</faultstring></Fault></Body></Envelope>';
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(xml));
    await expect(
      new MeliPayamakSoapService(config, fetcher).sendOTP('09000000001', '00042'),
    ).rejects.toThrow();
    expect(console.warn).toHaveBeenLastCalledWith(
      '[SMS delivery failed]',
      expect.objectContaining({ reason: 'soap_fault' }),
    );
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain('00042');
  });
  it('keeps HTTP failures and raw network errors private', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(config.password, { status: 500 }))
      .mockRejectedValueOnce(new Error(config.password));
    const service = new MeliPayamakSoapService(config, fetcher);
    await expect(service.sendOTP('09000000001', '00042')).rejects.toThrow();
    expect(console.warn).toHaveBeenLastCalledWith(
      '[SMS delivery failed]',
      expect.objectContaining({ reason: 'http_error', httpStatus: 500 }),
    );
    await expect(service.sendOTP('09000000001', '00042')).rejects.toThrow();
    expect(console.warn).toHaveBeenLastCalledWith(
      '[SMS delivery failed]',
      expect.objectContaining({ reason: 'network_error' }),
    );
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain(config.password);
  });
  it('requires panel credentials and a valid bodyId without falling back to a console token', () => {
    expect(() => new MeliPayamakSoapService({ ...config, username: '' })).toThrow();
    expect(() => new MeliPayamakSoapService({ ...config, password: '' })).toThrow();
    expect(() => new MeliPayamakSoapService({ ...config, bodyId: 2147483648 })).toThrow();
    const provider = {
      hostname: '',
      port: 443,
      path: '',
      apiKey: 'console-key',
      bodyId: 559650,
      transport: 'soap' as const,
    };
    expect(() => createSMSService('production', provider)).toThrow();
    expect(createSMSService('development', provider)).toBeDefined();
    expect(createSMSService('production', provider, false)).toBeDefined();
    expect(createSMSService('production', provider, true, true)).toBeDefined();
  });
  it('selects SOAP in production using only panel credentials and preserves the supplied code', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(result('1234567')));
    vi.stubGlobal('fetch', fetcher);
    const service = createSMSService('production', {
      ...config,
      transport: 'soap',
      hostname: '',
      port: 443,
      path: '',
      apiKey: '',
    });
    expect(await service.sendOTP('09000000001', '00042')).toBeUndefined();
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
