import { salesChannelLabels, shippingMethodLabels } from '@behjati/shared/sales';
import { Button } from 'antd';
import { formatNumber, formatPrice, formatDate } from '@behjati/shared';
import type { AdminOrderSummaryFieldsFragment } from '../generated/graphql';
import { customerName, persianDigits } from '../lib/format';
import AdminIcon from './AdminIcon';
import OrderStatus from './OrderStatus';
import OrderDetailsCard from './OrderDetailsCard';

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
  const detailsId = `order-details-${order.id}`;
  return (
    <article
      data-admin-record
      data-record-index={index + 1}
      aria-label={`سفارش ${formatNumber(order.number)}`}
      className={`relative min-w-0 overflow-hidden rounded-3xl border bg-[#fcf9f3] shadow-[0_4px_20px_rgba(102,3,17,0.03)] transition-colors ${expanded ? 'border-[#b7825b]' : 'border-[#e8ded1]'}`}
    >
      <div className="absolute inset-x-5 top-0 h-[3px] rounded-full bg-gradient-to-l from-[#d5ac55] via-[#b7825b] to-[#96140d]" />
      <div className={compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'}>
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#f9eed0] bg-gradient-to-br from-[#f0d17b] to-[#ce9f38] text-[#76100b] shadow-[0_4px_9px_rgba(106,97,49,0.12)]">
              <AdminIcon name="person" width={23} height={23} />
            </span>
            <div className="min-w-0">
              <h3 className="break-words text-sm leading-6 font-bold text-[#62452f]">
                {customerName(order.user)}
              </h3>
              <p className="mt-0.5 text-[12px] text-[#76685d]">
                {compact ? `سفارش ${formatNumber(order.number)} · ` : ''}
                {salesChannelLabels[order.salesChannel ?? 'WEBSITE']} ·{' '}
                {order.shippingMethod ? shippingMethodLabels[order.shippingMethod] : 'تحویل حضوری'}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-xl border border-[#e8ded1] bg-[#f4e8d3] px-2.5 py-1.5 text-center text-[#76100b]">
            <span className="block text-[9px] leading-4 text-[#76685d]">
              {compact ? 'ردیف' : 'سفارش'}
            </span>
            <bdi data-record-number className="text-xs font-bold">
              {formatNumber(compact ? index + 1 : order.number)}
            </bdi>
          </span>
        </header>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#e5d1aa] bg-gradient-to-l from-[#f4e8d3] to-[#fcf9f3] px-3 py-2.5 sm:px-4">
          <div>
            <p className="mb-0.5 text-[12px] text-[#76685d]">مبلغ سفارش</p>
            <p className="text-lg leading-8 font-bold text-[#96140d] sm:text-xl">
              {formatPrice(order.total)}
            </p>
          </div>
          <div className="[&_.ant-tag]:!m-0 [&_.ant-tag]:!rounded-lg [&_.ant-tag]:!px-2 [&_.ant-tag]:!py-0.5">
            <OrderStatus status={order.status} />
          </div>
        </div>
        <dl className={`mt-2.5 grid grid-cols-2 gap-2 text-xs ${compact ? '' : 'sm:grid-cols-3'}`}>
          <div className="flex min-w-0 items-center gap-2 rounded-xl bg-[#f4e8d3] px-3 py-2.5">
            <AdminIcon name="phone" className="shrink-0 text-[#b7825b]" width={17} height={17} />
            <div>
              <dt className="text-[12px] leading-5 text-[#76685d]">موبایل مشتری</dt>
              <dd className="font-medium text-[#62452f]">
                <bdi>{persianDigits(order.user.phone)}</bdi>
              </dd>
            </div>
          </div>
          {!compact && (
            <div className="flex min-w-0 items-center gap-2 rounded-xl bg-[#f4e8d3] px-3 py-2.5">
              <AdminIcon name="pin" className="shrink-0 text-[#b7825b]" width={17} height={17} />
              <div className="min-w-0">
                <dt className="text-[12px] leading-5 text-[#76685d]">شهر مقصد</dt>
                <dd className="break-words font-medium text-[#62452f]">
                  {order.address.city || 'ثبت نشده'}
                </dd>
              </div>
            </div>
          )}
          <div
            className={`flex min-w-0 items-center gap-2 rounded-xl bg-[#f4e8d3] px-3 py-2.5 ${compact ? '' : 'col-span-2 sm:col-span-1'}`}
          >
            <AdminIcon name="calendar" className="shrink-0 text-[#b7825b]" width={17} height={17} />
            <div>
              <dt className="text-[12px] leading-5 text-[#76685d]">تاریخ ثبت</dt>
              <dd className="font-medium text-[#62452f]">
                <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
              </dd>
            </div>
          </div>
        </dl>
        {canExpand && (
          <div className="mt-3 border-t border-dashed border-[#e8ded1] pt-3">
            <Button
              id={`order-toggle-${order.id}`}
              aria-label={`جزئیات سفارش ${formatNumber(order.number)}`}
              aria-expanded={expanded}
              aria-controls={detailsId}
              onClick={onToggle}
              block
              icon={<AdminIcon name="receipt" width={18} height={18} />}
              className="!flex !min-h-11 !items-center !justify-between !rounded-xl !border-[#e5d7c2] !bg-[#f4e8d3] !px-3 !text-xs !font-medium !text-[#76100b] hover:!bg-[#f2e5d4]"
            >
              <span className="flex flex-1 items-center justify-between gap-2">
                {expanded ? 'بستن جزئیات' : 'جزئیات سفارش'}
                <AdminIcon
                  name="chevron"
                  width={17}
                  height={17}
                  className={`shrink-0 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}
                />
              </span>
            </Button>
          </div>
        )}
      </div>
      <div id={detailsId} hidden={!expanded}>
        {expanded && <OrderDetailsCard id={order.id} onClose={onToggle} onUpdated={onUpdated} />}
      </div>
    </article>
  );
}
