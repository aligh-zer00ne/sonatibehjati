'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, ShoppingCart, UserRound } from 'lucide-react';
import { useCart } from '@/stores/cart';
import { useUI } from '@/stores/ui';
import { formatNumber, BRAND_NAME } from '@behjati/shared';
export default function Header() {
  const pathname = usePathname();
  const shopActive =
    ['/shop', '/search', '/favorites'].includes(pathname) || pathname.startsWith('/product/');
  const categoryActive = pathname.startsWith('/category/');
  const count = useCart((state) => Object.values(state.items).reduce((a, b) => a + b, 0));
  const open = useUI((state) => state.setPanel);
  return (
    <header className="mx-auto w-full max-w-[1200px] px-4 min-[480px]:px-6 xl:px-0 flex h-[106px] items-center justify-between gap-[18px] md:h-[115px] lg:gap-[30px]">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-xl text-foreground lg:hidden"
        aria-label="باز کردن فهرست"
        onClick={() => open('menu')}
      >
        <Menu />
      </Button>
      <Link href="/" className="flex items-center gap-3" aria-label={BRAND_NAME}>
        <Image
          className="h-[76px] w-[54px] object-contain mix-blend-multiply"
          src="/images/logo-brand.png"
          alt={BRAND_NAME}
          width={62}
          height={80}
          priority
        />
        <span className="hidden md:flex md:flex-col">
          <strong className="text-sm">حلواارده سنتی بهجتی اردکان</strong>
          <small className="text-[10px] text-muted-foreground">طعم اصیل اردکان، از دل کنجد</small>
        </span>
      </Link>
      <nav
        className="hidden items-center gap-[26px] text-[13px] lg:flex [&_a]:relative [&_a]:transition-colors [&_a]:duration-300 [&_a:hover]:text-primary [&_a]:after:absolute [&_a]:after:right-0 [&_a]:after:bottom-1 [&_a]:after:h-0.5 [&_a]:after:w-full [&_a]:after:origin-right [&_a]:after:scale-x-0 [&_a]:after:rounded-full [&_a]:after:bg-primary [&_a]:after:transition-transform [&_a]:after:duration-300 [&_a]:after:content-[''] [&_a:hover]:after:scale-x-100 motion-reduce:[&_a]:transition-none motion-reduce:[&_a]:after:transition-none"
        aria-label="ناوبری اصلی"
      >
        <Link
          className={`py-3 ${pathname === '/' ? 'text-primary' : ''}`}
          aria-current={pathname === '/' ? 'page' : undefined}
          href="/"
        >
          خانه
        </Link>
        <Link
          className={`py-3 ${shopActive ? 'text-primary' : ''}`}
          aria-current={shopActive ? 'page' : undefined}
          href="/shop"
        >
          محصولات
        </Link>
        <Link
          className={`py-3 ${categoryActive ? 'text-primary' : ''}`}
          aria-current={categoryActive ? 'page' : undefined}
          href="/shop#categories"
        >
          دسته‌بندی‌ها
        </Link>
        <Link className="py-3" href="/#story">
          داستان سنتی بهجتی و اردکان
        </Link>
      </nav>
      <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex">
        <Link href="/account" aria-label="حساب کاربری">
          <UserRound />
        </Link>
      </Button>
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
            className="absolute top-0 -right-px min-w-[17px] animate-in zoom-in-50 fade-in rounded-full bg-primary text-center text-[10px] leading-[17px] text-white duration-300 motion-reduce:animate-none"
          >
            {formatNumber(count)}
          </span>
        )}
      </Button>
    </header>
  );
}
