'use client';
import { House, Store, LayoutGrid, ShoppingCart, UserRound } from 'lucide-react';
import { useUI } from '@/stores/ui';
import { useCart } from '@/stores/cart';
import { formatNumber } from '@behjati/shared';
export default function MobileBottomNav() {
  const open = useUI((state) => state.setPanel);
  const count = useCart((state) => Object.values(state.items).reduce((a, b) => a + b, 0));
  return (
    <nav className="bottom-nav" aria-label="ناوبری موبایل">
      <a href="/" className="active" aria-current="page">
        <House />
        <span>خانه</span>
      </a>
      <a href="#products">
        <Store />
        <span>فروشگاه</span>
      </a>
      <a href="#categories">
        <LayoutGrid />
        <span>دسته‌بندی</span>
      </a>
      <button onClick={() => open('cart')}>
        <span className="cart-icon">
          <ShoppingCart />
          {count > 0 && <span className="count-badge">{formatNumber(count)}</span>}
        </span>
        <span>سبد خرید</span>
      </button>
      <button onClick={() => open('account')}>
        <UserRound />
        <span>حساب</span>
      </button>
    </nav>
  );
}
