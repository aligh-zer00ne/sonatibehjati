import { hasPermission } from '@behjati/shared/permissions';
import { useAdmin } from '../auth/AdminProvider';
import { Typography, Alert, Card, Button } from 'antd';
import { Link } from 'react-router-dom';
import { AdminOrdersDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { useOrderFilters } from '../hooks/useOrderFilters';
import OrderFilters from '../components/OrderFilters';
import OrdersTable from '../components/OrdersTable';
import DataState from '../components/DataState';
export default function Orders() {
  const { admin } = useAdmin();
  const filters = useOrderFilters();
  const query = useAdminQuery(AdminOrdersDocument, { input: filters.input }, !filters.error);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography.Title level={2}>سفارش‌ها</Typography.Title>
        {hasPermission(admin, 'ORDER_MAP') && (
          <Link to="/admin/orders/map">
            <Button>مشاهده روی نقشه</Button>
          </Link>
        )}
      </div>
      <OrderFilters
        key={String(filters.input.search) + String(filters.input.city)}
        input={filters.input}
        onChange={filters.update}
        onReset={filters.reset}
      />
      {filters.error ? (
        <Alert title={filters.error} type="error" role="alert" />
      ) : !query.data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <Card>
          <OrdersTable
            items={query.data.adminOrders.items}
            page={query.data.adminOrders.page}
            total={query.data.adminOrders.total}
            onPage={(page) => filters.update({ page }, false)}
          />
        </Card>
      )}
    </>
  );
}
