import { Typography, Alert, Card, Pagination, Button } from 'antd';
import { Link } from 'react-router-dom';
import { formatNumber } from '@behjati/shared';
import { AdminOrdersDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { useOrderFilters } from '../hooks/useOrderFilters';
import OrderFilters from '../components/OrderFilters';
import OrdersMapView from '../components/OrdersMapView';
import OrdersTable from '../components/OrdersTable';
import DataState from '../components/DataState';
export default function OrdersMap() {
  const filters = useOrderFilters(50);
  const query = useAdminQuery(AdminOrdersDocument, { input: filters.input }, !filters.error);
  const result = query.data?.adminOrders;
  const points =
    result?.items.filter(
      (order) => order.address.latitude != null && order.address.longitude != null,
    ) ?? [];
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography.Title level={2}>نقشه سفارش‌ها</Typography.Title>
        <Link to="/admin/orders">
          <Button>فهرست سفارش‌ها</Button>
        </Link>
      </div>
      <OrderFilters
        key={String(filters.input.search) + String(filters.input.city)}
        input={filters.input}
        onChange={filters.update}
        onReset={filters.reset}
      />
      {filters.error ? (
        <Alert title={filters.error} type="error" role="alert" />
      ) : !result ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <>
          <Alert
            type="info"
            title={`${formatNumber(points.length)} موقعیت از ${formatNumber(result.items.length)} سفارش این صفحه نمایش داده می‌شود. ${formatNumber(result.items.length - points.length)} سفارش این صفحه موقعیت ثبت‌شده ندارند.`}
          />
          <Card>
            <OrdersMapView orders={points} />
          </Card>
          <Pagination
            current={result.page}
            pageSize={50}
            total={result.total}
            showSizeChanger={false}
            onChange={(page) => filters.update({ page }, false)}
          />
          <Card title="سفارش‌های این صفحه">
            <OrdersTable items={result.items} />
          </Card>
        </>
      )}
    </>
  );
}
