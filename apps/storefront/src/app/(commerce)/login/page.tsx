import type { Metadata } from 'next';
import AuthFrame from '@/components/auth/AuthFrame';
import LoginForm from '@/components/auth/LoginForm';
import { param, type CatalogParams } from '@/lib/catalog/params';
import { safeReturnPath } from '@behjati/shared';
export const metadata: Metadata = {
  title: 'ورود به حساب',
  robots: { index: false, follow: true },
  alternates: { canonical: '/login' },
};
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<CatalogParams>;
}) {
  const params = await searchParams;
  const testing = process.env.CHECKOUT_PAYMENT_TEST_ENABLED === 'true';
  return (
    <AuthFrame
      title="ورود به سنتی بهجتی"
      description={
        testing
          ? 'برای تست پرداخت، با شماره موبایل و کد ثابت ۱۲۳۴۵۶ وارد شوید.'
          : 'با شماره موبایل وارد شوید؛ رمز یک‌بارمصرف برای شما ارسال می‌شود.'
      }
    >
      <LoginForm testing={testing} returnTo={safeReturnPath(param(params.next))} />
    </AuthFrame>
  );
}
