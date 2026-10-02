'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, UserRound } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
export default function AccountSession() {
  const { user, loading, error, refresh, logout } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  useEffect(() => {
    if (!loading && !error && !user) router.replace('/login?next=%2Faccount');
  }, [user, loading, error, router]);
  if (loading)
    return (
      <Skeleton
        className="mx-auto h-72 max-w-[520px] rounded-3xl"
        aria-label="در حال دریافت حساب"
      />
    );
  if (error)
    return (
      <div className="py-10 text-center">
        <p role="alert" className="mb-5 text-sm text-primary">
          {error}
        </p>
        <Button onClick={() => void refresh()}>تلاش دوباره</Button>
      </div>
    );
  if (!user)
    return (
      <p role="status" className="py-10 text-center">
        در حال رفتن به صفحهٔ ورود...
      </p>
    );
  return (
    <Card className="mx-auto max-w-[520px] rounded-3xl bg-card/85 p-6 text-center md:p-8">
      <UserRound size={38} className="mx-auto mb-5 text-primary" />
      <h2 className="text-xl font-extrabold">به سنتی بهجتی خوش آمدید</h2>
      <p className="mt-4 text-sm text-earth">
        با شمارهٔ <b dir="ltr">{user.phone}</b> وارد شده‌اید.
      </p>
      <p className="my-5 text-sm leading-8 text-muted-foreground">
        سبد و علاقه‌مندی‌های شما در این مرورگر حفظ شده‌اند. بخش سفارش‌ها و نشانی‌ها به‌زودی آماده
        می‌شود.
      </p>
      <Button asChild className="w-full">
        <Link href="/cart">مشاهده سبد خرید</Link>
      </Button>
      <Button
        variant="outline"
        className="mt-3 w-full"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setLogoutError('');
          try {
            await logout();
            router.replace('/login');
            router.refresh();
          } catch (error) {
            setLogoutError(error instanceof Error ? error.message : 'خروج انجام نشد.');
          } finally {
            setPending(false);
          }
        }}
      >
        <LogOut size={18} />
        {pending ? 'در حال خروج...' : 'خروج از حساب'}
      </Button>
      {logoutError && (
        <p role="alert" className="mt-4 text-sm text-primary">
          {logoutError}
        </p>
      )}
    </Card>
  );
}
