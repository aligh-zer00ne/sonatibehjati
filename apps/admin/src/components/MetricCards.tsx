import { AmountInWords } from './AmountInWords';
import { Card, Statistic } from 'antd';
import { formatNumber } from '@behjati/shared';
import { toRials } from '../lib/money';
import { cardInteraction } from '../lib/card-interaction';
export default function MetricCards({
  metrics,
}: {
  metrics: Array<{ label: string; value: number; amount?: boolean }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.label} className={`${cardInteraction} overflow-hidden`}>
          <Statistic
            title={metric.label}
            value={metric.amount ? toRials(metric.value) : metric.value}
            formatter={(value) => formatNumber(Number(value))}
            suffix={metric.amount ? 'ریال' : undefined}
          />
          {metric.amount && <AmountInWords amount={metric.value} />}
        </Card>
      ))}
    </div>
  );
}
