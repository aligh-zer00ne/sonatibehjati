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
import { cardIconInteraction } from '../lib/card-interaction';
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
        <Link to={href} className="flex items-center gap-1 text-[13px] !text-[#4a5b72]">
          مشاهده همه
          <AdminIcon name="arrow" width={14} height={14} />
        </Link>
      )}
    </div>
  );
  return (
    <div className="flex flex-col gap-4 motion-safe:animate-surface-enter" data-admin-dashboard>
      <header className="relative isolate flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-[24px] border border-[#5c7493]/40 bg-[radial-gradient(ellipse_at_top_right,#395272,transparent_65%),linear-gradient(125deg,#203755,#0f1926)] px-5 py-6 text-[#eceff4] shadow-[0_12px_28px_-12px_#1e3a5f50] sm:px-7 sm:py-7">
        <AmbientBackdrop />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-64 opacity-40 [mask-image:linear-gradient(to_right,black,transparent)]"
        >
          <AdminSkyline />
        </div>
        <div className="relative z-10">
          <p className="mb-2 text-xs font-semibold text-[#a8d1d8]">
            سنتی بهجتی اردکان · طعم اصالت، از دل کویر
          </p>
          <h1 className="text-2xl font-extrabold text-[#eceff4] sm:text-[28px]">داشبورد مدیریت</h1>
          <p className="mt-2 text-xs text-[#a8d1d8]">
            <time dateTime={now.toISOString()}>
              {new Intl.DateTimeFormat('fa-IR', {
                dateStyle: 'full',
                timeZone: 'Asia/Tehran',
              }).format(now)}
            </time>
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-2 [&_.ant-btn]:!rounded-xl [&_.ant-btn]:!font-bold [&_.ant-btn-primary]:!border-[#8bc2cb] [&_.ant-btn-primary]:!bg-[linear-gradient(135deg,#a7d4db,#6faeb7)] [&_.ant-btn-primary]:!text-[#162941] [&_.ant-btn-primary]:!shadow-[0_4px_18px_#8bc2cb30] [&_.ant-btn-default]:!border-white/25 [&_.ant-btn-default]:!bg-white/10 [&_.ant-btn-default]:!text-[#eceff4]">
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
        <span className="ms-auto text-xs text-[#6b7481]">
          {salesChannel ? salesChannelLabels[salesChannel] : 'همه مسیرهای خرید'}
        </span>
      </FilterBar>
      <section className="grid gap-3 min-[540px]:grid-cols-2 xl:grid-cols-4" aria-label="آمار اصلی فروشگاه">
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
              className="flex min-h-10 items-center gap-2 rounded-xl border border-[#d8dbe0] bg-white px-3 text-xs !text-[#35465c] shadow-[0_2px_6px_#35465c04] transition motion-safe:active:translate-y-0 motion-reduce:transition-none"
            >
              <AdminIcon name={item.icon} width={15} />
              {item.label}
            </Link>
          ))}
      </nav>
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <DashboardCharts report={data.report} onInspect={canInspect ? inspect : undefined} />
      </div>
      <section aria-label="مشتریان به تفکیک محل خرید">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">عملکرد مسیرهای خرید</h2>
          <span className="text-xs text-[#6b7481]">برای فیلتر آمار، یک مسیر را انتخاب کنید</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {data.channelMetrics.map((c) => (
            <MotionButton
              type="button"
              key={c.salesChannel}
              onClick={() => setSalesChannel(salesChannel === c.salesChannel ? '' : c.salesChannel)}
              aria-pressed={salesChannel === c.salesChannel}
              aria-label={`نمایش آمار خرید از ${salesChannelLabels[c.salesChannel]}`}
              className="min-w-0 rounded-2xl border border-[#d7dce2] bg-white p-4 text-start shadow-[0_3px_14px_#35465c06] aria-pressed:border-[#5c959e] aria-pressed:bg-[linear-gradient(135deg,#f5f7fa,#bddde1)] aria-pressed:shadow-[0_4px_16px_#5c959e24]"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  data-card-icon
                  className={`${cardIconInteraction} grid size-9 place-items-center rounded-xl bg-[#dce3eb] text-[#2c5282]`}
                >
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
                <AdminIcon name="arrow" className="ms-auto text-[#8396ae]" width={17} />
              </div>
              <p className="text-xs text-[#606873]">
                {formatNumber(c.customersCount)} مشتری · {formatNumber(c.ordersCount)} سفارش
              </p>
              <div className="mt-3 text-sm font-bold">
                <span className="mb-1 block text-xs font-medium text-[#6b7481]">
                  دریافت تخصیص‌یافته
                </span>
                <Money compact amount={c.revenue} />
              </div>
              <div
                className="mt-3 h-1 overflow-hidden rounded-full bg-[#e1e5eb]"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-[#5c959e]"
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
        <details className="mt-3 text-xs leading-6 text-[#6b7481]">
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
            <ul aria-label="محصولات پرسفارش" className="divide-y divide-[#dfe3e8]">
              {data.topProducts.map((product) => (
                <li key={product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <DashboardProductImage src={product.image} title={product.title} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{product.title}</p>
                    <p className="mt-1 text-[13px] text-[#798089]">
                      {<Money amount={product.orderValue} />}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#f5f7f9] px-2 py-1 text-[13px] whitespace-nowrap text-[#2e568b]">
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
            <ul className="divide-y divide-[#dfe3e8]">
              {data.recentUsers.map((user, index) => (
                <li key={user.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full ${['bg-[#dfe4ea] text-[#3f5572]', 'bg-[#eeebfa] text-[#665398]', 'bg-[#e3f3e7] text-[#24815c]'][index % 3]}`}
                  >
                    <AdminIcon name="users" width={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{customerName(user)}</p>
                    <p className="mt-1 text-[13px] text-[#798089]">
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
