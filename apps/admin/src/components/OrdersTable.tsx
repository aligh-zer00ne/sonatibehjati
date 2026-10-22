import { hasPermission } from '@behjati/shared/permissions';
import { useAdmin } from '../auth/AdminProvider';
import { Pagination, Empty } from 'antd';
import { useRef, useState } from 'react';
import type { AdminOrderSummaryFieldsFragment } from '../generated/graphql';
import OrderSummaryCard from './OrderSummaryCard';
export default function OrdersTable({
  items,
  page,
  total,
  pageSize = 20,
  onPage,
  compact = false,
  expandedId,
  onExpandedChange,
  onUpdated,
}: {
  items: AdminOrderSummaryFieldsFragment[];
  page?: number;
  total?: number;
  pageSize?: number;
  onPage?: (page: number) => void;
  compact?: boolean;
  expandedId?: string | null;
  onExpandedChange?: (id: string | null) => void;
  onUpdated?: () => void;
}) {
  const { admin } = useAdmin();
  const [localExpanded, setLocalExpanded] = useState<string | null>(null);
  const expanded = expandedId === undefined ? localExpanded : expandedId;
  const trigger = useRef<HTMLButtonElement | null>(null);
  const select = onExpandedChange ?? setLocalExpanded;
  const toggle = (id: string) => {
    if (expanded === id) {
      select(null);
      const button = document.getElementById(`order-toggle-${id}`) ?? trigger.current;
      button?.focus();
    } else {
      trigger.current =
        document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
      select(id);
    }
  };
  return (
    <div className="space-y-2">
      {items.length ? (
        <div
          className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-3"
          aria-label="فهرست سفارش‌ها"
          data-order-grid
        >
          {items.map((order, index) => (
            <OrderSummaryCard
              key={order.id}
              order={order}
              compact={compact}
              index={index}
              canExpand={hasPermission(admin, 'ORDERS')}
              expanded={expanded === order.id && hasPermission(admin, 'ORDERS')}
              onToggle={() => toggle(order.id)}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#e8ded1] bg-[#fcf9f3] py-10">
          <Empty description="سفارشی با این فیلترها پیدا نشد." />
        </div>
      )}
      {onPage && (
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger={false}
          onChange={(value) => {
            select(null);
            onPage(value);
          }}
          className="!flex !flex-wrap !justify-center !gap-y-2"
        />
      )}
    </div>
  );
}
