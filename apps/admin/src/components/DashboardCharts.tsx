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
} from 'recharts';
import { formatNumber, orderStatusLabels } from '@behjati/shared';
import type { AdminReportFieldsFragment } from '../generated/graphql';
import { Money } from './Money';
import { chartDate } from '../lib/format';
import AdminIcon from './AdminIcon';
const colors = ['#b01032', '#f5a54c', '#03a77b', '#49aeb7', '#789acd', '#f36b72'];
export default function DashboardCharts({ report }: { report: AdminReportFieldsFragment }) {
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
            ارزش سفارش‌های ۷ روز اخیر
          </span>
        }
        className="min-w-0 xl:col-span-2"
      >
        <div className="h-[235px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={report.daily.slice(-7)}
              margin={{ top: 16, right: 12, bottom: 0, left: 4 }}
              accessibilityLayer
            >
              <defs>
                <linearGradient id="dashboard-order-value" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(value) => formatNumber(Number(value))}
                axisLine={false}
                tickLine={false}
                width={82}
                fontSize={10}
              />
              <Tooltip
                labelFormatter={(value) => chartDate(String(value))}
                formatter={(value) => [<Money amount={Number(value)} />, 'ارزش سفارش']}
              />
              <Area
                type="monotone"
                dataKey="orderValue"
                stroke="#a50f30"
                fill="url(#dashboard-order-value)"
                strokeWidth={2}
                dot={{ r: 3, fill: '#a50f30' }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-[10px] text-[#8c8176]">
          ارزش سفارش‌های غیرلغوشده؛ این مبلغ معادل درآمد دریافت‌شده نیست.
        </p>
      </Card>
      <Card title="وضعیت سفارش‌ها" className="min-w-0">
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
                  />
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                <b className="text-xl">{formatNumber(report.ordersCount)}</b>
                <span className="text-[10px] text-[#7d746a]">سفارش در ۳۰ روز اخیر</span>
              </div>
            </div>
            <ul className="mt-2 grid gap-2 text-[11px]">
              {statuses.map((item) => (
                <li key={item.status} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span style={{ backgroundColor: item.fill }} className="size-2 rounded-full" />
                    {item.name}
                  </span>
                  <b>{formatNumber(item.count)}</b>
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
