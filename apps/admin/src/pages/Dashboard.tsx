import { FilterChips, FilterButton, FilterBar } from '../components/FilterButtons';
import { salesChannels, salesChannelLabels } from '@behjati/shared/sales';
import type { SalesChannel } from '../generated/graphql';
import { canOpenAdminPath } from '@behjati/shared/permissions';
import { useAdmin } from '../auth/AdminProvider';
import { Money } from '../components/Money';
import { AmountInWords } from '../components/AmountInWords';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Empty } from 'antd';
import { formatNumber, formatDate } from '@behjati/shared';
import { AdminDashboardDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import DataState from '../components/DataState';
import DashboardCharts from '../components/DashboardCharts';
import DashboardProductImage from '../components/DashboardProductImage';
import OrdersTable from '../components/OrdersTable';
import AdminIcon, { type AdminIconName } from '../components/AdminIcon';
import { customerName } from '../lib/format';
const shortcuts: Array<{ label: string; href: string; icon: AdminIconName }> = [
  { label: 'مدیریت سفارش‌ها', href: '/admin/orders', icon: 'orders' },
  { label: 'افزودن محصول', href: '/admin/products/new', icon: 'plus' },
  { label: 'مدیریت مشتریان', href: '/admin/users', icon: 'users' },
  { label: 'گزارش فروش', href: '/admin/reports', icon: 'reports' },
];
export default function Dashboard() {
  const { admin } = useAdmin();
  const [salesChannel, setSalesChannel] = useState<SalesChannel | ''>('');
  const query = useAdminQuery(AdminDashboardDocument, { salesChannel: salesChannel || null });
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  if (!query.data) return <DataState error={query.error} retry={query.refresh} />;
  const data = query.data.adminDashboard;
  const metrics: Array<{
    label: string;
    value: number;
    detail: string;
    icon: AdminIconName;
    color: string;
    background: string;
  }> = [
    {
      label: 'محصول فعال',
      value: data.activeProductsCount,
      detail: 'محصولات قابل نمایش در فروشگاه',
      icon: 'products',
      color: '#9b610a',
      background: '#fff7e7',
    },
    {
      label: 'ارزش کل سفارش‌ها (تومان)',
      value: data.orderValue,
      detail: 'بدون سفارش‌های لغوشده',
      icon: 'wallet',
      color: '#525198',
      background: '#f6f2fd',
    },
    {
      label: 'سفارش ثبت شده',
      value: data.ordersCount,
      detail: `${formatNumber(data.ordersToday)} سفارش امروز`,
      icon: 'orders',
      color: '#087b53',
      background: '#effaf3',
    },
    {
      label: 'مشتری ثبت نام شده',
      value: data.customersCount,
      detail: 'مشتریان فروشگاه سنتی بهجتی',
      icon: 'users',
      color: '#a51432',
      background: '#fff1f2',
    },
  ];
  const panelTitle = (label: string, href: string) => (
    <div className="flex items-center justify-between gap-2">
      <span>{label}</span>
      {admin && canOpenAdminPath(admin, href) && (
        <Link to={href} className="flex items-center gap-1 text-[12px] !text-[#786044]">
          مشاهده همه
          <AdminIcon name="arrow" width={14} height={14} />
        </Link>
      )}
    </div>
  );
  return (
    <div className="flex flex-col gap-5 sm:gap-6" data-admin-dashboard>
      <h1 className="sr-only">داشبورد مدیریت</h1>
      <FilterBar label="فیلتر داشبورد">
        <FilterButton label="محل خرید" active={!!salesChannel}>
          <FilterChips<SalesChannel | ''>
            label="محل خرید داشبورد"
            value={salesChannel}
            options={[
              { value: '', label: 'همه خریدها' },
              ...salesChannels.map((value) => ({ value, label: salesChannelLabels[value] })),
            ]}
            onChange={setSalesChannel}
          />
        </FilterButton>
      </FilterBar>
      <section aria-label="مشتریان به تفکیک محل خرید" className="grid gap-3 sm:grid-cols-3">
        {data.channelMetrics.map((c) => (
          <div key={c.salesChannel} className="rounded-xl border border-[#e5d7c2] bg-[#fcf9f3] p-4">
            <h2 className="mb-3 font-bold text-[#76100b]">
              خرید از {salesChannelLabels[c.salesChannel]}
            </h2>
            <p className="text-sm leading-7">
              {formatNumber(c.customersCount)} مشتری · {formatNumber(c.ordersCount)} سفارش
            </p>
            <p className="mt-2 text-xs leading-7">
              دریافتی: <Money amount={c.revenue} />
            </p>
          </div>
        ))}
      </section>
      <p className="text-xs leading-6 text-[#76685d]">
        یک مشتری ممکن است از چند مسیر خرید کرده باشد؛ تعداد مشتریان هر مسیر مستقل است. برای مشتری
        بدون سفارش، منبع ثبت مبناست. دریافت‌ها شامل پرداخت بانکی موفق و مبالغ ثبت‌شده توسط مدیر است.
      </p>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            style={{ backgroundColor: metric.background, color: metric.color }}
            className="rounded-xl border border-[#e8ded1]/80 p-4 shadow-[0_4px_18px_rgba(94,61,32,0.025)]"
          >
            <span className="mb-3 grid size-10 place-items-center rounded-full bg-white/70">
              <AdminIcon name={metric.icon} width={24} height={24} />
            </span>
            <b className="block text-xl leading-9 break-all tabular-nums sm:text-[25px]">
              {formatNumber(metric.value)}
            </b>
            {metric.icon === 'wallet' && <AmountInWords amount={metric.value} />}
            <p className="mt-1 text-xs font-medium">{metric.label}</p>
            <p className="mt-4 text-[12px] text-[#8b8277]">{metric.detail}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-[#857467]">
        <AdminIcon name="calendar" width={16} height={16} />
        <time dateTime={now.toISOString()}>
          {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full', timeZone: 'Asia/Tehran' }).format(
            now,
          )}
        </time>
        <span className="mr-auto">
          ساعت{' '}
          {new Intl.DateTimeFormat('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Tehran',
          }).format(now)}
        </span>
      </div>
      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card
          title="سریع‌ترین دسترسی‌ها"
          className="min-w-0 md:col-span-2 xl:col-span-1 xl:order-last"
        >
          <div className="grid grid-cols-2 gap-3">
            {shortcuts
              .filter((item) => admin && canOpenAdminPath(admin, item.href))
              .map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="group flex min-h-[103px] flex-col items-center justify-center gap-3 rounded-lg border border-[#eee3d5] bg-[#fffcf7] px-2 !text-[#34251e] transition hover:border-[#cfa99f] hover:shadow-sm"
                >
                  <AdminIcon
                    name={item.icon}
                    width={25}
                    height={25}
                    className="text-[#930d25] transition-transform group-hover:-translate-y-0.5 motion-reduce:transition-none"
                  />
                  <span className="text-[12px]">{item.label}</span>
                </Link>
              ))}
          </div>
        </Card>
        <DashboardCharts report={data.report} />
      </div>
      <div className="grid min-w-0 gap-4 xl:grid-cols-4">
        <Card
          title={panelTitle('آخرین سفارش‌ها', '/admin/orders')}
          className="min-w-0 xl:col-span-2"
        >
          <OrdersTable items={data.recentOrders} compact onUpdated={query.refresh} />
        </Card>
        <Card title={panelTitle('محصولات پرسفارش', '/admin/products')} className="min-w-0">
          {data.topProducts.length ? (
            <ul aria-label="محصولات پرسفارش" className="divide-y divide-[#eee5d9]">
              {data.topProducts.map((product) => (
                <li key={product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <DashboardProductImage src={product.image} title={product.title} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{product.title}</p>
                    <p className="mt-1 text-[12px] text-[#8c8176]">
                      {<Money amount={product.orderValue} />}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#fff0ef] px-2 py-1 text-[12px] whitespace-nowrap text-[#a51432]">
                    {formatNumber(product.quantity)} عدد
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="هنوز سفارشی برای محصولات فروشگاه ثبت نشده است"
            />
          )}
        </Card>
        <Card title={panelTitle('جدیدترین مشتریان', '/admin/users')} className="min-w-0">
          {data.recentUsers.length ? (
            <ul className="divide-y divide-[#eee5d9]">
              {data.recentUsers.map((user, index) => (
                <li key={user.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full ${['bg-[#f1e8d8] text-[#7a5737]', 'bg-[#eeebfa] text-[#665398]', 'bg-[#e3f3e7] text-[#24815c]'][index % 3]}`}
                  >
                    <AdminIcon name="users" width={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{customerName(user)}</p>
                    <p className="mt-1 text-[12px] text-[#8c8176]">
                      عضویت: {formatDate(user.createdAt)}
                      <span className="mt-1 block">
                        {user.salesChannels.map((c) => salesChannelLabels[c]).join('، ')}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="هنوز مشتری ثبت نشده است" />
          )}
        </Card>
      </div>
    </div>
  );
}
