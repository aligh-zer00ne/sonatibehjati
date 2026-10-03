'use client';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { AccountOrdersDocument, MyAddressesDocument } from '@/generated/graphql';
import { useAccountQuery } from '@/hooks/useAccountQuery';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@behjati/shared';
import AccountDataState from './AccountDataState';
import OrderCard from './OrderCard';
export default function AccountOverview() {
  const { user } = useAuth();
  const orders = useAccountQuery(AccountOrdersDocument, { input: { page: 1, pageSize: 3 } });
  const addresses = useAccountQuery(MyAddressesDocument, {});
  return (
    <>
      <Card className="rounded-3xl bg-surface/80 p-6">
        <h2 className="text-xl font-extrabold">به سنتی بهجتی خوش آمدید</h2>
        <p className="mt-3 text-sm leading-8">
          {user?.firstName && (
            <span>
              {user.firstName} {user.lastName}،{' '}
            </span>
          )}
          با شمارهٔ <b dir="ltr">{user?.phone}</b> وارد شده‌اید.
        </p>
      </Card>
      {!orders.data || !addresses.data ? (
        <AccountDataState
          error={orders.error || addresses.error}
          retry={() => {
            orders.refresh();
            addresses.refresh();
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/account/orders"
              className="rounded-3xl border border-border bg-card/85 p-5 transition hover:border-clay motion-safe:hover:-translate-y-1"
            >
              <b className="block text-2xl text-primary">
                {formatNumber(orders.data.myOrders.total)}
              </b>
              <span className="text-sm">سفارش</span>
            </Link>
            <Link
              href="/account/addresses"
              className="rounded-3xl border border-border bg-card/85 p-5 transition hover:border-clay motion-safe:hover:-translate-y-1"
            >
              <b className="block text-2xl text-primary">
                {formatNumber(addresses.data.myAddresses.length)}
              </b>
              <span className="text-sm">نشانی</span>
            </Link>
          </div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold">آخرین سفارش‌ها</h2>
            <Button asChild variant="ghost">
              <Link href="/account/orders">مشاهده همه</Link>
            </Button>
          </div>
          {orders.data.myOrders.items.length ? (
            orders.data.myOrders.items.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <Card className="rounded-3xl p-6 text-center">
              <p className="mb-4 text-sm text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید.</p>
              <Button asChild>
                <Link href="/shop">مشاهده محصولات</Link>
              </Button>
            </Card>
          )}
        </>
      )}
    </>
  );
}
