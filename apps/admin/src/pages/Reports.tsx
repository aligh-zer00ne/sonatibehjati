import AmbientBackdrop from '../components/AmbientBackdrop';
import { FilterButton, FilterChips, FilterBar } from '../components/FilterButtons';
import {
  salesChannels,
  salesChannelLabels,
  shippingMethods,
  shippingMethodLabels,
} from '@behjati/shared/sales';
import type { SalesChannel, ShippingMethod } from '../generated/graphql';
import AnalyticsMetric from '../components/AnalyticsMetric';
import AnalyticsRefresh from '../components/AnalyticsRefresh';
import AdminIcon from '../components/AdminIcon';
import { Money } from '../components/Money';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Button, Alert, Pagination, Switch, Empty } from 'antd';
import CalendarPicker from '../components/CalendarPicker';
import { orderStatuses, orderStatusLabels, formatNumber } from '@behjati/shared';
import { defaultReportRange, adminReportFilterSchema, tehranDate } from '@behjati/shared/admin';
import { AdminReportDocument, type OrderStatus } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { downloadReport } from '../lib/csv';
import { chartDate } from '../lib/format';
import DataState from '../components/DataState';

import ReportCharts from '../components/ReportCharts';
export default function Reports() {
  const [params] = useSearchParams();
  const initial = adminReportFilterSchema.safeParse({
    ...defaultReportRange(),
    ...Object.fromEntries(params),
  });
  const initialFilter = initial.success
    ? initial.data
    : { ...defaultReportRange(), status: null, salesChannel: null, shippingMethod: null };
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [range, setRange] = useState({ from: initialFilter.from, to: initialFilter.to });
  const [status, setStatus] = useState<OrderStatus | ''>(() => initialFilter.status || '');
  const [salesChannel, setSalesChannel] = useState<SalesChannel | ''>(
    () => initialFilter.salesChannel || '',
  );
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | ''>(
    () => initialFilter.shippingMethod || '',
  );
  const filter = {
    ...range,
    status: status || null,
    salesChannel: salesChannel || null,
    shippingMethod: shippingMethod || null,
  };
  const parsed = adminReportFilterSchema.safeParse(filter);
  const query = useAdminQuery(AdminReportDocument, { input: filter }, parsed.success, {
    pollInterval: 30000,
  });
  const report = query.data?.adminReport;
  const daily = (report?.daily ?? [])
    .filter((d) => !activeOnly || d.ordersCount > 0 || d.revenue !== 0)
    .slice()
    .reverse();
  const currentPage = Math.min(page, Math.max(1, Math.ceil(daily.length / 10)));
  const setPreset = (days: number) => {
    const to = tehranDate();
    setPage(1);
    setRange({
      to,
      from: new Date(Date.parse(to) - (days - 1) * 86400000).toISOString().slice(0, 10),
    });
  };
  return (
    <div className="space-y-5" data-admin-reports>
      <header className="relative isolate overflow-hidden rounded-3xl bg-[#4e141c] p-5 text-white sm:p-7">
        <AmbientBackdrop />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-12 -top-20 size-72 rounded-full border-[36px] border-[#e8bd70]/10"
        />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs tracking-wide text-[#edc994]">
              تصویر روشن از عملکرد فروشگاه
            </span>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">گزارش سفارش‌ها</h1>
            <p className="mt-3 text-sm text-[#f0d9c3]">
              {chartDate(range.from)} تا {chartDate(range.to)}
            </p>
          </div>
          <Button
            icon={<AdminIcon name="download" width={17} />}
            disabled={!report}
            onClick={() => {
              if (report) downloadReport(report);
            }}
          >
            خروجی CSV
          </Button>
        </div>
        <div className="relative z-10 mt-5 flex flex-wrap gap-2" aria-label="بازه‌های سریع گزارش">
          {[
            { days: 1, label: 'امروز' },
            { days: 7, label: '۷ روز اخیر' },
            { days: 30, label: '۳۰ روز اخیر' },
          ].map((preset) => (
            <button
              key={preset.days}
              type="button"
              onClick={() => setPreset(preset.days)}
              aria-pressed={
                range.to === tehranDate() &&
                range.from ===
                  new Date(Date.parse(tehranDate()) - (preset.days - 1) * 86400000)
                    .toISOString()
                    .slice(0, 10)
              }
              className="rounded-full border border-white/20 px-4 py-2 text-xs transition hover:bg-white/15 aria-pressed:border-[#e9c27a] aria-pressed:bg-[#e9c27a] aria-pressed:text-[#4d210e]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </header>
      <AnalyticsRefresh
        refreshing={query.refreshing}
        updatedAt={query.updatedAt}
        error={query.error}
        refresh={query.refresh}
      />
      <FilterBar label="فیلترهای گزارش">
        <FilterButton label="بازه گزارش">
          <div>
            <label htmlFor="report-from" className="mb-2 block text-xs">
              از تاریخ
            </label>
            <CalendarPicker
              id="report-from"
              clearable={false}
              value={range.from}
              onChange={(date) => {
                if (date) setRange({ ...range, from: date });
              }}
            />
          </div>
          <div>
            <label htmlFor="report-to" className="mb-2 block text-xs">
              تا تاریخ
            </label>
            <CalendarPicker
              id="report-to"
              clearable={false}
              value={range.to}
              onChange={(date) => {
                if (date) setRange({ ...range, to: date });
              }}
            />
          </div>
        </FilterButton>
        <FilterButton label="وضعیت گزارش" active={!!status}>
          <FilterChips<OrderStatus | ''>
            label="وضعیت گزارش"
            value={status}
            onChange={setStatus}
            options={[
              { value: '', label: 'همه وضعیت‌ها' },
              ...orderStatuses.map((value) => ({ value, label: orderStatusLabels[value] })),
            ]}
          />
        </FilterButton>
        <FilterButton label="محل خرید" active={!!salesChannel}>
          <FilterChips<SalesChannel | ''>
            label="محل خرید گزارش"
            value={salesChannel}
            options={[
              { value: '', label: 'همه خریدها' },
              ...salesChannels.map((value) => ({ value, label: salesChannelLabels[value] })),
            ]}
            onChange={setSalesChannel}
          />
        </FilterButton>
        <FilterButton label="شیوه ارسال" active={!!shippingMethod}>
          <FilterChips<ShippingMethod | ''>
            label="شیوه ارسال گزارش"
            value={shippingMethod}
            options={[
              { value: '', label: 'همه روش‌ها' },
              ...shippingMethods.map((value) => ({ value, label: shippingMethodLabels[value] })),
            ]}
            onChange={setShippingMethod}
          />
        </FilterButton>
        <Button
          type="text"
          size="small"
          className="!ms-auto !text-[12px] !text-[#701e2a]"
          onClick={() => {
            setRange(defaultReportRange());
            setStatus('');
            setSalesChannel('');
            setShippingMethod('');
          }}
        >
          پاک کردن فیلترها
        </Button>
      </FilterBar>
      {!parsed.success ? (
        <Alert type="error" title="بازه گزارش باید معتبر و حداکثر ۳۶۶ روز باشد." role="alert" />
      ) : !report ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 xl:grid-cols-3" aria-label="خلاصه عملکرد فروش">
            <AnalyticsMetric
              label="خالص دریافتی"
              value={report.revenue}
              amount
              featured
              icon="wallet"
              detail="وجه دریافت‌شده پس از کسر پرداخت به مشتری"
            />
            <AnalyticsMetric
              label="تعداد سفارش"
              value={report.ordersCount}
              icon="orders"
              detail="سفارش‌های ثبت‌شده در بازهٔ انتخابی"
            />
            <AnalyticsMetric
              label="ارزش فاکتورها"
              value={report.orderValue}
              amount
              icon="receipt"
              detail="جمع فاکتورها بدون سفارش‌های لغوشده"
            />
            <AnalyticsMetric
              label="پرداخت موفق درگاه"
              value={report.bankRevenue}
              amount
              icon="shield"
              detail="پرداخت تأییدشدهٔ سفارش‌های وبسایت"
            />
            <AnalyticsMetric
              label="خالص حساب مشتریان"
              value={report.offlineRevenue}
              amount
              icon="person"
              detail={
                salesChannel || shippingMethod || status
                  ? 'دریافت‌های تخصیص‌یافته به فاکتورهای این فیلتر'
                  : 'خالص دریافت و پرداخت دفتر حساب مشتریان'
              }
            />
            <AnalyticsMetric
              label="میانگین ارزش سفارش"
              value={Math.round(report.averageOrderValue)}
              amount
              icon="trend"
              detail="میانگین فاکتورهای غیرلغوشدهٔ این بازه"
            />
            <AnalyticsMetric
              label="دریافت لینک عمومی"
              value={report.paymentLinkRevenue}
              amount
              icon="link"
              detail="پرداخت تأییدشدهٔ لینک‌های مبلغ دلخواه، بدون سفارش"
            />
          </section>
          <details className="rounded-xl border border-[#e8ded1] bg-[#fcf9f3] px-4 py-3 text-xs leading-7 text-[#76685d]">
            <summary className="cursor-pointer font-semibold text-[#62452f]">
              این اعداد چطور محاسبه می‌شوند؟
            </summary>
            دریافتی بر اساس تاریخ دریافت یا پرداخت است و ارزش فاکتور بر اساس تاریخ ثبت سفارش. گزارش
            کل، پیش‌دریافت و بازپرداخت مشتری و دریافت لینک عمومی را هم لحاظ می‌کند. لینک ماندهٔ
            مشتری در خالص حساب مشتریان ثبت می‌شود و دوباره جمع نمی‌شود. با فیلتر محل خرید، ارسال یا
            وضعیت، فقط دریافت‌های تخصیص‌یافته به فاکتورهای منطبق گزارش می‌شوند؛ جمع این فیلترها
            لزوماً با خالص کل برابر نیست.
          </details>
          <ReportCharts report={report} />
          <Card
            title="داده‌های روزانه"
            extra={
              <span className="flex items-center gap-2 text-xs">
                <Switch
                  size="small"
                  checked={activeOnly}
                  onChange={(checked) => {
                    setActiveOnly(checked);
                    setPage(1);
                  }}
                  aria-label="فقط روزهای دارای فعالیت"
                />
                روزهای فعال
              </span>
            }
          >
            <div role="table" aria-label="گزارش‌های روزانه" className="min-w-0">
              <div
                role="row"
                className="mb-2 hidden grid-cols-[1.1fr_.6fr_1.2fr_1.2fr] gap-3 rounded-lg bg-[#f8f1e5] p-3 text-xs text-[#76685d] sm:grid"
              >
                <span role="columnheader">روز</span>
                <span role="columnheader">سفارش</span>
                <span role="columnheader">ارزش فاکتورها</span>
                <span role="columnheader">خالص دریافتی</span>
              </div>
              {daily.slice((currentPage - 1) * 10, currentPage * 10).map((day) => (
                <div
                  key={day.date}
                  role="row"
                  className="grid grid-cols-2 items-start gap-3 border-b border-[#eee5d9] py-3 last:border-0 sm:grid-cols-[1.1fr_.6fr_1.2fr_1.2fr] sm:px-3"
                  data-report-day={day.date}
                >
                  <span role="cell" className="text-sm font-semibold">
                    {chartDate(day.date)}
                  </span>
                  <span role="cell" className="text-xs sm:text-sm">
                    {formatNumber(day.ordersCount)} سفارش
                  </span>
                  <div role="cell" className="min-w-0 text-xs">
                    <span className="mb-1 block text-[#857467] sm:hidden">ارزش فاکتورها</span>
                    <Money amount={day.orderValue} />
                  </div>
                  <div role="cell" className="min-w-0 text-xs">
                    <span className="mb-1 block text-[#857467] sm:hidden">خالص دریافتی</span>
                    <Money amount={day.revenue} />
                  </div>
                </div>
              ))}
            </div>
            {!daily.length && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="در این بازه فعالیتی ثبت نشده است."
              />
            )}
            {daily.length > 10 && (
              <Pagination
                current={currentPage}
                pageSize={10}
                total={daily.length}
                onChange={setPage}
                showSizeChanger={false}
                className="!mt-4 !flex !flex-wrap !justify-center"
              />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
