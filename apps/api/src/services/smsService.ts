import type { SMSService } from './contracts.js';
export class DevelopmentSMSService implements SMSService {
  async sendOTP(phoneNumber: string, code: string) {
    if (process.env.NODE_ENV === 'production')
      throw new Error('Mock SMS cannot run in production.');
    console.info(`[Development SMS] ${phoneNumber}: ${code}`);
  }
}
