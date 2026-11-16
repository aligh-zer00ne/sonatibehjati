import type { OrderReceipt, AccountOrder, AdminOrder } from '../../generated/resolvers.js';
export type ReceiptSource = Omit<OrderReceipt, 'paidAt' | 'payments' | 'shippingMethodLabel'> & {
  paidAt?: Date | null;
};
export type AccountOrderSource = Omit<
  AccountOrder,
  'paidAt' | 'payments' | 'shippingMethodLabel'
> & {
  paidAt?: Date | null;
};
export type AdminOrderSource = Omit<
  AdminOrder,
  'paidAt' | 'payments' | 'storeInformation' | 'shippingMethodLabel'
> & {
  paidAt?: Date | null;
};
