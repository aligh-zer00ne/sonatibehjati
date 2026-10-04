import { Card, Empty } from 'antd';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
} from 'recharts';
import { formatNumber, orderStatusLabels } from '@behjati/shared';
import type { AdminReportFieldsFragment } from '../generated/graphql';
import { chartDate } from '../lib/format';
export default function ReportCharts({ report }: { report: AdminReportFieldsFragment }) {
  const statuses = report.statuses
    .filter((item) => item.count > 0)
    .map((item, index) => ({
      ...item,
      name: orderStatusLabels[item.status],
      fill: ['#a52a2a', '#d49b25', '#4084bd', '#349ba2', '#469169', '#c66060'][index % 6],
    }));
  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-2">
      <Card title="تعداد سفارش روزانه" className="min-w-0">
        <div className="h-72 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report.daily} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={chartDate} />
              <YAxis tickFormatter={(value) => formatNumber(Number(value))} allowDecimals={false} />
              <Tooltip labelFormatter={(value) => chartDate(String(value))} />
              <Line
                dataKey="ordersCount"
                name="تعداد سفارش"
                stroke="#96140d"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="ارزش سفارش و درآمد روزانه" className="min-w-0">
        <div className="h-72 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report.daily} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={chartDate} />
              <YAxis tickFormatter={(value) => formatNumber(Number(value))} width={90} />
              <Tooltip labelFormatter={(value) => chartDate(String(value))} />
              <Legend />
              <Line
                dataKey="orderValue"
                name="ارزش سفارش‌ها (تومان)"
                stroke="#4084bd"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="revenue"
                name="درآمد تأییدشده (تومان)"
                stroke="#469169"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="توزیع وضعیت سفارش‌ها" className="min-w-0 xl:col-span-2">
        <div className="h-72 w-full" dir="ltr">
          {statuses.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statuses}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label
                  isAnimationActive={false}
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="در این بازه سفارشی ثبت نشده است" />
          )}
        </div>
      </Card>
    </div>
  );
}
