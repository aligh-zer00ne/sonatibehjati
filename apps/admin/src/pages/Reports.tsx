import { FilterButton, FilterChips } from '../components/FilterButtons';
import {
  salesChannels,
  salesChannelLabels,
  shippingMethods,
  shippingMethodLabels,
} from '@behjati/shared/sales';
import type { SalesChannel, ShippingMethod } from '../generated/graphql';
import RecordCards from '../components/RecordCards';
import { Money } from '../components/Money';
import { useState } from 'react';
import { Typography, Card, Select, Button, Alert } from 'antd';
import CalendarPicker from '../components/CalendarPicker';
import { orderStatuses, orderStatusLabels, formatNumber } from '@behjati/shared';
import { defaultReportRange, adminReportFilterSchema, tehranDate } from '@behjati/shared/admin';
import {
  AdminReportDocument,
  type OrderStatus,
  type AdminReportFieldsFragment,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { downloadReport } from '../lib/csv';
import { chartDate } from '../lib/format';
import DataState from '../components/DataState';
import MetricCards from '../components/MetricCards';
import ReportCharts from '../components/ReportCharts';
export default function Reports() {
  const [range, setRange] = useState(defaultReportRange());
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [salesChannel, setSalesChannel] = useState<SalesChannel | ''>('');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | ''>('');
  const filter = {
    ...range,
    status: status || null,
    salesChannel: salesChannel || null,
    shippingMethod: shippingMethod || null,
  };
  const parsed = adminReportFilterSchema.safeParse(filter);
  const query = useAdminQuery(AdminReportDocument, { input: filter }, parsed.success);
  const report = query.data?.adminReport;
  return (
    <>
      <Typography.Title level={2}>گزارش سفارش‌ها</Typography.Title>
      <Card>
        <div className="flex flex-wrap gap-2">
          {[
            { days: 1, label: 'امروز' },
            { days: 7, label: '۷ روز اخیر' },
            { days: 30, label: '۳۰ روز اخیر' },
          ].map((p) => (
            <Button
              key={p.days}
              onClick={() => {
                const to = tehranDate();
                setRange({
                  to,
                  from: new Date(Date.parse(to) - (p.days - 1) * 86400000)
                    .toISOString()
                    .slice(0, 10),
                });
              }}
            >
              {p.label}
            </Button>
          ))}
          <FilterButton label="بازه دلخواه">
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
            <Select<OrderStatus | ''>
              aria-label="وضعیت گزارش"
              className="w-full"
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
            onClick={() => {
              setRange(defaultReportRange());
              setStatus('');
              setSalesChannel('');
              setShippingMethod('');
            }}
          >
            پاک کردن فیلترها
          </Button>
          <Button
            disabled={!report}
            onClick={() => {
              if (report) downloadReport(report);
            }}
          >
            خروجی CSV
          </Button>
        </div>
      </Card>
      {!parsed.success ? (
        <Alert type="error" title="بازه گزارش باید معتبر و حداکثر ۳۶۶ روز باشد." role="alert" />
      ) : !report ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <>
          <MetricCards
            metrics={[
              { label: 'تعداد سفارش', value: report.ordersCount },
              { label: 'ارزش سفارش‌های غیرلغوشده', value: report.orderValue, amount: true },
              {
                label: 'میانگین ارزش سفارش',
                value: Math.round(report.averageOrderValue),
                amount: true,
              },
              { label: 'کل دریافتی', value: report.revenue, amount: true },
              { label: 'پرداخت موفق درگاه', value: report.bankRevenue, amount: true },
              { label: 'دریافت ثبت‌شده توسط مدیر', value: report.offlineRevenue, amount: true },
            ]}
          />
          <Alert
            type="info"
            title="دریافتی‌ها بر اساس تاریخ پرداخت هستند. پرداخت‌های موفق درگاه و دریافت‌های خارج از سایت جدا نمایش داده می‌شوند؛ ارزش سفارش‌های لغوشده در ارزش فروش نیست."
          />
          <ReportCharts report={report} />
          <Card title="داده‌های روزانه">
            <RecordCards<AdminReportFieldsFragment['daily'][number]>
              rowKey="date"
              icon="reports"
              label="گزارش‌های روزانه"
              featuredField="ارزش سفارش"
              dataSource={[...report.daily].sort((a, b) => b.date.localeCompare(a.date))}
              pagination={{ pageSize: 15, showSizeChanger: false }}
              columns={[
                { title: 'روز', render: (_, day) => chartDate(day.date) },
                { title: 'تعداد سفارش', render: (_, day) => formatNumber(day.ordersCount) },
                { title: 'ارزش سفارش', render: (_, day) => <Money amount={day.orderValue} /> },
                { title: 'کل دریافتی', render: (_, day) => <Money amount={day.revenue} /> },
              ]}
            />
          </Card>
        </>
      )}
    </>
  );
}
