'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, CircleAlert, Clock3 } from 'lucide-react';
import {
  paymentStatusLabels,
  pendingPaymentStates,
  type PaymentResultData,
} from '@behjati/shared/payments';
import { formatNumber, formatPrice } from '@behjati/shared';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
export default function PaymentResult({
  initial,
  callbackKey,
}: {
  initial: PaymentResultData;
  callbackKey: string;
}) {
  const [payment, setPayment] = useState(initial);
  const [error, setError] = useState('');
  const refresh = async () => {
    try {
      const response = await fetch(`/payment/sep/status/${initial.id}/${callbackKey}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error();
      setPayment(await response.json());
      setError('');
    } catch {
      setError('ارتباط برای بررسی نتیجه برقرار نشد؛ دوباره تلاش کنید.');
    }
  };
  useEffect(() => {
    if (!pendingPaymentStates.includes(payment.status) && payment.status !== 'READY') return;
    const timer = setInterval(() => void refresh(), 10000);
    return () => clearInterval(timer);
  }, [payment.status, initial.id, callbackKey]);
  const verifiedTest =
    payment.gatewayTest && payment.reason === 'ADMIN_GATEWAY_TEST' && !!payment.verifiedAt;
  const succeeded = payment.status === 'SUCCEEDED';
  const pending = pendingPaymentStates.includes(payment.status);
  const Icon =
    succeeded || (verifiedTest && payment.status === 'REVERSED')
      ? CheckCircle2
      : pending
        ? Clock3
        : CircleAlert;
  return (
    <Card className="mx-auto max-w-xl space-y-5 rounded-3xl p-6 text-center sm:p-8">
      <Icon className="mx-auto size-12 text-primary" aria-hidden="true" />
      <h1 className="text-2xl font-extrabold">{paymentStatusLabels[payment.status]}</h1>
      {payment.gatewayTest ? (
        <div className="space-y-2 text-sm">
          <p className="font-bold">تست درگاه سامان</p>
          <p className="break-all">
            شناسه تست: <bdi>{payment.id}</bdi>
          </p>
          {verifiedTest && <p className="font-bold text-primary">بانک پرداخت تست را تأیید کرد.</p>}
        </div>
      ) : (
        <p>
          سفارش شمارهٔ <b>{formatNumber(payment.orderNumber ?? 0)}</b>
        </p>
      )}
      <p className="font-bold">مبلغ: {formatPrice(payment.amount)}</p>
      <p className="text-sm leading-8 text-muted-foreground">
        {succeeded
          ? 'پرداخت شما توسط بانک تأیید و سفارش برای آماده‌سازی ثبت شد.'
          : payment.status === 'REVERSED'
            ? 'درخواست برگشت وجه توسط بانک تأیید شده است. زمان نمایش مبلغ در حساب به بانک صادرکننده کارت بستگی دارد.'
            : payment.status === 'REVIEW_REQUIRED'
              ? 'نتیجهٔ این تراکنش نیاز به بررسی پشتیبانی دارد. تا روشن شدن وضعیت دوباره پرداخت نکنید.'
              : verifiedTest
                ? 'تأیید پرداخت انجام شد؛ درخواست برگشت وجه در حال پیگیری است. دوباره پرداخت نکنید.'
                : pending
                  ? 'در حال بررسی نتیجه با بانک هستیم. نتیجه خودکار به‌روز می‌شود؛ دوباره پرداخت نکنید.'
                  : payment.status === 'READY'
                    ? 'پرداخت هنوز تکمیل یا تأیید نشده است.'
                    : 'این تلاش پرداخت تأیید نشده است. اگر وجهی کسر شده، نتیجه را از پشتیبانی پیگیری کنید.'}
      </p>
      {(payment.traceNumber || payment.rrn) && (
        <p className="text-sm">
          شمارهٔ پیگیری: <bdi>{payment.rrn || payment.traceNumber}</bdi>
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-primary">
          {error}
        </p>
      )}
      {(pending || error) && (
        <Button variant="outline" className="w-full" onClick={() => void refresh()}>
          بررسی دوباره نتیجه
        </Button>
      )}
      {payment.redirectUrl && (
        <Button className="w-full" asChild>
          <Link href={payment.redirectUrl}>ادامه پرداخت در درگاه سامان</Link>
        </Button>
      )}
      {payment.canRetry && payment.orderId && (
        <Button className="w-full" asChild>
          <Link href={`/checkout/order/${payment.orderId}`}>تلاش دوباره برای پرداخت</Link>
        </Button>
      )}
      {payment.orderId && (
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/account/orders/${payment.orderId}`}>جزئیات سفارش</Link>
        </Button>
      )}
      {payment.gatewayTest && payment.adminTestUrl && (
        <Button variant="outline" className="w-full" asChild>
          <a href={payment.adminTestUrl}>بازگشت به تست درگاه در پنل مدیریت</a>
        </Button>
      )}
      {!succeeded && (
        <Link className="inline-flex min-h-11 items-center text-sm text-primary" href="/support">
          پیگیری از پشتیبانی
        </Link>
      )}
    </Card>
  );
}
