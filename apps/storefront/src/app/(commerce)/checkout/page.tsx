import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_REFRESH_COOKIE } from '@behjati/shared';
import Checkout from '@/components/checkout/Checkout';
export const metadata: Metadata = {
  title: 'ثبت سفارش',
  robots: { index: false, follow: true },
  alternates: { canonical: '/checkout' },
};
export default async function CheckoutPage() {
  if (!(await cookies()).has(USER_REFRESH_COOKIE)) redirect('/login?next=%2Fcheckout');
  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold">ثبت سفارش</h1>
      <Checkout />
    </>
  );
}
