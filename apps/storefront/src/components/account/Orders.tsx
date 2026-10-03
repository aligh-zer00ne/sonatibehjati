'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { orderStatuses, orderStatusLabels, formatNumber } from '@behjati/shared';
import { AccountOrdersDocument, type OrderStatus } from '@/generated/graphql';
import { useAccountQuery } from '@/hooks/useAccountQuery';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import AccountDataState from './AccountDataState';
import OrderCard from './OrderCard';
export default function Orders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const query = useAccountQuery(AccountOrdersDocument, {
    input: { page, pageSize: 10, status: status || null },
  });
  const orders = query.data?.myOrders;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm font-bold">
          <label htmlFor="orders-status">وضعیت</label>
          <select
            id="orders-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as OrderStatus | '');
              setPage(1);
            }}
            className="h-11 rounded-xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">همهٔ سفارش‌ها</option>
            {orderStatuses.map((value) => (
              <option key={value} value={value}>
                {orderStatusLabels[value]}
              </option>
            ))}
          </select>
        </div>
        {orders && (
          <p className="text-sm text-muted-foreground">{formatNumber(orders.total)} سفارش</p>
        )}
      </div>
      {!orders ? (
        <AccountDataState error={query.error} retry={query.refresh} />
      ) : (
        <>
          {orders.items.length ? (
            <div className="space-y-4">
              {orders.items.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <Card className="rounded-3xl bg-card/85">
              <EmptyState
                title={status ? 'سفارشی با این وضعیت ندارید' : 'هنوز سفارشی ثبت نکرده‌اید'}
                description="سفارش‌های شما پس از ثبت در این بخش نمایش داده می‌شوند."
                icon={<Package size={36} />}
              >
                <Button asChild className="mt-4">
                  <Link href="/shop">مشاهده محصولات</Link>
                </Button>
              </EmptyState>
            </Card>
          )}
          {orders.totalPages > 1 && (
            <nav aria-label="صفحه‌بندی سفارش‌ها" className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                قبلی
              </Button>
              <span className="text-sm">
                {formatNumber(page)} از {formatNumber(orders.totalPages)}
              </span>
              <Button
                variant="outline"
                disabled={page >= orders.totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                بعدی
              </Button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
