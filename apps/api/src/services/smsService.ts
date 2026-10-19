import type { SMSService } from './contracts.js';
import { MeliPayamakSMSService, type SmsConfig } from './meliPayamakSms.js';
import { MeliPayamakSoapService } from './meliPayamakSoap.js';

export function createSMSService(
  environment: string,
  config: SmsConfig,
  enabled = true,
  checkoutPaymentTest = false,
): SMSService {
  if (!enabled)
    return {
      async sendOTP() {
        throw new Error('Customer authentication is disabled.');
      },
    };
  if (checkoutPaymentTest) return { async sendOTP() {} };
  if (environment !== 'production') return new DevelopmentSMSService();
  return config.transport === 'soap'
    ? new MeliPayamakSoapService({
        username: config.username ?? '',
        password: config.password ?? '',
        bodyId: config.bodyId ?? 0,
      })
    : new MeliPayamakSMSService(config);
}

export class DevelopmentSMSService implements SMSService {
  async sendOTP(phoneNumber: string, code: string) {
    if (process.env.NODE_ENV === 'production')
      throw new Error('Mock SMS cannot run in production.');
    console.info(`[Development SMS] ${phoneNumber}: ${code}`);
  }
}
