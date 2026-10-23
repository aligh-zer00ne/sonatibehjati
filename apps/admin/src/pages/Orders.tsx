import PageHeading from '../components/PageHeading';
import ManualOrderModal from '../components/ManualOrderModal';
import { hasPermission } from '@behjati/shared/permissions';
import { useAdmin } from '../auth/AdminProvider';
import { Alert, Button } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminOrdersDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { useOrderFilters, type OrderScope } from '../hooks/useOrderFilters';
import OrderFilters from '../components/OrderFilters';
import OrdersTable from '../components/OrdersTable';
import DataState from '../components/DataState';
import AdminIcon from '../components/AdminIcon';
export default function Orders({ scope = 'all' }: { scope?: OrderScope }) {
  const { admin } = useAdmin();
  const [manualOpen, setManualOpen] = useState(false);
  const filters = useOrderFilters(20, scope);
  const query = useAdminQuery(AdminOrdersDocument, { input: filters.input }, !filters.error);
  const filterKey = JSON.stringify(filters.input);
  const [selection, setSelection] = useState<{ id: string | null; filterKey: string } | null>(null);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageHeading icon="orders" description="فاکتورها و جزئیات هر سفارش، در یک نگاه.">
            {scope === 'website'
              ? 'سفارش‌های وبسایت'
              : scope === 'manual'
                ? 'سایر سفارش‌ها'
                : 'سفارش‌ها'}
          </PageHeading>
          <p className="mb-3 text-xs leading-6 text-[#76685d]">
            {scope === 'manual'
              ? 'مدیریت سفارش‌های دستی، حضوری و اینستاگرامی'
              : 'مدیریت سفارش، از جزئیات خرید تا آماده‌سازی و ارسال'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {scope !== 'website' && (
            <Button
              type="primary"
              icon={<AdminIcon name="plus" width={18} />}
              onClick={() => setManualOpen(true)}
            >
              ثبت سفارش دستی
            </Button>
          )}
          {hasPermission(admin, 'ORDER_MAP') && (
            <Link to="/admin/orders/map">
              <Button icon={<AdminIcon name="map" width={18} height={18} />}>
                مشاهده روی نقشه
              </Button>
            </Link>
          )}
        </div>
      </div>
      {manualOpen && (
        <ManualOrderModal
          onClose={() => setManualOpen(false)}
          onSaved={(id) => {
            setManualOpen(false);
            setSelection({ id, filterKey });
            query.refresh();
          }}
        />
      )}
      <OrderFilters
        key={String(filters.input.search) + String(filters.input.city)}
        input={filters.input}
        onChange={filters.update}
        onReset={filters.reset}
        scope={scope}
      />
      {filters.error ? (
        <Alert title={filters.error} type="error" role="alert" />
      ) : !query.data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <OrdersTable
          items={query.data.adminOrders.items}
          page={query.data.adminOrders.page}
          total={query.data.adminOrders.total}
          onPage={(page) => filters.update({ page }, false)}
          expandedId={selection?.filterKey === filterKey ? selection.id : null}
          onExpandedChange={(id) => setSelection({ id, filterKey })}
          onUpdated={query.refresh}
        />
      )}
    </>
  );
}
