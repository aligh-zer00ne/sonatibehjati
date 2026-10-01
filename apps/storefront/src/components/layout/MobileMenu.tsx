'use client';
import Image from 'next/image';
import { House, Store, LayoutGrid, BookOpen, MapPin } from 'lucide-react';
import { useUI } from '@/stores/ui';
import { BRAND_NAME } from '@behjati/shared';
const links = [
  { href: '/', label: 'خانه', icon: House },
  { href: '#products', label: 'محصولات', icon: Store },
  { href: '#categories', label: 'دسته‌بندی محصولات', icon: LayoutGrid },
  { href: '#story', label: 'داستان بهجتی', icon: BookOpen },
  { href: '#ardakan', label: 'اردکان', icon: MapPin },
];
export default function MobileMenu() {
  const close = useUI((state) => state.setPanel);
  return (
    <div className="mobile-menu">
      <Image src="/images/logo.webp" alt={BRAND_NAME} width={85} height={110} />
      <nav aria-label="فهرست اصلی">
        {links.map(({ href, label, icon: Icon }) => (
          <a href={href} key={href} onClick={() => close(null)}>
            <Icon size={21} />
            {label}
          </a>
        ))}
      </nav>
      <div className="menu-heritage" aria-hidden="true" />
      <p>{BRAND_NAME}</p>
    </div>
  );
}
