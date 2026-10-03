'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { House, MapPin, Package, UserRound, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
const links = [
  ['/account', 'نمای کلی', House],
  ['/account/profile', 'پروفایل', UserRound],
  ['/account/addresses', 'نشانی‌ها', MapPin],
  ['/account/orders', 'سفارش‌ها', Package],
] as const;
export default function AccountNavigation() {
  const { logout } = useAuth();
  const path = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  return (
    <Card className="rounded-3xl bg-card/85 p-3 lg:sticky lg:top-6">
      <nav aria-label="بخش‌های حساب کاربری" className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {links.map(([href, title, Icon]) => {
          const active = href === '/account' ? path === href : path.startsWith(href);
          return (
            <Button
              key={href}
              variant={active ? 'default' : 'ghost'}
              className="justify-start"
              asChild
            >
              <Link href={href} aria-current={active ? 'page' : undefined}>
                <Icon size={18} />
                {title}
              </Link>
            </Button>
          );
        })}
      </nav>
      <Button
        variant="outline"
        disabled={pending}
        className="mt-3 w-full"
        onClick={async () => {
          setPending(true);
          setError('');
          try {
            await logout();
            router.replace('/login');
            router.refresh();
          } catch (error) {
            setError(error instanceof Error ? error.message : 'خروج انجام نشد.');
          } finally {
            setPending(false);
          }
        }}
      >
        <LogOut size={18} />
        {pending ? 'در حال خروج...' : 'خروج از حساب'}
      </Button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-primary">
          {error}
        </p>
      )}
    </Card>
  );
}
