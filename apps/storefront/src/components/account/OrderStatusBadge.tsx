import { orderStatusLabels } from '@behjati/shared';
import type { OrderStatus } from '@/generated/graphql';
import { cn } from '@/lib/utils';
const colors: Record<OrderStatus, string> = {
  CREATED: 'border-border bg-surface/80 text-earth',
  PENDING_PAYMENT: 'border-amber-200/70 bg-amber-50 text-amber-900',
  PROCESSING: 'border-blue-200/70 bg-blue-50 text-blue-900',
  SHIPPED: 'border-sky-200/70 bg-sky-50 text-sky-900',
  DELIVERED: 'border-heritage-green/20 bg-heritage-green/10 text-heritage-green',
  CANCELED: 'border-primary/15 bg-primary/5 text-primary',
};
export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold sm:text-xs',
        colors[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {orderStatusLabels[status]}
    </span>
  );
}
