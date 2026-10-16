'use client';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  MapPin,
  MessagesSquare,
  Package,
  Pencil,
  UserRound,
} from 'lucide-react';
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
      <Card className="relative isolate overflow-hidden rounded-3xl border-primary/10 bg-linear-to-bl from-primary via-brand-red-dark to-[#530d16] p-5 text-white shadow-[0_12px_30px_-18px_rgba(118,16,11,0.6)] sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-20 -z-10 size-64 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-7 -left-11 -z-10 size-44 rounded-full border border-white/10"
        />
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
            <UserRound size={26} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold break-words">
              {user?.firstName ? (
                <span>
                  {user.firstName} {user.lastName}،
                </span>
              ) : (
                'همراه عزیز بهجتی،'
              )}
            </p>
            <p className="mt-1 text-[11px] text-white/70">خوشحالیم که اینجا هستید</p>
          </div>
        </div>
        <h1 className="text-lg leading-8 font-extrabold sm:text-2xl">به سنتی بهجتی خوش آمدید</h1>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
          <bdi dir="ltr" className="text-sm font-medium tracking-wider text-white/85">
            {user?.phone}
          </bdi>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="min-h-11 gap-2 rounded-xl border border-white/20 bg-white/5 px-3 text-white hover:bg-white/15"
          >
            <Link href="/account/profile">
              <Pencil size={14} aria-hidden="true" />
              ویرایش اطلاعات
            </Link>
          </Button>
        </div>
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
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              {
                href: '/account/orders',
                title: 'سفارش‌های من',
                count: orders.data.myOrders.total,
                label: 'مشاهده و پیگیری',
                Icon: Package,
              },
              {
                href: '/account/addresses',
                title: 'نشانی‌های من',
                count: addresses.data.myAddresses.length,
                label: 'مدیریت نشانی‌ها',
                Icon: MapPin,
              },
            ].map(({ href, title, count, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-[22px] border border-border bg-card p-4 transition-colors hover:border-clay/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex size-10 items-center justify-center rounded-[14px] bg-surface/80 text-primary">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <b className="text-2xl font-extrabold text-earth">{formatNumber(count)}</b>
                </div>
                <h2 className="mt-4 text-sm font-extrabold">{title}</h2>
                <p className="mt-2 flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
                  {label}
                  <ChevronLeft size={14} aria-hidden="true" />
                </p>
              </Link>
            ))}
          </div>
          <Link
            href="/account/support"
            className="flex min-h-20 items-center gap-3 rounded-[22px] border border-border bg-surface/55 px-4 py-3 text-earth transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-card text-primary">
              <MessagesSquare size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-sm">کنار شما هستیم</b>
              <span className="mt-1 block text-[11px] text-muted-foreground">
                ثبت تیکت و گفت‌وگو با پشتیبانی
              </span>
            </span>
            <ChevronLeft size={18} aria-hidden="true" />
          </Link>
          <section aria-labelledby="recent-orders-heading" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 id="recent-orders-heading" className="text-base font-extrabold sm:text-lg">
                آخرین سفارش‌ها
              </h2>
              <Button asChild variant="ghost" size="sm" className="gap-1.5 px-1 text-xs">
                <Link href="/account/orders">
                  مشاهده همه
                  <ArrowLeft size={15} aria-hidden="true" />
                </Link>
              </Button>
            </div>
            {orders.data.myOrders.items.length ? (
              orders.data.myOrders.items.map((order) => <OrderCard key={order.id} order={order} />)
            ) : (
              <Card className="rounded-[22px] border-dashed bg-card p-6 text-center shadow-none">
                <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-surface text-clay">
                  <Package size={24} aria-hidden="true" />
                </span>
                <p className="text-sm font-bold">هنوز سفارشی ثبت نکرده‌اید.</p>
                <p className="mt-2 text-xs leading-7 text-muted-foreground">
                  اولین طعم اصیل بهجتی را انتخاب کنید.
                </p>
                <Button asChild size="sm" className="mt-4 gap-2">
                  <Link href="/shop">
                    مشاهده محصولات
                    <ArrowLeft size={15} />
                  </Link>
                </Button>
              </Card>
            )}
          </section>
        </>
      )}
    </>
  );
}
