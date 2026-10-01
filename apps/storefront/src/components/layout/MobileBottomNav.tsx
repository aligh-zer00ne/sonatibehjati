'use client';
import { House, Store, LayoutGrid, ShoppingCart, UserRound } from 'lucide-react';
import { useUI } from '@/stores/ui';
import { useCart } from '@/stores/cart';
import { formatNumber } from '@behjati/shared';
import { Button } from '@/components/ui/button';
export default function MobileBottomNav() {
  const open = useUI((state) => state.setPanel);
  const count = useCart((state) => Object.values(state.items).reduce((a, b) => a + b, 0));
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-[#fcf7ed] px-[5px] pt-[7px] pb-[calc(7px+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(70,44,25,0.04)] md:hidden [&_a]:transition-[color,scale] [&_a]:duration-300 [&_a:hover]:text-primary motion-safe:[&_a:active]:scale-95 motion-safe:[&_a_svg]:transition-transform motion-safe:[&_a_svg]:duration-300 motion-safe:[&_a:hover_svg]:-translate-y-1 motion-reduce:[&_a]:transition-none"
      aria-label="ناوبری موبایل"
    >
      <a
        href="/"
        aria-current="page"
        className="flex min-h-12 flex-col items-center justify-center gap-[3px] text-[10px] font-[750] text-primary"
      >
        <House className="size-[21px]" />
        <span>خانه</span>
      </a>
      <a
        href="#products"
        className="flex min-h-12 flex-col items-center justify-center gap-[3px] text-[10px] text-muted-foreground"
      >
        <Store className="size-[21px]" />
        <span>فروشگاه</span>
      </a>
      <a
        href="#categories"
        className="flex min-h-12 flex-col items-center justify-center gap-[3px] text-[10px] text-muted-foreground"
      >
        <LayoutGrid className="size-[21px]" />
        <span>دسته‌بندی</span>
      </a>
      <Button
        variant="ghost"
        onClick={() => open('cart')}
        className="min-h-12 flex-col gap-[3px] rounded-none p-0 text-[10px] font-normal text-muted-foreground"
      >
        <span className="relative">
          <ShoppingCart className="size-[21px]" />
          {count > 0 && (
            <span
              key={count}
              className="absolute -top-[5px] -right-2 min-w-[17px] animate-in zoom-in-50 fade-in rounded-full bg-primary text-center text-[10px] leading-[17px] text-white duration-300 motion-reduce:animate-none"
            >
              {formatNumber(count)}
            </span>
          )}
        </span>
        <span>سبد خرید</span>
      </Button>
      <Button
        variant="ghost"
        onClick={() => open('account')}
        className="min-h-12 flex-col gap-[3px] rounded-none p-0 text-[10px] font-normal text-muted-foreground"
      >
        <UserRound className="size-[21px]" />
        <span>حساب</span>
      </Button>
    </nav>
  );
}
