import type { SMSService } from './contracts.js';
import { phoneSchema, OTP_LENGTH } from '@behjati/shared';
export interface SmsConfig {
  hostname: string;
  port: number;
  path: string;
  apiKey: string;
  bodyId?: number;
  transport?: 'console' | 'soap';
  username?: string;
  password?: string;
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
  code?: string;
}
type SmsFailure = {
  reason:
    | 'configuration'
    | 'invalid_request'
    | 'http_error'
    | 'provider_rejected'
    | 'invalid_response'
    | 'invalid_otp'
    | 'soap_fault'
    | 'network_error'
    | 'timeout';
  httpStatus?: number;
  providerCode?: number;
  providerStatus?: string;
  transportCode?: string;
  otpCodeLength?: number;
};
export class SMSError extends Error {
  constructor(readonly diagnostic: SmsFailure = { reason: 'configuration' }) {
    super('ارسال پیامک انجام نشد؛ دوباره تلاش کنید.');
  }
}
export function classifySmsError(error: unknown): SMSError {
  if (error instanceof SMSError) return error;
  const cause = error instanceof Error ? error.cause : undefined;
  const code =
    typeof cause === 'object' && cause !== null && 'code' in cause ? cause.code : undefined;
  const knownCodes = [
    'ENOTFOUND',
    'EAI_AGAIN',
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'UND_ERR_CONNECT_TIMEOUT',
    'CERT_HAS_EXPIRED',
    'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
    'DEPTH_ZERO_SELF_SIGNED_CERT',
  ];
  return new SMSError({
    reason:
      error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)
        ? 'timeout'
        : 'network_error',
    ...(typeof code === 'string' && knownCodes.includes(code) ? { transportCode: code } : {}),
  });
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
      (config.path !== '/api/send/otp/{apiKey}' &&
        (!Number.isSafeInteger(config.bodyId) || (config.bodyId ?? 0) <= 0))
    )
      throw new SMSError();
  }
  async sendOTP(phoneNumber: string, code: string) {
    if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code))
      throw new SMSError({ reason: 'invalid_request' });
    const result = await this.send({
      to: phoneNumber,
      bodyId: this.config.bodyId ?? 0,
      args: [code],
    });
    return result.code;
  }
  async send(request: SmsRequest): Promise<SmsResponse> {
    const parsed = phoneSchema.safeParse(request.to);
    if (!parsed.success) throw new SMSError({ reason: 'invalid_request' });
    const path = this.config.path.replace('{apiKey}', encodeURIComponent(this.config.apiKey));
    const consoleOtp = this.config.path === '/api/send/otp/{apiKey}';
    try {
      const response = await this.fetcher(
        `https://${this.config.hostname}:${this.config.port}${path}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(consoleOtp ? { to: parsed.data } : { ...request, to: parsed.data }),
          signal: AbortSignal.timeout(10000),
          redirect: 'error',
        },
      );
      const result: unknown = await response.json().catch(() => undefined);
      const rawId =
        typeof result === 'object' && result !== null && 'recId' in result
          ? result.recId
          : undefined;
      const recId = typeof rawId === 'string' || typeof rawId === 'number' ? Number(rawId) : 0;
      const rawCode =
        typeof result === 'object' && result !== null && 'code' in result ? result.code : undefined;
      // The OTP endpoint returns the secret code, not a message receipt ID.
      const deliveredCode =
        typeof rawCode === 'string' && new RegExp(`^\\d{${OTP_LENGTH}}$`).test(rawCode)
          ? rawCode
          : undefined;
      const accepted = consoleOtp
        ? deliveredCode !== undefined
        : Number.isSafeInteger(recId) && recId > 0;
      if (!response.ok || !accepted) {
        const status =
          typeof result === 'object' && result !== null && 'status' in result
            ? result.status
            : undefined;
        // Only the provider's status is useful here. Never log a raw response,
        // request, error/URL (the URL contains the API key), phone or OTP.
        let providerStatus = typeof status === 'string' ? status : '';
        for (const secret of [
          this.config.apiKey,
          encodeURIComponent(this.config.apiKey),
          request.to,
          parsed.data,
          ...request.args,
          ...(consoleOtp && (typeof rawCode === 'string' || typeof rawCode === 'number')
            ? [String(rawCode)]
            : []),
        ])
          if (secret) providerStatus = providerStatus.split(secret).join('[redacted]');
        providerStatus = providerStatus
          .replace(/https?:\/\/\S+/gi, '[url]')
          .replace(/[0-9۰-۹٠-٩]{4,}/g, '[redacted]')
          .replace(/[\p{Cc}\p{Cf}]/gu, ' ')
          .slice(0, 240);
        throw new SMSError({
          reason: !response.ok
            ? 'http_error'
            : result === undefined
              ? 'invalid_response'
              : consoleOtp && typeof rawCode === 'string' && /^\d+$/.test(rawCode)
                ? 'invalid_otp'
                : 'provider_rejected',
          httpStatus: response.status,
          ...(Number.isSafeInteger(recId) && recId < 0 && recId >= -9999
            ? { providerCode: recId }
            : {}),
          ...(providerStatus ? { providerStatus } : {}),
          ...(consoleOtp && typeof rawCode === 'string' && /^\d+$/.test(rawCode)
            ? { otpCodeLength: rawCode.length }
            : {}),
        });
      }
      return {
        success: true,
        message: 'SMS accepted',
        statusCode: response.status,
        ...(consoleOtp ? { code: deliveredCode } : {}),
      };
    } catch (error) {
      const failure = classifySmsError(error);
      console.warn('[SMS delivery failed]', {
        provider: 'melipayamak',
        ...(consoleOtp ? { mode: 'otp' } : { bodyId: this.config.bodyId }),
        ...failure.diagnostic,
      });
      throw failure;
    }
  }
}
