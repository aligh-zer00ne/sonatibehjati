'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { CheckCircle2, Clock3, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import type { PublicPaymentRequest } from '@behjati/shared/payment-requests';
import { pendingPaymentStates, paymentStatusLabels } from '@behjati/shared/payments';
import { formatPrice } from '@behjati/shared';
import { Button } from '@/components/ui/button';
export default function PaymentRequest({
  initial,
  accessKey,
}: {
  initial: PublicPaymentRequest;
  accessKey: string;
}) {
  const [data, setData] = useState(initial),
    [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const lock = useRef(false);
  const base = `/pay/${initial.id}/${accessKey}`;
  const refresh = useCallback(async () => {
    try {
      const r = await fetch(base + '/status', {
        cache: 'no-store',
        signal: AbortSignal.timeout(12000),
      });
      if (!r.ok) throw new Error();
      setData(await r.json());
      setError('');
    } catch {
      setError('نتیجه دریافت نشد. تا روشن شدن وضعیت، دوباره پرداخت نکنید.');
    }
  }, [base]);
  useEffect(() => {
    if (
      data.status !== 'ACTIVE' &&
      (!data.payment || !pendingPaymentStates.includes(data.payment.status))
    )
      return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, 10000);
    return () => clearInterval(timer);
    // The endpoint belongs to this immutable capability; rendering fresh results never issues a charge.
  }, [data.status, data.payment?.status, refresh]);
  const unresolved = !!data.payment && pendingPaymentStates.includes(data.payment.status);
  const paid = data.status === 'PAID';
  const payable = data.status === 'ACTIVE' && !unresolved && data.gatewayAvailable;
  return (
    <section className="mx-auto max-w-xl overflow-hidden rounded-[28px] border border-border bg-card shadow-lg">
      <header className="flex items-center gap-4 border-b border-border bg-secondary/40 p-6">
        <img src="/images/logo-brand.png" alt="سنتی بهجتی اردکان" className="h-20 w-auto" />
        <div>
          <p className="text-sm text-muted-foreground">پرداخت امن به فروشگاه</p>
          <h1 className="mt-1 text-xl font-extrabold">سنتی بهجتی اردکان</h1>
        </div>
      </header>
      <div className="space-y-6 p-6 sm:p-8">
        <div className="text-center">
          {paid ? (
            <CheckCircle2 className="mx-auto mb-4 size-12 text-green-700" />
          ) : unresolved ? (
            <Clock3 className="mx-auto mb-4 size-12 text-primary" />
          ) : (
            <ShieldCheck className="mx-auto mb-4 size-12 text-primary" />
          )}
          <h2 className="text-lg font-bold">{data.title}</h2>
          <p className="mt-4 text-3xl font-extrabold text-primary">{formatPrice(data.amount)}</p>
        </div>
        <div
          role="status"
          className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm leading-8"
        >
          {paid
            ? 'پرداخت توسط بانک تأیید و رسید آن ثبت شد.'
            : unresolved
              ? 'نتیجهٔ تراکنش در حال بررسی است. تا مشخص شدن نتیجه، دوباره پرداخت نکنید.'
              : data.status === 'EXPIRED'
                ? 'مهلت این لینک تمام شده است. برای لینک جدید با فروشگاه تماس بگیرید.'
                : data.status === 'CANCELED'
                  ? 'این لینک توسط فروشگاه غیرفعال شده است.'
                  : data.payment
                    ? paymentStatusLabels[data.payment.status]
                    : 'مبلغ این لینک ثابت است و پرداخت به نام سنتی بهجتی انجام می‌شود.'}
        </div>
        {data.payment?.reference && (
          <p className="text-sm">
            رسید بانک: <bdi>{data.payment.reference}</bdi>
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm leading-7 text-primary">
            {error}
          </p>
        )}
        {payable && (
          <Button
            disabled={pending}
            className="min-h-12 w-full text-base font-bold"
            onClick={async () => {
              if (lock.current) return;
              lock.current = true;
              setPending(true);
              setError('');
              try {
                const r = await fetch(base + '/start', {
                  method: 'POST',
                  signal: AbortSignal.timeout(25000),
                });
                const body = await r.json();
                if (!r.ok || !body.redirectUrl) throw new Error(body.message);
                window.location.assign(body.redirectUrl);
              } catch (e) {
                await refresh();
                setError(e instanceof Error ? e.message : 'اتصال برقرار نشد.');
              } finally {
                lock.current = false;
                setPending(false);
              }
            }}
          >
            {pending ? 'در حال اتصال به بانک…' : 'پرداخت در درگاه سامان'}
            <ArrowLeft className="size-4" />
          </Button>
        )}
        {!data.gatewayAvailable && data.status === 'ACTIVE' && (
          <p className="text-sm text-primary">
            درگاه فعلاً در دسترس نیست؛ کمی بعد دوباره تلاش کنید.
          </p>
        )}
        <Button variant="outline" className="w-full" onClick={() => void refresh()}>
          <RefreshCw className="size-4" />
          به‌روزرسانی نتیجه
        </Button>
        <p className="text-center text-xs leading-7 text-muted-foreground">
          برای پرداخت این لینک نیازی به ورود به حساب کاربری ندارید.
        </p>
      </div>
    </section>
  );
}
