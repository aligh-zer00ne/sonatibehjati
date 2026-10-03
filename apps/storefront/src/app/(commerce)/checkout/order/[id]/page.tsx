import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_REFRESH_COOKIE } from '@behjati/shared';
import OrderConfirmation from '@/components/checkout/OrderConfirmation';
export const metadata: Metadata = {
  title: 'سفارش ثبت‌شده',
  robots: { index: false, follow: false },
};
export default async function OrderReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await cookies()).has(USER_REFRESH_COOKIE))
    redirect(`/login?next=${encodeURIComponent(`/checkout/order/${id}`)}`);
  return <OrderConfirmation id={id} />;
}
