import ManualOrderEditDialog from './ManualOrderEditDialog';
import { hasPermission } from '@behjati/shared/permissions';
import { useAdmin } from '../auth/AdminProvider';
import { useState } from 'react';
import AccountStatus from './AccountStatus';
import { formatAdminPrice } from '../lib/money';
import { salesChannelLabels, shippingMethodLabel } from '@behjati/shared/sales';
import { formatNumber, formatDate } from '@behjati/shared';
import type { AdminOrderSummaryFieldsFragment } from '../generated/graphql';
import { customerName, persianDigits } from '../lib/format';
import AdminIcon from './AdminIcon';
import OrderStatus from './OrderStatus';
import QuickOrderPrint from './QuickOrderPrint';
import { surfaceCardMotion, useSurfaceMotion } from '../hooks/useSurfaceMotion';
import SurfaceGlow from './SurfaceGlow';
import { cardInteraction, cardIconInteraction } from '../lib/card-interaction';

export default function OrderSummaryCard({
  order,
  expanded,
  onToggle,
  compact = false,
  index = 0,
  canExpand = true,
  onUpdated,
}: {
  order: AdminOrderSummaryFieldsFragment;
  expanded: boolean;
  onToggle: () => void;
  compact?: boolean;
  index?: number;
  canExpand?: boolean;
  onUpdated?: () => void;
}) {
  const { admin } = useAdmin();
  const [editing, setEditing] = useState(false);
  const [print, setPrint] = useState<'invoice' | 'label' | null>(null);
  const motion = useSurfaceMotion<HTMLElement>({ tilt: false, enabled: !expanded });
  const detailsId = `order-details-${order.id}`;
  return (
    <article
      {...motion}
      data-admin-record
      data-order-id={order.id}
      data-record-index={index + 1}
      aria-label={`سفارش ${formatNumber(order.number)}`}
      data-interactive-card
      className={`${surfaceCardMotion} ${cardInteraction} min-w-0 overflow-hidden rounded-[20px] border bg-white shadow-[0_3px_14px_#35465c06] ${expanded ? 'border-[#669198] ring-1 ring-[#669198]/15' : 'border-[#d8dbe0]'}`}
    >
      <SurfaceGlow />
      <div className="absolute inset-x-4 top-0 h-[3px] rounded-full bg-gradient-to-l from-[#68a5ae] via-[#669198] to-[#2c5282]" />
      <div className="p-3.5" data-order-summary>
        <header className="flex items-center gap-2.5">
          <span
            data-card-icon
            className={`${cardIconInteraction} grid size-12 shrink-0 place-items-center rounded-full border-2 border-[#b8dbe1] bg-gradient-to-br from-[#92c6ce] to-[#548f98] text-[#1e3a5f] shadow-[0_3px_8px_#66919826]`}
          >
            <AdminIcon name="person" width={25} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-base font-bold leading-6 text-[#202832]">
              {customerName(order.user, { recipient: order.address.recipientName, unnamed: true })}
            </h3>
            <p className="line-clamp-1 text-[13px] text-[#6b7481]">
              {compact ? `سفارش ${formatNumber(order.number)} · ` : ''}
              {salesChannelLabels[order.salesChannel]} ·{' '}
              {order.shippingMethod
                ? (order.shippingMethodLabel ?? shippingMethodLabel(order.shippingMethod))
                : 'تحویل حضوری'}
              {order.address.city ? ` · ${order.address.city}` : ''}
            </p>
          </div>
          <span className="shrink-0 rounded-lg border border-[#d7dce2] bg-[#f1f4f7] px-2 py-1 text-center">
            <small className="block text-[13px] text-[#6b7481]">{compact ? 'ردیف' : 'سفارش'}</small>
            <b className="text-xs text-[#1e3a5f]" data-record-number>
              {formatNumber(compact ? index + 1 : order.number)}
            </b>
          </span>
        </header>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#bdd3d6] bg-gradient-to-l from-[#dce3eb] to-[#f3f5f8] px-3 py-2">
          <div className="min-w-0">
            <span className="block text-[13px] text-[#6b7481]">مبلغ سفارش</span>
            <b className="block break-words text-lg leading-7 tabular-nums text-[#1e3a5f]">
              {formatAdminPrice(order.total)}
            </b>
          </div>
          <div className="[&_.ant-tag]:!m-0 [&_.ant-tag]:!rounded-md [&_.ant-tag]:!text-[13px]">
            {order.salesChannel === 'WEBSITE' ? (
              <OrderStatus status={order.status} />
            ) : (
              <AccountStatus balance={order.total - order.offlinePaidAmount} amount={false} />
            )}
          </div>
        </div>
        {order.salesChannel === 'INSTAGRAM' && ['SHIPPED', 'DELIVERED'].includes(order.status) && (
          <div className="mt-2">
            <OrderStatus status={order.status} />
          </div>
        )}
        <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="min-w-0 rounded-lg bg-[#f3f5f8] px-2.5 py-2">
            <dt className="flex items-center gap-1 text-[13px] text-[#6b7481]">
              <AdminIcon name="phone" width={16} />
              موبایل مشتری
            </dt>
            <dd className="mt-0.5 font-semibold text-[#35465c]">
              <bdi>{persianDigits(order.user.phone)}</bdi>
            </dd>
          </div>
          <div className="min-w-0 rounded-lg bg-[#f3f5f8] px-2.5 py-2">
            <dt className="flex items-center gap-1 text-[13px] text-[#6b7481]">
              <AdminIcon name="calendar" width={16} />
              تاریخ ثبت
            </dt>
            <dd className="mt-0.5 font-semibold text-[#35465c]">
              <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
            </dd>
          </div>
        </dl>
        {canExpand && (
          <div
            className={`mt-2.5 grid ${order.salesChannel === 'IN_PERSON' ? 'grid-cols-4' : order.salesChannel === 'INSTAGRAM' ? 'grid-cols-5' : 'grid-cols-[1.4fr_1fr_1fr_1fr]'} gap-1.5 border-t border-dashed border-[#d7dce2] pt-2.5`}
          >
            <button
              id={`order-toggle-${order.id}`}
              type="button"
              aria-label={`جزئیات سفارش ${formatNumber(order.number)}`}
              aria-expanded={expanded}
              aria-haspopup="dialog"
              aria-controls={detailsId}
              onClick={onToggle}
              className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#bcced1] bg-[#e6eaf0] text-xs font-semibold text-[#1e3a5f] transition hover:border-[#669198] hover:bg-[#d2dae5] aria-expanded:border-[#5c959e] aria-expanded:bg-[linear-gradient(135deg,#a7d4db,#6faeb7)] aria-expanded:shadow-[0_3px_10px_#5c959e30] motion-safe:active:scale-[0.97] motion-reduce:transition-none"
            >
              <AdminIcon name="receipt" width={20} />
              <span className={order.salesChannel !== 'WEBSITE' ? 'sr-only' : ''}>
                {expanded ? 'بستن' : 'جزئیات'}
              </span>
            </button>
            {order.salesChannel !== 'WEBSITE' && hasPermission(admin, 'ORDERS') && (
              <button
                type="button"
                aria-label={`ویرایش سفارش ${formatNumber(order.number)}`}
                title="ویرایش فاکتور"
                onClick={() => setEditing(true)}
                className="grid min-h-11 place-items-center rounded-lg border border-[#d8dbe0] bg-[#f3f5f8] text-[#35465c] hover:border-[#669198]"
              >
                <AdminIcon name="edit" width={21} />
              </button>
            )}
            {order.salesChannel !== 'IN_PERSON' && hasPermission(admin, 'ORDERS') && (
              <button
                type="button"
                aria-label={`ارسال و رهگیری سفارش ${formatNumber(order.number)}`}
                title="ارسال و رهگیری؛ پیام به مشتری"
                onClick={onToggle}
                className="grid min-h-11 place-items-center rounded-lg border border-[#d8dbe0] bg-[#f3f5f8] text-[#35465c] hover:border-[#669198]"
              >
                <AdminIcon name="message" width={21} />
              </button>
            )}
            <button
              type="button"
              aria-label={`چاپ فاکتور سفارش ${formatNumber(order.number)}`}
              title="چاپ فاکتور"
              onClick={() => setPrint('invoice')}
              className="grid min-h-10 place-items-center rounded-lg border border-[#d8dbe0] bg-[#f3f5f8] text-[#35465c] hover:border-[#669198] hover:text-[#1e3a5f]"
            >
              <AdminIcon name="print" width={21} />
            </button>
            <button
              type="button"
              aria-label={`چاپ لیبل سفارش ${formatNumber(order.number)}`}
              title="لیبل پستی"
              onClick={() => setPrint('label')}
              className="grid min-h-10 place-items-center rounded-lg border border-[#d8dbe0] bg-[#f3f5f8] text-[#35465c] hover:border-[#669198] hover:text-[#1e3a5f]"
            >
              <AdminIcon name="truck" width={21} />
            </button>
          </div>
        )}
      </div>
      {editing && (
        <ManualOrderEditDialog
          id={order.id}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onUpdated?.();
          }}
        />
      )}
      {print && canExpand && (
        <QuickOrderPrint id={order.id} view={print} onClose={() => setPrint(null)} />
      )}
    </article>
  );
}
