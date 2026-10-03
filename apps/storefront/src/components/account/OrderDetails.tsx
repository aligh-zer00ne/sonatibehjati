'use client';
import Link from 'next/link';
import { formatNumber, formatPrice, formatDate } from '@behjati/shared';
import { AccountOrderDetailsDocument } from '@/generated/graphql';
import { useAccountQuery } from '@/hooks/useAccountQuery';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AccountDataState from './AccountDataState';
import OrderStatusBadge from './OrderStatusBadge';
export default function OrderDetails({ id }: { id: string }) {
  const query = useAccountQuery(AccountOrderDetailsDocument, { id });
  const order = query.data?.myOrder;
  if (!order) return <AccountDataState error={query.error} retry={query.refresh} />;
  const address = order.address;
  const digits = (value: string | null | undefined) =>
    value?.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.charAt(Number(digit))) || 'ثبت نشده';
  return (
    <>
      <Card className="rounded-3xl bg-surface/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">سفارش {formatNumber(order.number)}</h2>
          <OrderStatusBadge status={order.status} />
        </div>
        <time dateTime={order.createdAt} className="mt-3 block text-sm text-muted-foreground">
          {formatDate(order.createdAt)}
        </time>
        {order.status === 'PENDING_PAYMENT' && (
          <p className="mt-4 text-sm leading-7 text-primary">
            این سفارش در انتظار پرداخت است؛ پرداخت آنلاین هنوز فعال نیست.
          </p>
        )}
      </Card>
      <Card className="rounded-3xl bg-card/85 p-5">
        <h2 className="mb-4 font-extrabold">محصولات سفارش</h2>
        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="py-4 first:pt-0 last:pb-0">
              <h3 className="font-bold">{item.productTitle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.productWeight} · {formatNumber(item.quantity)} عدد
              </p>
              <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
                <span>قیمت واحد: {formatPrice(item.unitPrice)}</span>
                <b>{formatPrice(item.lineTotal)}</b>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Card className="rounded-3xl bg-card/85 p-5">
          <h2 className="mb-4 font-extrabold">نشانی هنگام ثبت سفارش</h2>
          <p className="text-sm leading-8">
            {[address.province, address.city, address.postalAddress].filter(Boolean).join('، ') ||
              'ثبت نشده'}
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">گیرنده</dt>
              <dd className="mt-1">{address.recipientName || 'ثبت نشده'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">موبایل گیرنده</dt>
              <dd className="mt-1">
                <bdi>{digits(address.recipientPhone)}</bdi>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">کد پستی</dt>
              <dd className="mt-1">
                <bdi>{digits(address.postalCode)}</bdi>
              </dd>
            </div>
          </dl>
        </Card>
        <Card className="rounded-3xl bg-card/85 p-5">
          <h2 className="mb-4 font-extrabold">خلاصه مبلغ</h2>
          <dl className="space-y-4 text-sm">
            {(
              [
                ['جمع محصولات', order.subtotal],
                ['تخفیف', order.discount],
                ['هزینه ارسال', order.shipping],
                ['مبلغ سفارش', order.total],
              ] as const
            ).map(([label, amount]) => (
              <div
                key={label}
                className="flex flex-wrap justify-between gap-2 last:border-t last:border-border last:pt-4 last:font-extrabold last:text-primary"
              >
                <dt>{label}</dt>
                <dd>{formatPrice(amount)}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
      <Button variant="outline" asChild>
        <Link href="/account/orders">بازگشت به سفارش‌ها</Link>
      </Button>
    </>
  );
}
