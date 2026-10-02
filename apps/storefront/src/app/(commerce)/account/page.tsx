import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_ACCESS_COOKIE, USER_REFRESH_COOKIE } from '@behjati/shared';
import AccountSession from '@/components/auth/AccountSession';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
export const metadata: Metadata = {
  title: 'حساب کاربری',
  robots: { index: false, follow: true },
  alternates: { canonical: '/account' },
};
export default async function AccountPage() {
  const jar = await cookies();
  if (!jar.has(USER_ACCESS_COOKIE) && !jar.has(USER_REFRESH_COOKIE))
    redirect('/login?next=%2Faccount');
  return (
    <>
      <Breadcrumbs items={[{ title: 'حساب کاربری' }]} />
      <h1 className="mb-6 text-2xl font-extrabold">حساب کاربری</h1>
      <AccountSession />
    </>
  );
}
