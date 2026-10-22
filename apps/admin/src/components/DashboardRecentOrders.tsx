import { lazy, Suspense, useState } from 'react';
import { Empty } from 'antd';
import { hasPermission } from '@behjati/shared/permissions';
import { formatNumber } from '@behjati/shared';
import { salesChannelLabels } from '@behjati/shared/sales';
import type { AdminOrderSummaryFieldsFragment } from '../generated/graphql';
import { useAdmin } from '../auth/AdminProvider';
import { formatAdminPrice } from '../lib/money';
import { customerName, formatDateTime } from '../lib/format';
import AccountStatus from './AccountStatus';
import OrderStatus from './OrderStatus';
import AdminIcon from './AdminIcon';
const OrderDetailsCard = lazy(() => import('./OrderDetailsCard'));

export default function DashboardRecentOrders({
  items,
  onUpdated,
}: {
  items: AdminOrderSummaryFieldsFragment[];
  onUpdated: () => void;
}) {
  const { admin } = useAdmin();
  const [expanded, setExpanded] = useState<string | null>(null);
  function close(id: string) {
    setExpanded(null);
    document.getElementById(`dashboard-order-${id}`)?.focus();
  }
  if (!items.length)
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="هنوز سفارشی ثبت نشده است." />;
  return (
    <div className="space-y-2" aria-label="فهرست سفارش‌ها">
      {items.map((order, index) => (
        <article
          key={order.id}
          data-admin-record
          className="rounded-xl border border-[#e8ded1] bg-[#fcf9f3] p-3"
        >
          <div className="flex items-start gap-3">
            <span
              data-record-number
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f4e8d3] text-xs font-bold text-[#96140d]"
            >
              {formatNumber(index + 1)}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="break-words text-sm font-bold">{customerName(order.user)}</h3>
              <p className="mt-1 text-xs text-[#857467]">
                سفارش {formatNumber(order.number)} · {salesChannelLabels[order.salesChannel]}
              </p>
            </div>
            {hasPermission(admin, 'ORDERS') && (
              <button
                id={`dashboard-order-${order.id}`}
                type="button"
                aria-label={`جزئیات سفارش ${formatNumber(order.number)}`}
                aria-expanded={expanded === order.id}
                aria-controls={`dashboard-detail-${order.id}`}
                onClick={() => (expanded === order.id ? close(order.id) : setExpanded(order.id))}
                className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#e8ded1] bg-white text-[#96140d] hover:bg-[#f4e8d3]"
              >
                <AdminIcon name={expanded === order.id ? 'close' : 'arrow'} width={17} />
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <b className="text-sm tabular-nums text-[#76100b]">{formatAdminPrice(order.total)}</b>
            <div className="[&_.ant-tag]:!m-0">
              {order.salesChannel === 'WEBSITE' ? (
                <OrderStatus status={order.status} />
              ) : (
                <AccountStatus balance={order.total - order.offlinePaidAmount} amount={false} />
              )}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-[#857467]">{formatDateTime(order.createdAt)}</p>
          {expanded === order.id && hasPermission(admin, 'ORDERS') && (
            <div id={`dashboard-detail-${order.id}`} className="mt-3">
              <Suspense fallback={<p className="py-3 text-xs">در حال دریافت جزئیات…</p>}>
                <OrderDetailsCard
                  id={order.id}
                  onClose={() => close(order.id)}
                  onUpdated={onUpdated}
                />
              </Suspense>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
