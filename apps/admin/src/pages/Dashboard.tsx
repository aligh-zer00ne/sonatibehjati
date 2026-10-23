import AccountStatus from '../components/AccountStatus';
import AnalyticsMetric from '../components/AnalyticsMetric';
import AnalyticsRefresh from '../components/AnalyticsRefresh';
import DashboardOrderExplorer, { type OrderInspection } from '../components/DashboardOrderExplorer';
import ManualOrderModal from '../components/ManualOrderModal';
import { tehranDate } from '@behjati/shared/admin';
import { FilterChips, FilterButton, FilterBar } from '../components/FilterButtons';
import { salesChannels, salesChannelLabels } from '@behjati/shared/sales';
import type { SalesChannel, AdminOrdersInput } from '../generated/graphql';
import { canOpenAdminPath } from '@behjati/shared/permissions';
import { useAdmin } from '../auth/AdminProvider';
import { Money } from '../components/Money';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Empty, Button } from 'antd';
import { formatNumber, formatDate } from '@behjati/shared';
import { AdminDashboardDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import DataState from '../components/DataState';
import DashboardCharts from '../components/DashboardCharts';
import DashboardProductImage from '../components/DashboardProductImage';
import OrdersTable from '../components/OrdersTable';
import AdminIcon, { type AdminIconName } from '../components/AdminIcon';
import { customerName } from '../lib/format';
import AmbientBackdrop from '../components/AmbientBackdrop';
import AdminSkyline from '../components/AdminSkyline';
import MotionButton from '../components/MotionButton';
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
  const navigate = useNavigate();
  const inspectionTrigger = useRef<HTMLElement | SVGElement | null>(null);
  const [inspection, setInspection] = useState<OrderInspection | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const canInspect = !!admin && canOpenAdminPath(admin, '/admin/orders');
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
  const inspect = (title: string, input: AdminOrdersInput) => {
    if (canInspect) {
      const active = document.activeElement;
      inspectionTrigger.current =
        active instanceof HTMLElement || active instanceof SVGElement ? active : null;
      setInspection({ title, input: { ...input, salesChannel: salesChannel || null } });
    }
  };
  const closeInspection = () => {
    setInspection(null);
    requestAnimationFrame(() => {
      if (inspectionTrigger.current?.isConnected) inspectionTrigger.current.focus();
    });
  };
  const reportsPath = '/admin/reports' + (salesChannel ? `?salesChannel=${salesChannel}` : '');
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
    <div className="flex flex-col gap-4 motion-safe:animate-surface-enter" data-admin-dashboard>
      <header className="relative isolate flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-[24px] border border-[#9c5358]/40 bg-[radial-gradient(ellipse_at_top_right,#7b3039,transparent_65%),linear-gradient(125deg,#5c1924,#290c12)] px-5 py-6 text-[#fff5e1] shadow-[0_12px_28px_-12px_#4e141c50] sm:px-7 sm:py-7">
        <AmbientBackdrop />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-64 opacity-40 [mask-image:linear-gradient(to_right,black,transparent)]"
        >
          <AdminSkyline />
        </div>
        <div className="relative z-10">
          <p className="mb-2 text-xs font-semibold text-[#f2d6a2]">
            سنتی بهجتی اردکان · طعم اصالت، از دل کویر
          </p>
          <h1 className="text-2xl font-extrabold text-[#fff5e1] sm:text-[28px]">داشبورد مدیریت</h1>
          <p className="mt-2 text-xs text-[#f2d6a2]">
            <time dateTime={now.toISOString()}>
              {new Intl.DateTimeFormat('fa-IR', {
                dateStyle: 'full',
                timeZone: 'Asia/Tehran',
              }).format(now)}
            </time>
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-2 [&_.ant-btn]:!rounded-xl [&_.ant-btn]:!font-bold [&_.ant-btn-primary]:!border-[#edc57d] [&_.ant-btn-primary]:!bg-[linear-gradient(135deg,#f6dfa0,#dfb65c)] [&_.ant-btn-primary]:!text-[#4b270c] [&_.ant-btn-primary]:!shadow-[0_4px_18px_#edc57d30] [&_.ant-btn-default]:!border-white/25 [&_.ant-btn-default]:!bg-white/10 [&_.ant-btn-default]:!text-[#fff5e1]">
          {canInspect && (
            <Button
              type="primary"
              icon={<AdminIcon name="plus" width={17} />}
              onClick={() => setManualOpen(true)}
            >
              ثبت فروش دستی
            </Button>
          )}
          {admin && canOpenAdminPath(admin, '/admin/settlements') && (
            <Link to="/admin/settlements">
              <Button icon={<AdminIcon name="wallet" width={17} />}>دریافت و پرداخت</Button>
            </Link>
          )}
        </div>
      </header>
      <AnalyticsRefresh
        refreshing={query.refreshing}
        updatedAt={query.updatedAt}
        error={query.error}
        refresh={query.refresh}
      />
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
        <span className="ms-auto text-xs text-[#857467]">
          {salesChannel ? salesChannelLabels[salesChannel] : 'همه مسیرهای خرید'}
        </span>
      </FilterBar>
      <section className="grid grid-cols-2 gap-2 xl:grid-cols-4" aria-label="آمار اصلی فروشگاه">
        <AnalyticsMetric
          compact
          label="خالص دریافتی"
          value={data.revenue}
          amount
          featured
          icon="wallet"
          detail="از ابتدای فعالیت؛ مشاهدهٔ گزارش دریافت"
          onInspect={
            admin && canOpenAdminPath(admin, '/admin/reports')
              ? () => navigate(reportsPath)
              : undefined
          }
          actionLabel="باز کردن گزارش دریافتی"
        />
        <AnalyticsMetric
          compact
          label="سفارش‌های امروز"
          value={data.ordersToday}
          icon="calendar"
          detail="برای دیدن سفارش‌ها کلیک کنید"
          onInspect={
            canInspect
              ? () => inspect('سفارش‌های امروز', { from: tehranDate(), to: tehranDate() })
              : undefined
          }
          actionLabel="نمایش سفارش‌های امروز"
        />
        <AnalyticsMetric
          compact
          label="کل سفارش‌ها"
          value={data.ordersCount}
          icon="orders"
          detail={`${formatNumber(data.ordersThisMonth)} سفارش در ماه جاری`}
          onInspect={canInspect ? () => inspect('همه سفارش‌ها', {}) : undefined}
          actionLabel="نمایش همه سفارش‌ها"
        />
        <AnalyticsMetric
          compact
          label="مشتریان فروشگاه"
          value={data.customersCount}
          icon="users"
          detail={`${formatNumber(data.activeProductsCount)} محصول فعال در فروشگاه`}
          onInspect={
            admin && canOpenAdminPath(admin, '/admin/users')
              ? () => navigate('/admin/users')
              : undefined
          }
          actionLabel="باز کردن مدیریت مشتریان"
        />
      </section>
      <nav className="flex flex-wrap gap-2" aria-label="دسترسی سریع عملیات">
        {shortcuts
          .filter((item) => admin && canOpenAdminPath(admin, item.href))
          .map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex min-h-10 items-center gap-2 rounded-xl border border-[#e5ded3] bg-white px-3 text-xs !text-[#62452f] shadow-[0_2px_6px_#62452f04] transition hover:border-[#c69b48] hover:bg-[#faf5eb] hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-reduce:transition-none"
            >
              <AdminIcon name={item.icon} width={15} />
              {item.label}
            </Link>
          ))}
      </nav>
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <DashboardCharts report={data.report} onInspect={canInspect ? inspect : undefined} />
      </div>
      <section aria-label="مشتریان به تفکیک محل خرید">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">عملکرد مسیرهای خرید</h2>
          <span className="text-xs text-[#857467]">برای فیلتر آمار، یک مسیر را انتخاب کنید</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {data.channelMetrics.map((c) => (
            <MotionButton
              type="button"
              key={c.salesChannel}
              onClick={() => setSalesChannel(salesChannel === c.salesChannel ? '' : c.salesChannel)}
              aria-pressed={salesChannel === c.salesChannel}
              aria-label={`نمایش آمار خرید از ${salesChannelLabels[c.salesChannel]}`}
              className="min-w-0 rounded-2xl border border-[#e8ded1] bg-white p-4 text-start shadow-[0_3px_14px_#62452f06] hover:border-[#c69b48] hover:shadow-[0_10px_24px_#62452f12] aria-pressed:border-[#c69b48] aria-pressed:bg-[linear-gradient(135deg,#fffaf0,#f6e5bd)] aria-pressed:shadow-[0_4px_16px_#c69b4824]"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-[#f4e8d3] text-[#701e2a]">
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
                <Money compact amount={c.revenue} />
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
            </MotionButton>
          ))}
        </div>
        <details className="mt-3 text-xs leading-6 text-[#857467]">
          <summary className="cursor-pointer">دربارهٔ آمار مسیرهای خرید</summary>مشتریِ دارای خرید
          از چند مسیر، در هر مسیر جدا حساب می‌شود. برای مشتری بدون سفارش، منبع ثبت مبناست. دریافتی
          هر مسیر فقط وجه تخصیص‌یافته به فاکتورهاست؛ پیش‌دریافت و بازپرداخت کلی حساب، در خالص کل
          لحاظ می‌شوند.
        </details>
      </section>
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-4">
        <Card
          title={panelTitle('آخرین سفارش‌ها', '/admin/orders')}
          className="min-w-0 xl:col-span-4"
        >
          <OrdersTable items={data.recentOrders.slice(0, 3)} compact onUpdated={query.refresh} />
        </Card>
        <Card
          title={panelTitle('محصولات پرسفارش', '/admin/products')}
          className="min-w-0 xl:col-span-2"
        >
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
        <Card
          title={panelTitle('جدیدترین مشتریان', '/admin/users')}
          className="min-w-0 xl:col-span-2"
        >
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
      {inspection && canInspect && (
        <DashboardOrderExplorer
          key={JSON.stringify(inspection)}
          inspection={inspection}
          onClose={closeInspection}
          onUpdated={query.refresh}
        />
      )}
      {manualOpen && canInspect && (
        <ManualOrderModal
          onClose={() => setManualOpen(false)}
          onSaved={(id) => {
            setManualOpen(false);
            navigate(`/admin/orders/${id}`);
          }}
        />
      )}
    </div>
  );
}
