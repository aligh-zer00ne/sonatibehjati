export const paymentStatusLabels = {
  CREATING: 'در حال اتصال به درگاه',
  READY: 'در انتظار پرداخت',
  TOKEN_FAILED: 'اتصال به درگاه انجام نشد',
  CANCELED: 'پرداخت لغو شد',
  FAILED: 'پرداخت ناموفق',
  EXPIRED: 'مهلت پرداخت تمام شد',
  VERIFYING: 'در حال تأیید پرداخت',
  VERIFY_PENDING: 'در انتظار تأیید بانک',
  SUCCEEDED: 'پرداخت موفق',
  REFUND_PENDING: 'در انتظار برگشت وجه',
  REFUNDING: 'در حال بررسی برگشت وجه',
  REVERSED: 'وجه برگشت داده شد',
  REVIEW_REQUIRED: 'نیازمند بررسی پشتیبانی',
} as const;
export const pendingPaymentStates: readonly string[] = [
  'CREATING',
  'VERIFYING',
  'VERIFY_PENDING',
  'REFUND_PENDING',
  'REFUNDING',
  'REVIEW_REQUIRED',
];
export const retryablePaymentStates: readonly string[] = [
  'TOKEN_FAILED',
  'CANCELED',
  'FAILED',
  'EXPIRED',
  'REVERSED',
];

export interface PaymentResultData {
  id: string;
  status: keyof typeof paymentStatusLabels;
  amount: number;
  reference: string | null;
  traceNumber: string | null;
  rrn: string | null;
  reason: string | null;
  createdAt: string;
  verifiedAt: string | null;
  reversedAt: string | null;
  orderId: string;
  orderNumber: number;
  paidAt: string | null;
  redirectUrl: string | null;
  canRetry: boolean;
}
