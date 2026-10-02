import type { SMSService } from './contracts.js';
import { MeliPayamakSMSService, type SmsConfig } from './meliPayamakSms.js';

export function createSMSService(environment: string, config: SmsConfig): SMSService {
  return environment === 'production'
    ? new MeliPayamakSMSService(config)
    : new DevelopmentSMSService();
}

export class DevelopmentSMSService implements SMSService {
  async sendOTP(phoneNumber: string, code: string) {
    if (process.env.NODE_ENV === 'production')
      throw new Error('Mock SMS cannot run in production.');
    console.info(`[Development SMS] ${phoneNumber}: ${code}`);
  }
}
