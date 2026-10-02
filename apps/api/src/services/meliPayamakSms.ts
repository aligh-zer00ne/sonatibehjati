import type { SMSService } from './contracts.js';
import { phoneSchema } from '@behjati/shared';
export interface SmsConfig {
  hostname: string;
  port: number;
  path: string;
  apiKey: string;
  bodyId: number;
}
export interface SmsRequest {
  to: string;
  bodyId: number;
  args: string[];
}
export interface SmsResponse {
  success: true;
  message: string;
  statusCode: number;
}
export class SMSError extends Error {
  constructor() {
    super('ارسال پیامک انجام نشد؛ دوباره تلاش کنید.');
  }
}
// Adapted from the user's SmsService.ts; Express uses this provider through SMSService.
export class MeliPayamakSMSService implements SMSService {
  constructor(
    private config: SmsConfig,
    private fetcher: typeof fetch = fetch,
  ) {
    if (
      !config.apiKey ||
      !config.path.startsWith('/') ||
      !config.path.includes('{apiKey}') ||
      !/^[a-z0-9.-]+$/i.test(config.hostname) ||
      !Number.isSafeInteger(config.port) ||
      config.port < 1 ||
      config.port > 65535 ||
      !Number.isSafeInteger(config.bodyId) ||
      config.bodyId <= 0
    )
      throw new SMSError();
  }
  async sendOTP(phoneNumber: string, code: string) {
    await this.send({ to: phoneNumber, bodyId: this.config.bodyId, args: [code] });
  }
  async send(request: SmsRequest): Promise<SmsResponse> {
    const parsed = phoneSchema.safeParse(request.to);
    if (!parsed.success) throw new SMSError();
    const path = this.config.path.replace('{apiKey}', encodeURIComponent(this.config.apiKey));
    try {
      const response = await this.fetcher(
        `https://${this.config.hostname}:${this.config.port}${path}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ ...request, to: parsed.data }),
          signal: AbortSignal.timeout(10000),
          redirect: 'error',
        },
      );
      if (!response.ok) throw new SMSError();
      const result: unknown = await response.json();
      const rawId =
        typeof result === 'object' && result !== null && 'recId' in result
          ? result.recId
          : undefined;
      const recId = typeof rawId === 'string' || typeof rawId === 'number' ? Number(rawId) : 0;
      if (!Number.isSafeInteger(recId) || recId <= 0) throw new SMSError();
      return { success: true, message: 'SMS accepted', statusCode: response.status };
    } catch {
      throw new SMSError();
    }
  }
}
