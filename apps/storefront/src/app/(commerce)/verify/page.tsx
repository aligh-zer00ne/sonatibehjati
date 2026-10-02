import type { Metadata } from 'next';
import AuthFrame from '@/components/auth/AuthFrame';
import VerifyForm from '@/components/auth/VerifyForm';
import { param, type CatalogParams } from '@/lib/catalog/params';
import { safeReturnPath } from '@behjati/shared';
export const metadata: Metadata = {
  title: 'تأیید شماره موبایل',
  robots: { index: false, follow: true },
  alternates: { canonical: '/verify' },
};
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<CatalogParams>;
}) {
  const params = await searchParams;
  return (
    <AuthFrame title="کد ورود را وارد کنید" description="یک قدم تا ورود به حساب شما">
      <VerifyForm
        challengeId={param(params.challenge)}
        returnTo={safeReturnPath(param(params.next))}
      />
    </AuthFrame>
  );
}
