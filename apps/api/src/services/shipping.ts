import type { ShippingService } from './contracts.js';
export class FixedShippingService implements ShippingService {
  constructor(private readonly cost: number) {
    if (!Number.isSafeInteger(cost) || cost < 0) throw new Error('Invalid shipping cost');
  }
  async calculateShipping() {
    return this.cost;
  }
}
