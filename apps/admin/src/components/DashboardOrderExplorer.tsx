import { useState } from 'react';
import { Modal, Button } from 'antd';
import { Link } from 'react-router-dom';
import { formatNumber } from '@behjati/shared';
import type { AdminOrdersInput } from '../generated/graphql';
import { AdminOrdersDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import OrdersTable from './OrdersTable';
import DataState from './DataState';
import { chartDate } from '../lib/format';
import AdminIcon from './AdminIcon';

export type OrderInspection = { title: string; input: AdminOrdersInput };
export default function DashboardOrderExplorer({
  inspection,
  onClose,
  onUpdated,
}: {
  inspection: OrderInspection;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const query = useAdminQuery(AdminOrdersDocument, {
    input: { ...inspection.input, page, pageSize: 10 },
  });
  const data = query.data?.adminOrders;
  const params = new URLSearchParams(
    Object.entries(inspection.input)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => [k, String(v)]),
  );
  return (
    <Modal
      open
      width={1160}
      style={{ top: 24 }}
      title={inspection.title}
      onCancel={onClose}
      destroyOnHidden
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to={`/admin/orders?${params}`}>
            <Button icon={<AdminIcon name="arrow" width={15} />}>باز کردن در بخش سفارش‌ها</Button>
          </Link>
          <Button onClick={onClose}>بستن</Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e8ded1] bg-[#f8f3eb] px-3 py-2 text-xs text-[#76685d]">
        <span>{data ? `${formatNumber(data.total)} سفارش منطبق` : 'در حال دریافت سفارش‌ها…'}</span>
        {inspection.input.from && inspection.input.to && (
          <span>
            {chartDate(inspection.input.from)} تا {chartDate(inspection.input.to)}
          </span>
        )}
      </div>
      {!data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <OrdersTable
          items={data.items}
          page={page}
          total={data.total}
          pageSize={10}
          expandedId={expanded}
          onExpandedChange={setExpanded}
          onPage={(p) => {
            setPage(p);
            setExpanded(null);
          }}
          onUpdated={() => {
            query.refresh();
            onUpdated();
          }}
        />
      )}
    </Modal>
  );
}
