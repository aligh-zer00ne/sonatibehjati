import type { PaymentService } from './contracts.js';
export class PendingPaymentService implements PaymentService {
  async createPayment(): Promise<{ redirectUrl: string }> {
    throw new Error('Payment provider is not configured.');
  }
}
