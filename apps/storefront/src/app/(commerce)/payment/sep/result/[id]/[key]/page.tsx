import type { Metadata } from 'next';
import Link from 'next/link';
import { paymentResult } from '@/lib/payment/server';
import PaymentResult from '@/components/payment/PaymentResult';
export const metadata: Metadata = {
  title: 'نتیجه پرداخت',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default async function Page({ params }: { params: Promise<{ id: string; key: string }> }) {
  const { id, key } = await params;
  try {
    const initial = await paymentResult(id, key);
    return <PaymentResult key={id} initial={initial} callbackKey={key} />;
  } catch {
    return (
      <section className="mx-auto max-w-lg space-y-4 rounded-3xl border border-border bg-card p-6">
        <h1 className="text-xl font-bold">وضعیت پرداخت دریافت نشد</h1>
        <p className="text-sm leading-7">
          این پیام به معنی پرداخت ناموفق نیست. صفحه را دوباره باز کنید یا از پشتیبانی پیگیری کنید؛
          تا روشن شدن نتیجه، دوباره پرداخت نکنید.
        </p>
        <Link className="block min-h-11 text-primary" href="/account/orders">
          سفارش‌های من
        </Link>
        <Link className="block min-h-11 text-primary" href="/support">
          پشتیبانی
        </Link>
      </section>
    );
  }
}
