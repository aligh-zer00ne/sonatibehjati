import { Card, Statistic } from 'antd';
import { formatNumber } from '@behjati/shared';
export default function MetricCards({
  metrics,
}: {
  metrics: Array<{ label: string; value: number; amount?: boolean }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <Statistic
            title={metric.label}
            value={metric.value}
            formatter={(value) => formatNumber(Number(value))}
            suffix={metric.amount ? 'تومان' : undefined}
          />
        </Card>
      ))}
    </div>
  );
}
