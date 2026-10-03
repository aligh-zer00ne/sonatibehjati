import { orderStatusLabels } from '@behjati/shared';
import type { OrderStatus } from '@/generated/graphql';
export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className="inline-flex rounded-full border border-border bg-surface px-3 py-2 text-xs font-bold text-earth">
      {orderStatusLabels[status]}
    </span>
  );
}
