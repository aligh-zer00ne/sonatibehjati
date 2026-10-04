import { useState } from 'react';
import { Typography, Card, DatePicker, Select, Button, Alert, Space, Table } from 'antd';
import dayjs from 'dayjs';
import { orderStatuses, orderStatusLabels, formatNumber, formatPrice } from '@behjati/shared';
import { defaultReportRange, adminReportFilterSchema } from '@behjati/shared/admin';
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
  const parsed = adminReportFilterSchema.safeParse({ ...range, status: status || null });
  const query = useAdminQuery(
    AdminReportDocument,
    { input: { ...range, status: status || null } },
    parsed.success,
  );
  const report = query.data?.adminReport;
  return (
    <>
      <Typography.Title level={2}>گزارش سفارش‌ها</Typography.Title>
      <Card>
        <Space wrap align="end">
          <div>
            <label htmlFor="report-from" className="mb-2 block text-xs">
              از تاریخ (میلادی)
            </label>
            <DatePicker
              id="report-from"
              value={dayjs(range.from)}
              allowClear={false}
              format="YYYY/MM/DD"
              onChange={(date) => {
                if (date) setRange({ ...range, from: date.format('YYYY-MM-DD') });
              }}
            />
          </div>
          <div>
            <label htmlFor="report-to" className="mb-2 block text-xs">
              تا تاریخ (میلادی)
            </label>
            <DatePicker
              id="report-to"
              value={dayjs(range.to)}
              allowClear={false}
              format="YYYY/MM/DD"
              onChange={(date) => {
                if (date) setRange({ ...range, to: date.format('YYYY-MM-DD') });
              }}
            />
          </div>
          <Select<OrderStatus | ''>
            aria-label="وضعیت گزارش"
            className="min-w-44"
            value={status}
            onChange={setStatus}
            options={[
              { value: '', label: 'همه وضعیت‌ها' },
              ...orderStatuses.map((value) => ({ value, label: orderStatusLabels[value] })),
            ]}
          />
          <Button
            onClick={() => {
              setRange(defaultReportRange());
              setStatus('');
            }}
          >
            ۳۰ روز اخیر
          </Button>
          <Button
            disabled={!report}
            onClick={() => {
              if (report) downloadReport(report);
            }}
          >
            خروجی CSV
          </Button>
        </Space>
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
              { label: 'درآمد تأییدشده', value: report.revenue, amount: true },
            ]}
          />
          <Alert
            type="info"
            title="درآمد تأییدشده با ارزش سفارش‌ها متفاوت است؛ هنوز پرداختی در سیستم ثبت نمی‌شود."
          />
          <ReportCharts report={report} />
          <Card title="داده‌های روزانه">
            <Table<AdminReportFieldsFragment['daily'][number]>
              rowKey="date"
              dataSource={report.daily}
              pagination={{ pageSize: 15, showSizeChanger: false }}
              scroll={{ x: 650 }}
              columns={[
                { title: 'روز', render: (_, day) => chartDate(day.date) },
                { title: 'تعداد سفارش', render: (_, day) => formatNumber(day.ordersCount) },
                { title: 'ارزش سفارش', render: (_, day) => formatPrice(day.orderValue) },
                { title: 'درآمد تأییدشده', render: (_, day) => formatPrice(day.revenue) },
              ]}
            />
          </Card>
        </>
      )}
    </>
  );
}
