import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_REFRESH_COOKIE } from '@behjati/shared';
import Orders from '@/components/account/Orders';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
export const metadata: Metadata = {
  title: 'سفارش‌ها',
  robots: { index: false, follow: false },
  alternates: { canonical: '/account/orders' },
};
export default async function Page() {
  if (!(await cookies()).has(USER_REFRESH_COOKIE))
    redirect('/login?next=' + encodeURIComponent('/account/orders'));
  return (
    <>
      <Breadcrumbs items={[{ title: 'حساب کاربری', href: '/account' }, { title: 'سفارش‌ها' }]} />
      <h1 className="mb-6 text-2xl font-extrabold">سفارش‌ها</h1>
      <Orders />
    </>
  );
}
