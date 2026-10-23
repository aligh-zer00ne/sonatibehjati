import { useState } from 'react';
import AccountStatus from './AccountStatus';
import { formatAdminPrice } from '../lib/money';
import { salesChannelLabels, shippingMethodLabels } from '@behjati/shared/sales';
import { formatNumber, formatDate } from '@behjati/shared';
import type { AdminOrderSummaryFieldsFragment } from '../generated/graphql';
import { customerName, persianDigits } from '../lib/format';
import AdminIcon from './AdminIcon';
import OrderStatus from './OrderStatus';
import OrderDetailsCard from './OrderDetailsCard';
import QuickOrderPrint from './QuickOrderPrint';
import { surfaceCardMotion, useSurfaceMotion } from '../hooks/useSurfaceMotion';
import SurfaceGlow from './SurfaceGlow';
import { cardInteraction, cardIconInteraction } from '../lib/card-interaction';

export default function OrderSummaryCard({
  order,
  expanded,
  onToggle,
  onUpdated,
  compact = false,
  index = 0,
  canExpand = true,
}: {
  order: AdminOrderSummaryFieldsFragment;
  expanded: boolean;
  onToggle: () => void;
  onUpdated?: () => void;
  compact?: boolean;
  index?: number;
  canExpand?: boolean;
}) {
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
      className={`${surfaceCardMotion} ${cardInteraction} min-w-0 overflow-hidden rounded-[20px] border bg-white shadow-[0_3px_14px_#62452f06] ${expanded ? 'border-[#b7825b] ring-1 ring-[#b7825b]/15 md:col-span-2 xl:col-span-3' : 'border-[#e5ded3]'}`}
    >
      <SurfaceGlow />
      <div className="absolute inset-x-4 top-0 h-[3px] rounded-full bg-gradient-to-l from-[#d5ac55] via-[#b7825b] to-[#701e2a]" />
      <div className="p-3.5" data-order-summary>
        <header className="flex items-center gap-2.5">
          <span
            data-card-icon
            className={`${cardIconInteraction} grid size-12 shrink-0 place-items-center rounded-full border-2 border-[#f7e6b6] bg-gradient-to-br from-[#efd186] to-[#c99a37] text-[#4e141c] shadow-[0_3px_8px_#b7825b26]`}
          >
            <AdminIcon name="person" width={25} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-base font-bold leading-6 text-[#34251e]">
              {customerName(order.user)}
            </h3>
            <p className="line-clamp-1 text-[13px] text-[#857467]">
              {compact ? `سفارش ${formatNumber(order.number)} · ` : ''}
              {salesChannelLabels[order.salesChannel]} ·{' '}
              {order.shippingMethod ? shippingMethodLabels[order.shippingMethod] : 'تحویل حضوری'}
              {order.address.city ? ` · ${order.address.city}` : ''}
            </p>
          </div>
          <span className="shrink-0 rounded-lg border border-[#e8ded1] bg-[#faf6ee] px-2 py-1 text-center">
            <small className="block text-[13px] text-[#857467]">{compact ? 'ردیف' : 'سفارش'}</small>
            <b className="text-xs text-[#4e141c]" data-record-number>
              {formatNumber(compact ? index + 1 : order.number)}
            </b>
          </span>
        </header>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e8d9bf] bg-gradient-to-l from-[#f4e8d3] to-[#fbf8f0] px-3 py-2">
          <div className="min-w-0">
            <span className="block text-[13px] text-[#857467]">مبلغ سفارش</span>
            <b className="block break-words text-lg leading-7 tabular-nums text-[#4e141c]">
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
        <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="min-w-0 rounded-lg bg-[#faf7f1] px-2.5 py-2">
            <dt className="flex items-center gap-1 text-[13px] text-[#857467]">
              <AdminIcon name="phone" width={16} />
              موبایل مشتری
            </dt>
            <dd className="mt-0.5 font-semibold text-[#62452f]">
              <bdi>{persianDigits(order.user.phone)}</bdi>
            </dd>
          </div>
          <div className="min-w-0 rounded-lg bg-[#faf7f1] px-2.5 py-2">
            <dt className="flex items-center gap-1 text-[13px] text-[#857467]">
              <AdminIcon name="calendar" width={16} />
              تاریخ ثبت
            </dt>
            <dd className="mt-0.5 font-semibold text-[#62452f]">
              <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
            </dd>
          </div>
        </dl>
        {canExpand && (
          <div className="mt-2.5 grid grid-cols-[1.4fr_1fr_1fr] gap-1.5 border-t border-dashed border-[#e8ded1] pt-2.5">
            <button
              id={`order-toggle-${order.id}`}
              type="button"
              aria-label={`جزئیات سفارش ${formatNumber(order.number)}`}
              aria-expanded={expanded}
              aria-controls={detailsId}
              onClick={onToggle}
              className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#e2d5c0] bg-[#f7efdf] text-xs font-semibold text-[#4e141c] transition hover:border-[#b7825b] hover:bg-[#f0e0c7] aria-expanded:border-[#c69b48] aria-expanded:bg-[linear-gradient(135deg,#f6dfa0,#dfb65c)] aria-expanded:shadow-[0_3px_10px_#c69b4830] motion-safe:active:scale-[0.97] motion-reduce:transition-none"
            >
              <AdminIcon name="receipt" width={20} />
              <span>{expanded ? 'بستن' : 'جزئیات'}</span>
            </button>
            <button
              type="button"
              aria-label={`چاپ فاکتور سفارش ${formatNumber(order.number)}`}
              title="چاپ فاکتور"
              onClick={() => setPrint('invoice')}
              className="grid min-h-10 place-items-center rounded-lg border border-[#e5ded3] bg-[#faf7f1] text-[#62452f] hover:border-[#b7825b] hover:text-[#4e141c]"
            >
              <AdminIcon name="print" width={21} />
            </button>
            <button
              type="button"
              aria-label={`چاپ لیبل سفارش ${formatNumber(order.number)}`}
              title="لیبل پستی"
              onClick={() => setPrint('label')}
              className="grid min-h-10 place-items-center rounded-lg border border-[#e5ded3] bg-[#faf7f1] text-[#62452f] hover:border-[#b7825b] hover:text-[#4e141c]"
            >
              <AdminIcon name="truck" width={21} />
            </button>
          </div>
        )}
      </div>
      <div id={detailsId} hidden={!expanded}>
        {expanded && (
          <div className="motion-safe:animate-surface-enter">
            <OrderDetailsCard id={order.id} onClose={onToggle} onUpdated={onUpdated} />
          </div>
        )}
      </div>
      {print && canExpand && (
        <QuickOrderPrint id={order.id} view={print} onClose={() => setPrint(null)} />
      )}
    </article>
  );
}
