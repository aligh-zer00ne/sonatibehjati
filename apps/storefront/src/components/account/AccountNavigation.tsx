'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  House,
  MapPin,
  Package,
  UserRound,
  LogOut,
  MessagesSquare,
  Menu,
  ArrowLeft,
  Store,
  ChevronLeft,
  LoaderCircle,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const links = [
  ['/account', 'نمای کلی', House],
  ['/account/orders', 'سفارش‌ها', Package],
  ['/account/addresses', 'نشانی‌ها', MapPin],
  ['/account/profile', 'پروفایل', UserRound],
  ['/account/support', 'پشتیبانی و تیکت‌ها', MessagesSquare],
] as const;

function AccountLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav aria-label="بخش‌های حساب کاربری" className="space-y-1.5">
      {links.map(([href, title, Icon]) => {
        const active = href === '/account' ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex min-h-14 items-center gap-3 rounded-2xl px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active ? 'bg-primary text-white' : 'text-earth hover:bg-surface',
            )}
          >
            <span
              className={cn(
                'flex size-9 items-center justify-center rounded-xl',
                active ? 'bg-white/15' : 'bg-surface/70',
              )}
            >
              <Icon size={19} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">{title}</span>
            <ChevronLeft
              size={16}
              aria-hidden="true"
              className={active ? 'text-white/65' : 'text-clay/60'}
            />
          </Link>
        );
      })}
    </nav>
  );
}

export default function AccountNavigation() {
  const { user, logout } = useAuth();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'همراه سنتی بهجتی';
  const identity = (
    <div className="mb-5 flex items-center gap-3 rounded-2xl bg-surface/75 p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card text-primary">
        <UserRound size={23} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold" title={name}>
          {name}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">حساب شما در سنتی بهجتی</p>
      </div>
    </div>
  );
  const exit = (
    <div className="mt-5 border-t border-border pt-4">
      <Button
        variant="ghost"
        disabled={pending}
        className="w-full justify-start gap-3 rounded-xl px-3 text-muted-foreground hover:text-primary"
        onClick={async () => {
          setPending(true);
          setError('');
          try {
            await logout();
            setOpen(false);
            router.replace('/login');
            router.refresh();
          } catch (error) {
            setError(error instanceof Error ? error.message : 'خروج انجام نشد.');
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? (
          <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" />
        ) : (
          <LogOut size={18} />
        )}
        {pending ? 'در حال خروج...' : 'خروج از حساب'}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-xs leading-6 text-primary">
          {error}
        </p>
      )}
    </div>
  );
  return (
    <aside className="min-w-0 lg:sticky lg:top-6">
      <header className="flex items-center justify-between gap-3 border-b border-border/70 pb-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-2xl border-border bg-card text-primary"
            aria-label="باز کردن منوی حساب کاربری"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </Button>
          <div>
            <p className="text-base font-extrabold">حساب من</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">سنتی بهجتی</p>
          </div>
        </div>
        <Button asChild variant="ghost" size="icon" className="rounded-2xl text-earth">
          <Link href="/shop" aria-label="بازگشت به فروشگاه">
            <ArrowLeft size={21} />
          </Link>
        </Button>
      </header>
      <Card className="hidden rounded-3xl bg-card p-3 shadow-none lg:block">
        {identity}
        <AccountLinks />
        {exit}
      </Card>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        placement="right"
        title="حساب کاربری"
        description="سفارش‌ها، نشانی‌ها و اطلاعات شخصی شما"
        closeLabel="بستن منوی حساب کاربری"
      >
        <AccountLinks onNavigate={() => setOpen(false)} />
        <div className="mt-auto pt-6">
          <Link
            href="/shop"
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold text-earth hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Store size={18} aria-hidden="true" />
            بازگشت به فروشگاه
          </Link>
          {exit}
        </div>
      </Dialog>
    </aside>
  );
}
