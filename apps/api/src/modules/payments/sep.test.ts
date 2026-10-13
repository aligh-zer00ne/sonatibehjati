import { describe, expect, it } from 'vitest';
import { SepGateway } from './sep';
const response = (body: unknown) => async () => new Response(JSON.stringify(body), { status: 200 });
describe('SEP protocol', () => {
  it('sends exact saved rial amount, reservation and per-payment key', async () => {
    let payload: Record<string, unknown> = {};
    const gateway = new SepGateway('https://sep.shaparak.ir', async (_url, options) => {
      payload = JSON.parse(String(options?.body));
      return new Response(JSON.stringify({ status: 1, token: 'safe-token' }));
    });
    await expect(
      gateway.token({
        terminal: '12345678',
        amount: 2500000n,
        id: 'payment',
        callback: 'https://sonatibehjati.ir/payment',
        phone: '09123456789',
        sessionKey: 42,
      }),
    ).resolves.toBe('safe-token');
    expect(payload).toMatchObject({
      Action: 'Token',
      Amount: 2500000,
      TerminalId: '12345678',
      ResNum: 'payment',
      TxnRandomSessionKey: 42,
      TokenExpiryInMin: 20,
    });
  });
  it('reads the documented OrginalAmount and trimmed response keys', async () => {
    const gateway = new SepGateway(
      'https://sep.shaparak.ir',
      response({
        ' TransactionDetail': {
          RefNum: 'receipt',
          TerminalNumber: 12345678,
          OrginalAmount: 2500000,
          RRN: '123',
          StraceNo: '456',
        },
        ResultCode: 0,
        Success: true,
      }),
    );
    expect((await gateway.verify('12345678', 'receipt', 42)).detail).toEqual({
      refNum: 'receipt',
      terminal: '12345678',
      amount: 2500000n,
      rrn: '123',
      trace: '456',
    });
  });
  it('does not accept malformed or incomplete bank replies as successful money', async () => {
    const gateway = new SepGateway('https://sep.shaparak.ir', response({ Success: true }));
    await expect(gateway.verify('12345678', 'receipt', 42)).rejects.toThrow();
    const badToken = new SepGateway(
      'https://sep.shaparak.ir',
      response({ status: 0, errorDesc: 'failure' }),
    );
    await expect(
      badToken.token({
        terminal: '1',
        amount: 1n,
        id: 'x',
        callback: 'https://example.com',
        phone: '',
        sessionKey: 1,
      }),
    ).rejects.toThrow();
  });
  it('retains transaction details for duplicate verification and handles reverse retry', async () => {
    const gateway = new SepGateway(
      'https://sep.shaparak.ir',
      response({
        ResultCode: 2,
        Success: false,
        TransactionDetail: {
          RefNum: 'receipt',
          TerminalNumber: 12345678,
          OrginalAmount: '2500000',
        },
      }),
    );
    const verified = await gateway.verify('12345678', 'receipt', 42);
    expect(verified.code).toBe(2);
    expect(verified.detail?.amount).toBe(2500000n);
    await expect(gateway.reverse('12345678', 'receipt', 42)).resolves.toBe(true);
  });
  it('keeps HTTP/JSON outages distinct from a definitive decline', async () => {
    const gateway = new SepGateway(
      'https://sep.shaparak.ir',
      async () => new Response('not JSON', { status: 502 }),
    );
    await expect(gateway.verify('1', 'receipt', 1)).rejects.toThrow('Bank unavailable');
  });
});
