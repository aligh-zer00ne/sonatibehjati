import { XMLBuilder, XMLParser, XMLValidator } from 'fast-xml-parser';
import { OTP_LENGTH, phoneSchema } from '@behjati/shared';
import type { SMSService } from './contracts.js';
import { classifySmsError, SMSError } from './meliPayamakSms.js';

export interface SoapSmsConfig {
  username: string;
  password: string;
  bodyId: number;
}
const endpoint = 'https://api.payamak-panel.com/post/send.asmx';
const namespace = 'http://tempuri.org/';
const soapNamespace = 'http://schemas.xmlsoap.org/soap/envelope/';
const field = (value: unknown, key: string): unknown =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)[key]
    : undefined;

// SendByBaseNumber's text argument is ArrayOfString in the official WSDL.
// Keep credentials and the five-digit code inside an HTTPS SOAP request.
export class MeliPayamakSoapService implements SMSService {
  constructor(
    private config: SoapSmsConfig,
    private fetcher: typeof fetch = fetch,
  ) {
    if (
      !config.username.trim() ||
      !config.password.trim() ||
      !Number.isSafeInteger(config.bodyId) ||
      config.bodyId <= 0 ||
      config.bodyId > 2147483647
    )
      throw new SMSError({ reason: 'configuration' });
  }
  async sendOTP(phoneNumber: string, code: string): Promise<void> {
    await this.sendByBaseNumber([code], phoneNumber, this.config.bodyId);
  }
  async sendByBaseNumber(text: string[], to: string, bodyId: number): Promise<string> {
    const phone = phoneSchema.safeParse(to);
    if (
      !phone.success ||
      text.length !== 1 ||
      !new RegExp(`^\\d{${OTP_LENGTH}}$`).test(text[0] ?? '') ||
      !Number.isSafeInteger(bodyId) ||
      bodyId <= 0 ||
      bodyId > 2147483647
    )
      throw new SMSError({ reason: 'invalid_request' });
    const xml =
      '<?xml version="1.0" encoding="utf-8"?>' +
      new XMLBuilder({ ignoreAttributes: false }).build({
        'soap:Envelope': {
          '@_xmlns:soap': soapNamespace,
          'soap:Body': {
            SendByBaseNumber: {
              '@_xmlns': namespace,
              username: this.config.username,
              password: this.config.password,
              text: { string: text },
              to: phone.data,
              bodyId,
            },
          },
        },
      });
    try {
      const response = await this.fetcher(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: `"${namespace}SendByBaseNumber"`,
        },
        body: xml,
        signal: AbortSignal.timeout(10000),
        redirect: 'error',
      });
      if (!response.ok) throw new SMSError({ reason: 'http_error', httpStatus: response.status });
      const source = await response.text();
      if (
        source.length > 65536 ||
        /<!\s*(DOCTYPE|ENTITY)\b/i.test(source) ||
        XMLValidator.validate(source) !== true
      )
        throw new SMSError({ reason: 'invalid_response', httpStatus: response.status });
      const parsed: unknown = new XMLParser({
        removeNSPrefix: true,
        parseTagValue: false,
        processEntities: false,
      }).parse(source);
      const body = field(field(parsed, 'Envelope'), 'Body');
      if (field(body, 'Fault') !== undefined)
        throw new SMSError({ reason: 'soap_fault', httpStatus: response.status });
      const raw = field(field(body, 'SendByBaseNumberResponse'), 'SendByBaseNumberResult');
      if (typeof raw !== 'string' || !/^-?\d{1,20}$/.test(raw.trim()))
        throw new SMSError({ reason: 'invalid_response', httpStatus: response.status });
      const receipt = BigInt(raw.trim());
      if (receipt <= 0n)
        throw new SMSError({
          reason: 'provider_rejected',
          httpStatus: response.status,
          ...(receipt >= -9999n ? { providerCode: Number(receipt) } : {}),
        });
      return receipt.toString();
    } catch (error) {
      const failure = classifySmsError(error);
      // Never log XML, credentials, phone, OTP, fault text or raw exceptions.
      console.warn('[SMS delivery failed]', {
        provider: 'melipayamak',
        mode: 'soap',
        bodyId,
        ...failure.diagnostic,
      });
      throw failure;
    }
  }
}
