import { Typography, Alert, Card } from 'antd';
import { AdminDashboardDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import DataState from '../components/DataState';
import MetricCards from '../components/MetricCards';
import ReportCharts from '../components/ReportCharts';
import OrdersTable from '../components/OrdersTable';
export default function Dashboard() {
  const query = useAdminQuery(AdminDashboardDocument, {});
  if (!query.data) return <DataState error={query.error} retry={query.refresh} />;
  const data = query.data.adminDashboard;
  return (
    <>
      <Typography.Title level={2}>داشبورد مدیریت</Typography.Title>
      <MetricCards
        metrics={[
          { label: 'تعداد کل سفارش‌ها', value: data.ordersCount },
          { label: 'سفارش‌های امروز', value: data.ordersToday },
          { label: 'سفارش‌های ماه شمسی جاری', value: data.ordersThisMonth },
          { label: 'ارزش سفارش‌های غیرلغوشده', value: data.orderValue, amount: true },
          { label: 'میانگین ارزش سفارش', value: Math.round(data.averageOrderValue), amount: true },
          { label: 'درآمد تأییدشده', value: data.revenue, amount: true },
        ]}
      />
      <Alert
        type="info"
        showIcon
        title="ارزش سفارش‌ها، درآمد دریافت‌شده نیست. در این نسخه پرداختی ثبت نمی‌شود و درآمد تأییدشده صفر است."
      />
      <ReportCharts report={data.report} />
      <Card title="آخرین سفارش‌ها">
        <OrdersTable items={data.recentOrders} />
      </Card>
    </>
  );
}
