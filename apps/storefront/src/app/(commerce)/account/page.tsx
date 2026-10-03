import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_REFRESH_COOKIE } from '@behjati/shared';
import AccountOverview from '@/components/account/AccountOverview';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
export const metadata: Metadata = {
  title: 'حساب کاربری',
  robots: { index: false, follow: false },
  alternates: { canonical: '/account' },
};
export default async function Page() {
  if (!(await cookies()).has(USER_REFRESH_COOKIE))
    redirect('/login?next=' + encodeURIComponent('/account'));
  return (
    <>
      <Breadcrumbs items={[{ title: 'حساب کاربری' }]} />
      <h1 className="mb-6 text-2xl font-extrabold">حساب کاربری</h1>
      <AccountOverview />
    </>
  );
}
