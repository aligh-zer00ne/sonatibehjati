import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_REFRESH_COOKIE } from '@behjati/shared';
import OrderDetails from '@/components/account/OrderDetails';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
export const metadata: Metadata = {
  title: 'جزئیات سفارش',
  robots: { index: false, follow: false },
  alternates: { canonical: '/account/orders' },
};
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await cookies()).has(USER_REFRESH_COOKIE))
    redirect('/login?next=' + encodeURIComponent('/account/orders/' + id));
  return (
    <>
      <Breadcrumbs
        items={[
          { title: 'حساب کاربری', href: '/account' },
          { title: 'سفارش‌ها', href: '/account/orders' },
          { title: 'جزئیات سفارش' },
        ]}
      />
      <h1 className="mb-6 text-2xl font-extrabold">جزئیات سفارش</h1>
      <OrderDetails id={id} />
    </>
  );
}
