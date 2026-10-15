export class GatewayUnavailable extends Error {}
export class TokenRejected extends Error {
  constructor(public readonly bankCode: number | null) {
    super('Bank rejected token');
  }
}
export type Verification = {
  code: number;
  success: boolean;
  detail: {
    refNum: string;
    terminal: string;
    amount: bigint;
    rrn: string | null;
    trace: string | null;
  } | null;
};
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new GatewayUnavailable('Invalid bank response');
  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [key.trim().toLowerCase(), val]),
  );
}
function integer(value: unknown): bigint | null {
  if (typeof value === 'number' && Number.isSafeInteger(value)) return BigInt(value);
  if (typeof value === 'string' && /^\d{1,17}$/.test(value)) return BigInt(value);
  return null;
}
export class SepGateway {
  constructor(
    private base = 'https://sep.shaparak.ir',
    private request: typeof fetch = fetch,
  ) {}
  private async post(path: string, payload: unknown) {
    try {
      const response = await this.request(this.base + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'error',
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new GatewayUnavailable('Bank HTTP error');
      const body = await response.text();
      if (body.length > 32000) throw new GatewayUnavailable('Oversized bank response');
      return record(JSON.parse(body));
    } catch {
      throw new GatewayUnavailable('Bank unavailable');
    }
  }
  async token(input: {
    terminal: string;
    amount: bigint;
    id: string;
    callback: string;
    phone: string;
    sessionKey: number;
  }) {
    const response = await this.post('/OnlinePG/OnlinePG', {
      Action: 'Token',
      TerminalId: input.terminal,
      Amount: Number(input.amount),
      ResNum: input.id,
      RedirectUrl: input.callback,
      ...(input.phone ? { CellNumber: input.phone } : {}),
      TxnRandomSessionKey: input.sessionKey,
      TokenExpiryInMin: 20,
    });
    if (
      !(response.status === 1 || response.status === '1') ||
      typeof response.token !== 'string' ||
      !/^[\w+/=-]{1,512}$/.test(response.token)
    )
      throw new TokenRejected(
        /^[-]?\d{1,9}$/.test(String(response.errorcode)) ? Number(response.errorcode) : null,
      );
    return response.token;
  }
  async verify(terminal: string, refNum: string, sessionKey: number): Promise<Verification> {
    const value = await this.post('/verifyTxnRandomSessionkey/ipg/VerifyTransaction', {
      TerminalNumber: Number(terminal),
      RefNum: refNum,
      TxnRandomSessionKey: sessionKey,
    });
    const code =
      typeof value.resultcode === 'number' ||
      (typeof value.resultcode === 'string' && /^-?\d+$/.test(value.resultcode))
        ? Number(value.resultcode)
        : NaN;
    if (!Number.isSafeInteger(code)) throw new GatewayUnavailable('Missing bank result');
    let detail: Verification['detail'] = null;
    if (value.transactiondetail) {
      const data = record(value.transactiondetail);
      const amount = integer(data.orginalamount ?? data.originalamount);
      if (
        typeof data.refnum === 'string' &&
        integer(data.terminalnumber) !== null &&
        amount !== null
      )
        detail = {
          refNum: data.refnum,
          terminal: String(data.terminalnumber),
          amount,
          rrn: typeof data.rrn === 'string' ? data.rrn.slice(0, 100) : null,
          trace:
            typeof data.straceno === 'string' || typeof data.straceno === 'number'
              ? String(data.straceno).slice(0, 100)
              : null,
        };
    }
    return { code, success: value.success === true, detail };
  }
  async reverse(terminal: string, refNum: string, sessionKey: number) {
    const result = await this.post('/verifyTxnRandomSessionkey/ipg/ReverseTransaction', {
      TerminalNumber: Number(terminal),
      RefNum: refNum,
      TxnRandomSessionKey: sessionKey,
    });
    return (
      (result.success === true && Number(result.resultcode) === 0) ||
      Number(result.resultcode) === 2
    );
  }
}
