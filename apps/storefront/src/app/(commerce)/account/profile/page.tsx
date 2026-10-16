import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_REFRESH_COOKIE } from '@behjati/shared';
import ProfileForm from '@/components/account/ProfileForm';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
export const metadata: Metadata = {
  title: 'پروفایل',
  robots: { index: false, follow: false },
  alternates: { canonical: '/account/profile' },
};
export default async function Page() {
  if (!(await cookies()).has(USER_REFRESH_COOKIE))
    redirect('/login?next=' + encodeURIComponent('/account/profile'));
  return (
    <>
      <div className="hidden lg:block">
        <Breadcrumbs items={[{ title: 'حساب کاربری', href: '/account' }, { title: 'پروفایل' }]} />
      </div>
      <h1 className="mb-5 text-xl font-extrabold sm:text-2xl">پروفایل</h1>
      <ProfileForm />
    </>
  );
}
