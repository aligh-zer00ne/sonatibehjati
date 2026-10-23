import type { Metadata } from 'next';
import { paymentApi } from '@/lib/payment/server';
import type { PublicPaymentRequest } from '@behjati/shared/payment-requests';
import PaymentRequest from '@/components/payment/PaymentRequest';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'پرداخت به سنتی بهجتی',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default async function Page({ params }: { params: Promise<{ id: string; key: string }> }) {
  const { id, key } = await params;
  try {
    const initial = await paymentApi<PublicPaymentRequest>('request-status', id, key);
    return <PaymentRequest initial={initial} accessKey={key} />;
  } catch {
    return (
      <section className="mx-auto max-w-lg space-y-4 rounded-3xl border border-border bg-card p-6">
        <h1 className="text-xl font-extrabold">لینک پرداخت در دسترس نیست</h1>
        <p className="text-sm leading-8">
          آدرس را بررسی کنید یا با فروشگاه تماس بگیرید. اگر پرداختی انجام داده‌اید، تا روشن‌شدن
          نتیجه دوباره پرداخت نکنید.
        </p>
      </section>
    );
  }
}
