import type { OrderReceipt, AccountOrder, AdminOrder } from '../../generated/resolvers.js';
export type ReceiptSource = Omit<OrderReceipt, 'paidAt' | 'payments'> & { paidAt?: Date | null };
export type AccountOrderSource = Omit<AccountOrder, 'paidAt' | 'payments'> & {
  paidAt?: Date | null;
};
export type AdminOrderSource = Omit<AdminOrder, 'paidAt' | 'payments'> & { paidAt?: Date | null };
