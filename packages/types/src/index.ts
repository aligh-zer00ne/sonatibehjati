export const ORDER_STATUSES = [
  'CREATED',
  'PENDING_PAYMENT',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export interface CartLine {
  productId: string;
  quantity: number;
}
