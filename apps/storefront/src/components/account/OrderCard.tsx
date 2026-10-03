import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { formatNumber, formatPrice, formatDate } from '@behjati/shared';
import type { AccountOrderSummaryFieldsFragment } from '@/generated/graphql';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OrderStatusBadge from './OrderStatusBadge';
export default function OrderCard({ order }: { order: AccountOrderSummaryFieldsFragment }) {
  return (
    <Card className="rounded-3xl bg-card/85 p-5 transition duration-300 hover:border-clay/50 hover:shadow-lg motion-safe:hover:-translate-y-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-extrabold">
          <Package size={20} className="text-clay" />
          سفارش {formatNumber(order.number)}
        </h3>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="my-4 flex flex-wrap justify-between gap-2 text-sm">
        <time dateTime={order.createdAt} className="text-muted-foreground">
          {formatDate(order.createdAt)}
        </time>
        <b>{formatPrice(order.total)}</b>
      </div>
      <Button asChild variant="outline" className="w-full sm:w-auto">
        <Link
          href={`/account/orders/${order.id}`}
          aria-label={`جزئیات سفارش ${formatNumber(order.number)}`}
        >
          جزئیات سفارش
          <ArrowLeft size={16} />
        </Link>
      </Button>
    </Card>
  );
}
