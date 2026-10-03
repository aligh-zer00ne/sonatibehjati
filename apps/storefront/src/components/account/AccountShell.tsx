'use client';
import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import AccountNavigation from './AccountNavigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
export default function AccountShell({ children }: { children: ReactNode }) {
  const { user, loading, error, refresh } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !error && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, error, user, router, pathname]);
  if (error)
    return (
      <div className="py-10 text-center">
        <p role="alert" className="mb-4 text-primary">
          {error}
        </p>
        <Button onClick={() => void refresh()}>تلاش دوباره</Button>
      </div>
    );
  if (loading || !user)
    return <Skeleton className="h-96 rounded-3xl" aria-label="در حال دریافت حساب" />;
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[240px_1fr]">
      <AccountNavigation />
      <div
        key={user.id}
        className="min-w-0 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none"
      >
        {children}
      </div>
    </div>
  );
}
