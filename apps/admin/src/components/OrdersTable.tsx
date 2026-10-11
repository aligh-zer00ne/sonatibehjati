import { Money } from './Money';
import { Table, Button } from 'antd';
import { Link } from 'react-router-dom';
import { formatNumber, formatDate } from '@behjati/shared';
import type { AdminOrderSummaryFieldsFragment } from '../generated/graphql';
import { customerName, persianDigits } from '../lib/format';
import OrderStatus from './OrderStatus';
export default function OrdersTable({
  items,
  page,
  total,
  pageSize = 20,
  onPage,
  compact = false,
}: {
  items: AdminOrderSummaryFieldsFragment[];
  page?: number;
  total?: number;
  pageSize?: number;
  onPage?: (page: number) => void;
  compact?: boolean;
}) {
  return (
    <Table<AdminOrderSummaryFieldsFragment>
      rowKey="id"
      dataSource={items}
      scroll={{ x: compact ? 560 : 850 }}
      size={compact ? 'small' : 'middle'}
      pagination={
        onPage
          ? { current: page, pageSize, total, showSizeChanger: false, onChange: onPage }
          : false
      }
      columns={[
        {
          title: compact ? 'ردیف' : 'شماره',
          render: (_, order, index) => formatNumber(compact ? index + 1 : order.number),
        },
        {
          title: 'مشتری',
          render: (_, order) => (
            <div>
              {customerName(order.user)}
              <bdi className="mt-1 block text-xs text-slate-500">
                {persianDigits(order.user.phone)}
              </bdi>
            </div>
          ),
        },
        ...(!compact
          ? [
              {
                title: 'شهر',
                render: (_: unknown, order: AdminOrderSummaryFieldsFragment) =>
                  order.address.city || 'ثبت نشده',
              },
            ]
          : []),
        { title: 'وضعیت', render: (_, order) => <OrderStatus status={order.status} /> },
        { title: 'مبلغ', render: (_, order) => <Money amount={order.total} /> },
        { title: 'تاریخ', render: (_, order) => formatDate(order.createdAt) },
        {
          title: 'عملیات',
          render: (_, order) => (
            <Link to={`/admin/orders/${order.id}`}>
              <Button aria-label={`جزئیات سفارش ${formatNumber(order.number)}`}>جزئیات</Button>
            </Link>
          ),
        },
      ]}
    />
  );
}
