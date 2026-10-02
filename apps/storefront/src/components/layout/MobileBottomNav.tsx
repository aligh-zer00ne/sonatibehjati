'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Store, LayoutGrid, ShoppingCart, UserRound } from 'lucide-react';
import { useCart } from '@/stores/cart';
import { formatNumber } from '@behjati/shared';
import { cn } from '@/lib/utils';
const links = [
  { href: '/', label: 'خانه', icon: House },
  { href: '/shop', label: 'فروشگاه', icon: Store },
  { href: '/shop#categories', label: 'دسته‌بندی', icon: LayoutGrid },
  { href: '/cart', label: 'سبد خرید', icon: ShoppingCart },
];
export default function MobileBottomNav() {
  const pathname = usePathname();
  const count = useCart((state) => Object.values(state.items).reduce((a, b) => a + b, 0));
  const active = pathname.startsWith('/category/')
    ? '/shop#categories'
    : pathname === '/' || pathname === '/cart'
      ? pathname
      : ['/account', '/login', '/verify'].includes(pathname)
        ? '/account'
        : '/shop';
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-[#fcf7ed] px-[5px] pt-[7px] pb-[calc(7px+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(70,44,25,0.04)] md:hidden [&_a]:transition-[color,scale] [&_a]:duration-300 [&_a:hover]:text-primary motion-safe:[&_a:active]:scale-95 motion-safe:[&_a_svg]:transition-transform motion-safe:[&_a_svg]:duration-300 motion-safe:[&_a:hover_svg]:-translate-y-1 motion-reduce:[&_a]:transition-none"
      aria-label="ناوبری موبایل"
    >
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={active === href ? 'page' : undefined}
          className={cn(
            'flex min-h-12 flex-col items-center justify-center gap-[3px] text-[10px]',
            active === href ? 'font-bold text-primary' : 'text-muted-foreground',
          )}
        >
          <span className="relative">
            <Icon className="size-[21px]" />
            {href === '/cart' && count > 0 && (
              <span
                key={count}
                className="absolute -top-[5px] -right-2 min-w-[17px] animate-in zoom-in-50 fade-in rounded-full bg-primary text-center text-[10px] leading-[17px] text-white duration-300 motion-reduce:animate-none"
              >
                {formatNumber(count)}
              </span>
            )}
          </span>
          <span>{label}</span>
        </Link>
      ))}
      <Link
        href="/account"
        className={cn(
          'flex min-h-12 flex-col items-center justify-center gap-[3px] text-[10px]',
          ['/account', '/login', '/verify'].includes(pathname)
            ? 'font-bold text-primary'
            : 'text-muted-foreground',
        )}
        aria-current={['/account', '/login', '/verify'].includes(pathname) ? 'page' : undefined}
      >
        <UserRound className="size-[21px]" />
        <span>حساب</span>
      </Link>
    </nav>
  );
}
