import { formatNumber } from '@behjati/shared';

// The existing API stores toman; the management interface uses rial.
export const toRials = (amount: number) => Math.round(amount * 10);
export const fromRials = (amount: number) => amount / 10;
export const formatAdminPrice = (amount: number) => `${formatNumber(toRials(amount))} ریال`;
