'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardCheck } from 'lucide-react';
import { formatNumber, formatPrice } from '@behjati/shared';
import { CheckoutOrderReceiptDocument, type ReceiptFragment } from '@/generated/graphql';
import { authRequest } from '@/lib/auth/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PayOrderButton from '@/components/payment/PayOrderButton';
import { paymentStatusLabels, pendingPaymentStates } from '@behjati/shared/payments';
import { Skeleton } from '@/components/ui/skeleton';
export default function OrderConfirmation({ id }: { id: string }) {
  const { user, loading, error: authError, refresh } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<ReceiptFragment | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!loading && !authError && !user)
      router.replace(`/login?next=${encodeURIComponent(`/checkout/order/${id}`)}`);
  }, [loading, user, authError, router, id]);
  useEffect(() => {
    let active = true;
    if (user) {
      setOrder(null);
      setError('');
      void authRequest(CheckoutOrderReceiptDocument, { id })
        .then((result) => {
          if (active) setOrder(result.orderReceipt);
        })
        .catch((error) => {
          if (active) setError(error instanceof Error ? error.message : 'سفارش دریافت نشد.');
        });
    }
    return () => {
      active = false;
    };
  }, [user, id, retry]);
  if (authError || error)
    return (
      <div className="py-8 text-center">
        <p role="alert">{authError || error}</p>
        <Button
          className="mt-4"
          onClick={() => {
            if (authError) void refresh();
            else setRetry((value) => value + 1);
          }}
        >
          تلاش دوباره
        </Button>
      </div>
    );
  if (!user || !order || loading)
    return <Skeleton className="mx-auto h-64 max-w-[520px] rounded-3xl" />;
  return (
    <Card className="mx-auto max-w-[520px] space-y-5 rounded-3xl bg-card/90 p-7 text-center">
      <ClipboardCheck className="mx-auto text-primary" size={44} />
      <h1 className="text-2xl font-extrabold">
        {order.paidAt ? 'پرداخت شما تأیید شد' : 'سفارش شما ثبت شد'}
      </h1>
      <p>
        شمارهٔ سفارش: <b>{formatNumber(order.number)}</b>
      </p>
      <p className="rounded-xl bg-primary/5 p-3 font-bold text-primary">
        {order.salesChannel !== 'WEBSITE'
          ? `دریافت فروشگاه: ${formatPrice(order.offlinePaidAmount)}`
          : order.paidAt
            ? 'پرداخت موفق'
            : order.payments[0]
              ? paymentStatusLabels[order.payments[0].status]
              : order.status === 'PENDING_PAYMENT'
                ? 'در انتظار پرداخت'
                : 'سفارش ثبت‌شده'}
      </p>
      <p className="font-bold">مبلغ سفارش: {formatPrice(order.total)}</p>
      <p className="text-sm leading-8 text-muted-foreground">
        {order.salesChannel !== 'WEBSITE'
          ? `ماندهٔ سفارش: ${formatPrice(order.total - order.offlinePaidAmount)}`
          : order.paidAt
            ? 'بانک پرداخت را تأیید کرده است؛ سفارش در حال پیگیری است.'
            : 'پرداخت سفارش پس از تأیید بانک ثبت می‌شود.'}
      </p>
      {order.salesChannel === 'WEBSITE' &&
        !order.paidAt &&
        ['CREATED', 'PENDING_PAYMENT'].includes(order.status) &&
        !pendingPaymentStates.includes(order.payments[0]?.status ?? '') && (
          <PayOrderButton orderId={id} />
        )}
      <Button className="w-full" asChild>
        <Link href="/shop">ادامهٔ خرید</Link>
      </Button>
      <Button className="w-full" variant="outline" asChild>
        <Link href={`/account/orders/${id}`}>جزئیات سفارش</Link>
      </Button>
    </Card>
  );
}
