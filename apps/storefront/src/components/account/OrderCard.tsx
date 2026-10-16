import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { formatNumber, formatPrice, formatDate } from '@behjati/shared';
import type { AccountOrderSummaryFieldsFragment } from '@/generated/graphql';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OrderStatusBadge from './OrderStatusBadge';
export default function OrderCard({ order }: { order: AccountOrderSummaryFieldsFragment }) {
  return (
    <Card className="rounded-[22px] bg-card p-4 shadow-none transition-colors hover:border-clay/50 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-surface/70 text-clay">
            <Package size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold">سفارش {formatNumber(order.number)}</h3>
            <time
              dateTime={order.createdAt}
              className="mt-1 block text-[11px] text-muted-foreground"
            >
              {formatDate(order.createdAt)}
            </time>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
        <b className="text-sm text-earth">{formatPrice(order.total)}</b>
        <Button asChild variant="ghost" size="sm" className="gap-2 rounded-xl px-2 text-xs">
          <Link
            href={`/account/orders/${order.id}`}
            aria-label={`جزئیات سفارش ${formatNumber(order.number)}`}
          >
            جزئیات سفارش
            <ArrowLeft size={15} aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
