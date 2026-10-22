import { useId, useState } from 'react';
import { Card, Empty } from 'antd';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { formatNumber, orderStatusLabels } from '@behjati/shared';
import type { AdminReportFieldsFragment } from '../generated/graphql';
import { Money } from './Money';
import { chartDate } from '../lib/format';
import { toRials } from '../lib/money';

export const compactRials = (amount: number) =>
  new Intl.NumberFormat('fa-IR', { notation: 'compact', maximumFractionDigits: 1 }).format(
    toRials(amount),
  );
export default function ReportCharts({ report }: { report: AdminReportFieldsFragment }) {
  const [view, setView] = useState<'money' | 'count'>('money');
  const gradient = useId().replace(/:/g, '');
  const statuses = report.statuses.filter((s) => s.count > 0);
  const active = report.daily.filter((d) => d.ordersCount > 0 || d.revenue !== 0);
  const best = active.slice().sort((a, b) => b.revenue - a.revenue)[0];
  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
      <Card
        className="min-w-0"
        title="روند فروش و دریافت"
        extra={
          <div className="flex gap-1 rounded-lg bg-[#f4e8d3] p-1">
            {[
              { key: 'money', label: 'مبالغ' },
              { key: 'count', label: 'تعداد' },
            ].map((item) => (
              <button
                type="button"
                key={item.key}
                aria-pressed={view === item.key}
                onClick={() => setView(item.key as 'money' | 'count')}
                className="rounded-md px-2 py-1 text-xs text-[#76685d] aria-pressed:bg-white aria-pressed:text-[#76100b] aria-pressed:shadow-sm"
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      >
        <p className="mb-3 text-xs text-[#857467]">
          {view === 'money'
            ? 'مبالغ به ریال · هر نقطه یک روز'
            : 'تعداد سفارش‌های ثبت‌شده در هر روز'}
        </p>
        <div className="h-64 min-w-0 sm:h-72" dir="ltr" data-report-chart={view}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={report.daily}
              margin={{ top: 15, right: 8, left: 0, bottom: 0 }}
              accessibilityLayer
            >
              <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#96140d" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#96140d" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eee5d9" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={chartDate}
                axisLine={false}
                tickLine={false}
                minTickGap={45}
                tick={{ fontSize: 10, fill: '#857467' }}
                tickMargin={10}
              />
              <YAxis
                tickFormatter={(v) =>
                  view === 'money' ? compactRials(Number(v)) : formatNumber(Number(v))
                }
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={58}
                tick={{ fontSize: 11, fill: '#857467' }}
              />
              <Tooltip
                labelFormatter={(v) => chartDate(String(v))}
                contentStyle={{ borderRadius: 12, borderColor: '#e8ded1', fontFamily: 'inherit' }}
                formatter={(v, name) => [
                  view === 'money' ? <Money amount={Number(v)} /> : formatNumber(Number(v)),
                  name,
                ]}
              />
              {view === 'money' ? (
                <>
                  <Area
                    dataKey="orderValue"
                    name="ارزش فاکتورها"
                    type="monotone"
                    stroke="#c69b48"
                    fill="#f4e8d3"
                    strokeWidth={2}
                    isAnimationActive={false}
                    dot={report.daily.length === 1}
                  />
                  <Area
                    dataKey="revenue"
                    name="خالص دریافتی"
                    type="monotone"
                    stroke="#96140d"
                    fill={`url(#${gradient})`}
                    strokeWidth={3}
                    isAnimationActive={false}
                    dot={report.daily.length === 1}
                  />
                </>
              ) : (
                <Bar
                  dataKey="ordersCount"
                  name="تعداد سفارش"
                  fill="#96140d"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={32}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {view === 'money' && (
          <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs text-[#76685d]">
            <span className="flex items-center gap-2">
              <i className="size-2 rounded-full bg-[#96140d]" />
              خالص دریافتی
            </span>
            <span className="flex items-center gap-2">
              <i className="size-2 rounded-full bg-[#c69b48]" />
              ارزش فاکتورها
            </span>
          </div>
        )}
      </Card>
      <Card className="min-w-0" title="نگاه به این بازه">
        <div className="mb-5 rounded-xl bg-[#f8f1e5] p-4">
          <p className="text-xs text-[#857467]">بیشترین خالص دریافتی روزانه</p>
          {best ? (
            <>
              <p className="mt-2 font-bold text-[#76100b]">
                <Money amount={best.revenue} />
              </p>
              <p className="mt-2 text-xs text-[#76685d]">
                {chartDate(best.date)} · {formatNumber(active.length)} روز دارای فعالیت
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm">هنوز فعالیتی در این بازه ثبت نشده است.</p>
          )}
        </div>
        <h3 className="mb-4 text-sm font-bold">توزیع وضعیت سفارش‌ها</h3>
        {statuses.length ? (
          <ul className="space-y-4">
            {statuses.map((s, index) => (
              <li key={s.status}>
                <div className="mb-2 flex justify-between gap-2 text-xs">
                  <span>{orderStatusLabels[s.status]}</span>
                  <b>{formatNumber(s.count)}</b>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#f4ede3]">
                  <div
                    className={`h-full rounded-full ${index % 2 ? 'bg-[#c69b48]' : 'bg-[#96140d]'}`}
                    style={{ width: `${(s.count / Math.max(1, report.ordersCount)) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="سفارشی ثبت نشده است" />
        )}
      </Card>
    </div>
  );
}
