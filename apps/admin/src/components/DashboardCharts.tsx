import { useEffect, useId, useMemo, useState } from 'react';
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
import AmbientBackdrop from './AmbientBackdrop';
const colors = ['#c57d8a', '#e6c06e', '#a79b8a', '#d9af91', '#78a78e', '#cd8d88'];
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
  const [activeStatus, setActiveStatus] = useState<OrderStatus | null>(null);
  const [introFinished, setIntroFinished] = useState(false);
  const [animate, setAnimate] = useState(
    () => !matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setAnimate(!media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const gradient = useId().replace(/:/g, '');
  const series = report.daily.slice(-days);
  const statuses = useMemo(
    () =>
      report.statuses
        .filter((item) => item.count > 0)
        .map((item) => ({
          ...item,
          name: orderStatusLabels[item.status],
          fill: colors[
            report.statuses.findIndex((row) => row.status === item.status) % colors.length
          ],
        })),
    [report.statuses],
  );
  const highlighted = statuses.find((item) => item.status === activeStatus);
  const share = (count: number) =>
    report.ordersCount ? Math.round((count / report.ordersCount) * 100) : 0;
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
                className="min-h-9 rounded-lg px-3 py-1 text-xs font-semibold text-[#76685d] transition aria-pressed:bg-[linear-gradient(135deg,#f6dfa0,#dfb65c)] aria-pressed:text-[#4b270c] aria-pressed:shadow-[0_3px_8px_#c69b4830] motion-safe:active:scale-95 motion-reduce:transition-none"
              >
                {formatNumber(n)} روز
              </button>
            ))}
          </div>
        }
        className="min-w-0"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <b className="text-lg text-[#4e141c]">
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
                className="border-b-2 border-transparent py-1 text-[#857467] aria-pressed:border-[#701e2a] aria-pressed:text-[#4e141c]"
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
                fontSize={12}
                tickMargin={12}
              />
              <YAxis
                tickFormatter={(value) => compactRials(Number(value))}
                axisLine={false}
                tickLine={false}
                width={60}
                fontSize={12}
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
              className="font-semibold text-[#701e2a]"
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
                  className="rounded-md border border-[#e8ded1] bg-[#fcf9f3] px-2 py-1 text-[13px] text-[#62452f] hover:bg-[#f4e8d3]"
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
              className="text-xs text-[#701e2a]"
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
            <div
              data-dashboard-donut
              data-donut-ready={!animate || introFinished}
              className="relative isolate mx-auto mb-3 h-[248px] w-full overflow-hidden rounded-[24px] border border-[#d7b476]/40 bg-[radial-gradient(ellipse_at_top_right,#71333d,transparent_70%),linear-gradient(135deg,#521b25,#290c12)] shadow-[inset_0_1px_0_#fff4cd20]"
              dir="ltr"
            >
              <AmbientBackdrop />
              <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                <PieChart>
                  <Pie
                    data={statuses}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={82}
                    outerRadius={106}
                    paddingAngle={4}
                    cornerRadius={6}
                    isAnimationActive={animate && !introFinished}
                    onAnimationEnd={() => setIntroFinished(true)}
                    animationDuration={700}
                    rootTabIndex={-1}
                    shape={(props: PieSectorShapeProps) => {
                      const item = statuses[props.index];
                      return (
                        <Sector
                          {...props}
                          outerRadius={
                            (props.outerRadius ?? 106) + (activeStatus === item?.status ? 5 : 0)
                          }
                          opacity={activeStatus && activeStatus !== item?.status ? 0.4 : 1}
                          data-dashboard-status={item?.status}
                          role={onInspect ? 'button' : undefined}
                          tabIndex={onInspect ? 0 : -1}
                          aria-label={item ? `نمایش سفارش‌های ${item.name} در نمودار` : undefined}
                          className={
                            onInspect
                              ? 'cursor-pointer motion-safe:transition-opacity motion-safe:duration-200 focus:outline-none focus:stroke-[#34251e] focus:stroke-2'
                              : ''
                          }
                          onMouseEnter={() => item && setActiveStatus(item.status)}
                          onMouseLeave={() => setActiveStatus(null)}
                          onFocus={() => item && setActiveStatus(item.status)}
                          onBlur={() => setActiveStatus(null)}
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
                </PieChart>
              </ResponsiveContainer>
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex w-[144px] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
                dir="rtl"
                aria-live="polite"
                data-donut-summary
              >
                <span className="mb-1 text-[13px] leading-5 font-semibold text-[#f7d98e]">
                  {highlighted
                    ? `${formatNumber(share(highlighted.count))}٪ از سفارش‌ها`
                    : 'نمای کلی سفارش‌ها'}
                </span>
                <b className="text-[38px] leading-[48px] font-black tabular-nums text-[#fff4d8]">
                  {formatNumber(highlighted?.count ?? report.ordersCount)}
                </b>
                <span className="mt-1 w-full text-sm leading-6 font-semibold text-[#fff0cf]">
                  {highlighted?.name ?? 'سفارش در ۳۰ روز اخیر'}
                </span>
              </div>
            </div>
            <p className="mb-2 text-center text-[13px] leading-6 text-[#6d594b]">
              {onInspect
                ? 'روی بخش نمودار یا وضعیت بزنید تا سفارش‌ها باز شوند.'
                : 'آمار ۳۰ روز اخیر'}
            </p>
            <ul className="mt-2 grid gap-2 text-[13px]">
              {statuses.map((item) => (
                <li key={item.status}>
                  <button
                    type="button"
                    disabled={!onInspect}
                    aria-label={`نمایش سفارش‌های ${item.name}`}
                    onClick={() => inspectStatus(item.status)}
                    onMouseEnter={() => setActiveStatus(item.status)}
                    onMouseLeave={() => setActiveStatus(null)}
                    onFocus={() => setActiveStatus(item.status)}
                    onBlur={() => setActiveStatus(null)}
                    className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-[#eee5d9] bg-[#fcfaf6] px-3 text-start text-xs hover:border-[#c69b48] hover:bg-[#faf3e5] focus-visible:border-[#c69b48] disabled:cursor-default"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        style={{ backgroundColor: item.fill }}
                        className="size-2 rounded-full"
                      />
                      {item.name}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-[13px] text-[#857467]">
                        {formatNumber(share(item.count))}٪
                      </span>
                      <b className="min-w-6 text-center text-lg">{formatNumber(item.count)}</b>
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
