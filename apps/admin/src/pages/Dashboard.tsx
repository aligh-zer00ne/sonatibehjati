import AccountStatus from '../components/AccountStatus';
import AnalyticsMetric from '../components/AnalyticsMetric';
import AnalyticsRefresh from '../components/AnalyticsRefresh';
import AdminSkyline from '../components/AdminSkyline';
import { FilterChips, FilterButton, FilterBar } from '../components/FilterButtons';
import { salesChannels, salesChannelLabels } from '@behjati/shared/sales';
import type { SalesChannel } from '../generated/graphql';
import { canOpenAdminPath } from '@behjati/shared/permissions';
import { useAdmin } from '../auth/AdminProvider';
import { Money } from '../components/Money';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Empty } from 'antd';
import { formatNumber, formatDate } from '@behjati/shared';
import { AdminDashboardDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import DataState from '../components/DataState';
import DashboardCharts from '../components/DashboardCharts';
import DashboardProductImage from '../components/DashboardProductImage';
import DashboardRecentOrders from '../components/DashboardRecentOrders';
import AdminIcon, { type AdminIconName } from '../components/AdminIcon';
import { customerName } from '../lib/format';
const shortcuts: Array<{ label: string; href: string; icon: AdminIconName }> = [
  { label: 'سفارش‌های وبسایت', href: '/admin/orders/website', icon: 'orders' },
  { label: 'فروش دستی', href: '/admin/orders/manual', icon: 'receipt' },
  { label: 'دریافت و پرداخت', href: '/admin/settlements', icon: 'wallet' },
  { label: 'افزودن محصول', href: '/admin/products/new', icon: 'plus' },
  { label: 'مدیریت مشتریان', href: '/admin/users', icon: 'users' },
  { label: 'گزارش فروش', href: '/admin/reports', icon: 'reports' },
];
export default function Dashboard() {
  const { admin } = useAdmin();
  const [salesChannel, setSalesChannel] = useState<SalesChannel | ''>('');
  const query = useAdminQuery(
    AdminDashboardDocument,
    { salesChannel: salesChannel || null },
    true,
    { pollInterval: 30000 },
  );
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  if (!query.data) return <DataState error={query.error} retry={query.refresh} />;
  const data = query.data.adminDashboard;
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
      <header className="relative isolate overflow-hidden rounded-3xl bg-[#76100b] p-5 text-white sm:p-7">
        <div aria-hidden="true" className="absolute inset-y-0 end-0 -z-10 w-72 opacity-70">
          <AdminSkyline />
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-[#edc994]">سنتی بهجتی اردکان · میز کار شما</p>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">داشبورد مدیریت</h1>
            <p className="mt-3 text-sm text-[#f2d7ba]">نبض فروشگاه، از سفارش تا دریافت</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
            <p className="text-xs text-[#f2d7ba]">سفارش‌های امروز</p>
            <b className="mt-1 block text-3xl tabular-nums text-[#edc994]">
              {formatNumber(data.ordersToday)}
            </b>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/15 pt-4 text-xs text-[#f2d7ba]">
          <AdminIcon name="calendar" width={17} />
          <time dateTime={now.toISOString()}>
            {new Intl.DateTimeFormat('fa-IR', {
              dateStyle: 'full',
              timeZone: 'Asia/Tehran',
            }).format(now)}
          </time>
          <span className="ms-auto">
            {new Intl.DateTimeFormat('fa-IR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Tehran',
            }).format(now)}
          </span>
        </div>
      </header>
      <AnalyticsRefresh
        refreshing={query.refreshing}
        updatedAt={query.updatedAt}
        error={query.error}
        refresh={query.refresh}
      />
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="آمار اصلی فروشگاه">
        <AnalyticsMetric
          label="خالص دریافتی"
          value={data.revenue}
          amount
          featured
          icon="wallet"
          detail="از ابتدای فعالیت؛ مطابق محل خرید انتخابی"
        />
        <AnalyticsMetric
          label="کل سفارش‌ها"
          value={data.ordersCount}
          icon="orders"
          detail={`${formatNumber(data.ordersThisMonth)} سفارش در ماه جاری`}
        />
        <AnalyticsMetric
          label="مشتریان فروشگاه"
          value={data.customersCount}
          icon="users"
          detail="مطابق محل خرید انتخابی"
        />
        <AnalyticsMetric
          label="محصول فعال"
          value={data.activeProductsCount}
          icon="products"
          detail="کالاهای قابل نمایش در فروشگاه"
        />
      </section>
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
      <section aria-label="مشتریان به تفکیک محل خرید">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">فروش از کدام مسیر آمده؟</h2>
          <span className="text-xs text-[#857467]">برای فیلتر آمار، یک مسیر را انتخاب کنید</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {data.channelMetrics.map((c) => (
            <button
              type="button"
              key={c.salesChannel}
              onClick={() => setSalesChannel(salesChannel === c.salesChannel ? '' : c.salesChannel)}
              aria-pressed={salesChannel === c.salesChannel}
              aria-label={`نمایش آمار خرید از ${salesChannelLabels[c.salesChannel]}`}
              className="min-w-0 rounded-2xl border border-[#e8ded1] bg-white p-4 text-start transition hover:border-[#c69b48] aria-pressed:border-[#96140d] aria-pressed:bg-[#fcf5ed]"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-[#f4e8d3] text-[#96140d]">
                  <AdminIcon
                    name={
                      c.salesChannel === 'WEBSITE'
                        ? 'home'
                        : c.salesChannel === 'INSTAGRAM'
                          ? 'phone'
                          : 'person'
                    }
                    width={19}
                  />
                </span>
                <h3 className="font-bold">خرید از {salesChannelLabels[c.salesChannel]}</h3>
                <AdminIcon name="arrow" className="ms-auto text-[#b59b7c]" width={17} />
              </div>
              <p className="text-xs text-[#76685d]">
                {formatNumber(c.customersCount)} مشتری · {formatNumber(c.ordersCount)} سفارش
              </p>
              <div className="mt-3 text-sm font-bold">
                <span className="mb-1 block text-xs font-medium text-[#857467]">
                  دریافت تخصیص‌یافته
                </span>
                <Money amount={c.revenue} />
              </div>
              <div
                className="mt-3 h-1 overflow-hidden rounded-full bg-[#f2e8da]"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-[#c69b48]"
                  style={{
                    width: `${
                      (c.ordersCount /
                        Math.max(
                          1,
                          data.channelMetrics.reduce((sum, v) => sum + v.ordersCount, 0),
                        )) *
                      100
                    }%`,
                  }}
                />
              </div>
            </button>
          ))}
        </div>
        <details className="mt-3 text-xs leading-6 text-[#857467]">
          <summary className="cursor-pointer">دربارهٔ آمار مسیرهای خرید</summary>مشتریِ دارای خرید
          از چند مسیر، در هر مسیر جدا حساب می‌شود. برای مشتری بدون سفارش، منبع ثبت مبناست. دریافتی
          هر مسیر فقط وجه تخصیص‌یافته به فاکتورهاست؛ پیش‌دریافت و بازپرداخت کلی حساب، در خالص کل
          لحاظ می‌شوند.
        </details>
      </section>
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
                  className="group flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-[#eee3d5] bg-[#fffcf7] px-2 !text-[#34251e] transition hover:border-[#c69b48] hover:bg-[#f8f0e1]"
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
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-4">
        <Card
          title={panelTitle('آخرین سفارش‌ها', '/admin/orders')}
          className="min-w-0 xl:col-span-2"
        >
          <DashboardRecentOrders items={data.recentOrders} onUpdated={query.refresh} />
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
                        <AccountStatus balance={user.accountBalance} amount={false} />
                      </span>
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
