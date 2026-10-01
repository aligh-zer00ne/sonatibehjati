'use client';
import Image from 'next/image';
import { Menu, ShoppingCart } from 'lucide-react';
import { useCart } from '@/stores/cart';
import { useUI } from '@/stores/ui';
import { formatNumber, BRAND_NAME } from '@behjati/shared';
export default function Header() {
  const count = useCart((state) => Object.values(state.items).reduce((a, b) => a + b, 0));
  const open = useUI((state) => state.setPanel);
  return (
    <header className="header container">
      <button
        className="icon-button menu-toggle"
        aria-label="باز کردن فهرست"
        onClick={() => open('menu')}
      >
        <Menu />
      </button>
      <a href="/" className="brand" aria-label={BRAND_NAME}>
        <Image src="/images/logo.webp" alt={BRAND_NAME} width={62} height={80} priority />
        <span>
          <strong>حلواارده سنتی بهجتی اردکان</strong>
          <small>طعم اصیل اردکان، از دل کنجد</small>
        </span>
      </a>
      <nav className="desktop-nav" aria-label="ناوبری اصلی">
        <a className="active" href="/">
          خانه
        </a>
        <a href="#products">محصولات</a>
        <a href="#categories">دسته‌بندی‌ها</a>
        <a href="#story">داستان بهجتی</a>
        <a href="#ardakan">اردکان</a>
      </nav>
      <button
        className="icon-button cart-icon"
        aria-label={`سبد خرید، ${formatNumber(count)} محصول`}
        onClick={() => open('cart')}
      >
        <ShoppingCart />
        {count > 0 && <span className="count-badge">{formatNumber(count)}</span>}
      </button>
    </header>
  );
}
