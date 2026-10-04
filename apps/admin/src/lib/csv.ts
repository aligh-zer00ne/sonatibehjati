import type { AdminReportFieldsFragment } from '../generated/graphql';
export function reportCSV(report: AdminReportFieldsFragment) {
  const rows = [
    ['تاریخ میلادی', 'تعداد سفارش', 'ارزش سفارش‌های غیرلغوشده (تومان)', 'درآمد تأییدشده (تومان)'],
    ...report.daily.map((day) => [day.date, day.ordersCount, day.orderValue, day.revenue]),
  ];
  return (
    '\uFEFF' +
    rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\r\n')
  );
}
export function downloadReport(report: AdminReportFieldsFragment) {
  const url = URL.createObjectURL(
    new Blob([reportCSV(report)], { type: 'text/csv;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `orders-${report.from}-${report.to}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
