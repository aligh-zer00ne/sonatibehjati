'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/stores/ui';
import { useCart } from '@/stores/cart';
import { formatNumber } from '@behjati/shared';
export default function CommerceHeader() {
  const path = usePathname();
  const open = useUI((state) => state.setPanel);
  const count = useCart((state) =>
    Object.values(state.items).reduce((sum, quantity) => sum + quantity, 0),
  );
  const title = path.startsWith('/checkout')
    ? 'ثبت سفارش'
    : path.startsWith('/account') || ['/login', '/verify'].includes(path)
      ? 'حساب کاربری'
      : path.startsWith('/product/')
        ? 'جزئیات محصول'
        : path === '/cart'
          ? 'سبد خرید'
          : path === '/favorites'
            ? 'علاقه‌مندی‌ها'
            : path === '/search'
              ? 'جستجو'
              : 'فروشگاه';
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-border bg-background/70 px-4 md:hidden">
      {path === '/shop' ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="باز کردن فهرست"
          onClick={() => open('menu')}
        >
          <Menu />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" asChild>
          <Link href="/shop" aria-label="بازگشت به فروشگاه">
            <ArrowRight />
          </Link>
        </Button>
      )}
      <span className="text-lg font-extrabold">{title}</span>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-foreground"
        aria-label={`سبد خرید، ${formatNumber(count)} محصول`}
        onClick={() => open('cart')}
      >
        <ShoppingCart />
        {count > 0 && (
          <span
            key={count}
            className="absolute top-0 -right-px min-w-[17px] animate-in zoom-in-50 rounded-full bg-primary text-center text-[10px] leading-[17px] text-white duration-300 motion-reduce:animate-none"
          >
            {formatNumber(count)}
          </span>
        )}
      </Button>
    </header>
  );
}
