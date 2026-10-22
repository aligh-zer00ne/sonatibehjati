import { useId, useState } from 'react';
import { compactRials } from './ReportCharts';
import { formatAdminPrice } from '../lib/money';
import { Card, Empty } from 'antd';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Sector,
  type PieSectorShapeProps,
} from 'recharts';
import { formatNumber, orderStatusLabels } from '@behjati/shared';
import type {
  AdminReportFieldsFragment,
  AdminOrdersInput,
  OrderStatus,
} from '../generated/graphql';
import { Money } from './Money';
import { chartDate } from '../lib/format';
import AdminIcon from './AdminIcon';
const colors = ['#96140d', '#c69b48', '#70614d', '#d09f86', '#366e58', '#b66565'];
export default function DashboardCharts({
  report,
  onInspect,
}: {
  report: AdminReportFieldsFragment;
  onInspect?: (title: string, input: AdminOrdersInput) => void;
}) {
  const inspectStatus = (status: OrderStatus) =>
    onInspect?.(`سفارش‌های ${orderStatusLabels[status]}`, {
      from: report.from,
      to: report.to,
      status,
    });
  const [days, setDays] = useState(7);
  const [metric, setMetric] = useState<'orderValue' | 'revenue'>('orderValue');
  const gradient = useId().replace(/:/g, '');
  const series = report.daily.slice(-days);
  const statuses = report.statuses
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      name: orderStatusLabels[item.status],
      fill: colors[report.statuses.findIndex((row) => row.status === item.status) % colors.length],
    }));
  return (
    <>
      <Card
        title={
          <span className="flex items-center gap-2">
            <AdminIcon name="reports" className="text-[#930d25]" />
            روند فروشگاه
          </span>
        }
        extra={
          <div className="flex gap-1 rounded-lg bg-[#f4e8d3] p-1" aria-label="بازه نمودار داشبورد">
            {[7, 30].map((n) => (
              <button
                type="button"
                key={n}
                aria-pressed={days === n}
                onClick={() => setDays(n)}
                className="rounded-md px-2 py-1 text-xs text-[#76685d] aria-pressed:bg-white aria-pressed:text-[#76100b]"
              >
                {formatNumber(n)} روز
              </button>
            ))}
          </div>
        }
        className="min-w-0"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <b className="text-lg text-[#76100b]">
            {formatAdminPrice(series.reduce((sum, d) => sum + d[metric], 0))}
          </b>
          <div className="flex gap-3 text-xs">
            {[
              { key: 'orderValue', label: 'ارزش فاکتورها' },
              { key: 'revenue', label: 'دریافتی' },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                aria-pressed={metric === m.key}
                onClick={() => setMetric(m.key as 'orderValue' | 'revenue')}
                className="border-b-2 border-transparent py-1 text-[#857467] aria-pressed:border-[#96140d] aria-pressed:text-[#76100b]"
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[235px] w-full" dir="ltr" data-dashboard-chart={metric}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={series}
              margin={{ top: 16, right: 12, bottom: 0, left: 4 }}
              accessibilityLayer
              onClick={(state) => {
                const day = series.find((d) => d.date === state.activeLabel);
                if (metric === 'orderValue' && day)
                  onInspect?.(`سفارش‌های ${chartDate(day.date)}`, { from: day.date, to: day.date });
              }}
            >
              <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ad1634" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#ad1634" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eee7de" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={chartDate}
                axisLine={false}
                tickLine={false}
                fontSize={10}
                tickMargin={12}
              />
              <YAxis
                tickFormatter={(value) => compactRials(Number(value))}
                axisLine={false}
                tickLine={false}
                width={60}
                fontSize={10}
              />
              <Tooltip
                labelFormatter={(value) => chartDate(String(value))}
                formatter={(value) => [
                  <Money amount={Number(value)} />,
                  metric === 'orderValue' ? 'ارزش فاکتورها' : 'خالص دریافتی',
                ]}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="#a50f30"
                fill={`url(#${gradient})`}
                strokeWidth={2}
                dot={series.length === 1 ? { r: 3, fill: '#a50f30' } : false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#857467]">
          <span>مبالغ به ریال · مطابق محل خرید</span>
          {onInspect && (
            <button
              type="button"
              className="font-semibold text-[#96140d]"
              onClick={() =>
                onInspect(`سفارش‌های ${formatNumber(days)} روز اخیر`, {
                  from: series[0]?.date ?? report.from,
                  to: report.to,
                })
              }
            >
              سفارش‌های این بازه ←
            </button>
          )}
        </div>
        {onInspect && (
          <div
            className="mt-3 flex flex-wrap gap-1.5 border-t border-[#eee5d9] pt-3"
            aria-label="سفارش‌های روزهای فعال"
          >
            {series
              .filter((d) => d.ordersCount > 0)
              .slice(-7)
              .map((d) => (
                <button
                  type="button"
                  key={d.date}
                  onClick={() =>
                    onInspect(`سفارش‌های ${chartDate(d.date)}`, { from: d.date, to: d.date })
                  }
                  className="rounded-md border border-[#e8ded1] bg-[#fcf9f3] px-2 py-1 text-[11px] text-[#62452f] hover:bg-[#f4e8d3]"
                >
                  {chartDate(d.date)} · {formatNumber(d.ordersCount)} سفارش
                </button>
              ))}
          </div>
        )}
      </Card>
      <Card
        title="وضعیت سفارش‌ها"
        extra={
          onInspect ? (
            <button
              type="button"
              className="text-xs text-[#96140d]"
              onClick={() =>
                onInspect('سفارش‌های ۳۰ روز اخیر', { from: report.from, to: report.to })
              }
            >
              مشاهده همه
            </button>
          ) : undefined
        }
        className="min-w-0"
      >
        {statuses.length ? (
          <>
            <div className="relative h-44" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statuses}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={53}
                    outerRadius={77}
                    paddingAngle={2}
                    isAnimationActive={false}
                    rootTabIndex={-1}
                    shape={(props: PieSectorShapeProps) => {
                      const item = statuses[props.index];
                      return (
                        <Sector
                          {...props}
                          data-dashboard-status={item?.status}
                          role={onInspect ? 'button' : undefined}
                          tabIndex={onInspect ? 0 : -1}
                          aria-label={item ? `نمایش سفارش‌های ${item.name} در نمودار` : undefined}
                          className={
                            onInspect
                              ? 'cursor-pointer transition-opacity hover:opacity-75 focus:outline-none focus:stroke-[#34251e] focus:stroke-2'
                              : ''
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item) inspectStatus(item.status);
                          }}
                          onKeyDown={(e) => {
                            if (onInspect && item && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault();
                              inspectStatus(item.status);
                            }
                          }}
                        />
                      );
                    }}
                  />
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                <b className="text-xl">{formatNumber(report.ordersCount)}</b>
                <span className="text-[12px] text-[#7d746a]">سفارش در ۳۰ روز اخیر</span>
              </div>
            </div>
            <p className="mb-2 text-center text-[11px] text-[#857467]">
              {onInspect
                ? 'روی بخش نمودار یا وضعیت بزنید تا سفارش‌ها باز شوند.'
                : 'آمار ۳۰ روز اخیر'}
            </p>
            <ul className="mt-2 grid gap-2 text-[12px]">
              {statuses.map((item) => (
                <li key={item.status}>
                  <button
                    type="button"
                    disabled={!onInspect}
                    aria-label={`نمایش سفارش‌های ${item.name}`}
                    onClick={() => inspectStatus(item.status)}
                    className="flex min-h-9 w-full items-center justify-between gap-2 rounded-lg border border-transparent px-2 text-start text-xs hover:border-[#e8ded1] hover:bg-[#faf6ee] disabled:cursor-default disabled:hover:border-transparent disabled:hover:bg-transparent"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        style={{ backgroundColor: item.fill }}
                        className="size-2 rounded-full"
                      />
                      {item.name}
                    </span>
                    <span className="flex items-center gap-2">
                      <b>{formatNumber(item.count)}</b>
                      {onInspect && <AdminIcon name="arrow" width={13} />}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="هنوز سفارشی در این بازه ثبت نشده است"
            className="!my-14"
          />
        )}
      </Card>
    </>
  );
}
