import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_REFRESH_COOKIE } from '@behjati/shared';
import Addresses from '@/components/account/Addresses';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
export const metadata: Metadata = {
  title: 'نشانی‌ها',
  robots: { index: false, follow: false },
  alternates: { canonical: '/account/addresses' },
};
export default async function Page() {
  if (!(await cookies()).has(USER_REFRESH_COOKIE))
    redirect('/login?next=' + encodeURIComponent('/account/addresses'));
  return (
    <>
      <div className="hidden lg:block">
        <Breadcrumbs items={[{ title: 'حساب کاربری', href: '/account' }, { title: 'نشانی‌ها' }]} />
      </div>
      <h1 className="mb-5 text-xl font-extrabold sm:text-2xl">نشانی‌ها</h1>
      <Addresses />
    </>
  );
}
