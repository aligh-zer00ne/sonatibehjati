import { formatNumber } from '@behjati/shared';
import { salesChannelLabels } from '@behjati/shared/sales';
import { db } from '../../database/client.js';
import { env } from '../../config/env.js';
import { sendEitaaMessage } from '../../services/eitaa.js';
import { orderShippingMethodLabel } from '../checkout/shipping-settings.js';

type PaidOrder = {
  id: string;
  number: number;
  total: number;
  shipping: number;
  discount: number;
  salesChannel: keyof typeof salesChannelLabels;
  addressSnapshot: unknown;
  user: { firstName: string | null; lastName: string | null; phone: string };
  items: Array<{ productTitle: string; productWeight: string; quantity: number }>;
};
const rials = (toman: number) => `${formatNumber(toman * 10)} ریال`;
/** Persian notification text; amounts follow the management panel (rial). */
export function paidOrderMessage(
  order: PaidOrder,
  options: { carrier: string | null; adminOrigin: string; test?: boolean },
) {
  const address = (order.addressSnapshot ?? {}) as Record<string, unknown>;
  const text = (key: string) =>
    typeof address[key] === 'string' ? String(address[key]).trim() : '';
  const name =
    [order.user.firstName, order.user.lastName].filter(Boolean).join(' ').trim() ||
    text('recipientName') ||
    'مشتری بدون نام';
  const destination = [text('province'), text('city')].filter(Boolean).join('، ');
  const lines = [
    `${options.test ? '🧪 [آزمایشی] ' : ''}🛍 سفارش جدید پرداخت شد`,
    '',
    `شماره سفارش: ${formatNumber(order.number)}`,
    `مشتری: ${name}`,
    `موبایل: ${order.user.phone}`,
    `مبلغ پرداختی: ${rials(order.total)}`,
    ...(order.discount ? [`تخفیف: ${rials(order.discount)}`] : []),
    `ارسال: ${options.carrier ?? 'تحویل حضوری'}${order.shipping ? ` (${rials(order.shipping)})` : ''}`,
    ...(destination ? [`مقصد: ${destination}`] : []),
    `کانال فروش: ${salesChannelLabels[order.salesChannel]}`,
    '',
    'اقلام:',
    ...order.items.map(
      (item) => `• ${item.productTitle} ${item.productWeight} × ${formatNumber(item.quantity)}`,
    ),
    '',
    `مشاهده در پنل: ${options.adminOrigin.replace(/\/$/, '')}/admin/orders/${order.id}`,
  ];
  return lines.join('\n');
}
/** Automated tests may only reach an explicitly configured local mock, never the real chat. */
export const eitaaConfigured = () =>
  Boolean(env.EITAA_BOT_TOKEN && env.EITAA_CHAT_ID) &&
  (env.NODE_ENV !== 'test' || Boolean(env.EITAA_API_BASE));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * Best effort: runs after the payment commit and never affects the customer's payment.
 * Verification itself runs once per order (paidAt is set once), so no duplicate is sent.
 */
export async function notifyPaidOrder(orderId: string, options: { test?: boolean } = {}) {
  if (!eitaaConfigured()) return false;
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { firstName: true, lastName: true, phone: true } },
      items: { select: { productTitle: true, productWeight: true, quantity: true } },
    },
  });
  if (!order) return false;
  const message = paidOrderMessage(order, {
    carrier: await orderShippingMethodLabel(order),
    adminOrigin: env.ADMIN_ORIGIN,
    test: options.test,
  });
  for (let attempt = 1; ; attempt++) {
    try {
      await sendEitaaMessage(
        { token: env.EITAA_BOT_TOKEN!, chatId: env.EITAA_CHAT_ID!, baseUrl: env.EITAA_API_BASE },
        message,
        { title: `سفارش ${formatNumber(order.number)}` },
      );
      return true;
    } catch (error) {
      if (attempt >= 3) {
        console.error(
          `Eitaa notification for order ${order.number} failed: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
        return false;
      }
      await wait(attempt * 3000);
    }
  }
}
