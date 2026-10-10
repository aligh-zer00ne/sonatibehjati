'use client';
import Link from 'next/link';
import Image from 'next/image';
import { House, Store, LayoutGrid, BookOpen } from 'lucide-react';
import { useUI } from '@/stores/ui';
import { BRAND_NAME } from '@behjati/shared';
const links = [
  { href: '/', label: 'خانه', icon: House },
  { href: '/shop', label: 'محصولات', icon: Store },
  { href: '/shop#categories', label: 'دسته‌بندی محصولات', icon: LayoutGrid },
  { href: '/#story', label: 'درباره ما', icon: BookOpen },
];
export default function MobileMenu() {
  const close = useUI((state) => state.setPanel);
  return (
    <div>
      <Image
        className="mx-auto mb-5 block object-contain mix-blend-multiply"
        src="/images/logo-brand.png"
        alt={BRAND_NAME}
        width={85}
        height={110}
      />
      <nav className="flex flex-col" aria-label="فهرست اصلی">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            className="flex min-h-14 items-center gap-3.5 rounded-xl border-b border-border transition-[padding,background-color,color,translate,scale] duration-300 ease-out hover:bg-accent hover:px-3 hover:text-primary motion-safe:hover:-translate-x-1 motion-safe:active:scale-[0.98] motion-reduce:transition-none"
            href={href}
            key={href}
            onClick={() => close(null)}
          >
            <Icon size={21} />
            {label}
          </Link>
        ))}
      </nav>
      <div
        className="mt-6 mb-[15px] h-40 rounded-[18px] bg-[url('/images/home/ardakan-courtyard.webp')] bg-cover bg-center [mask-image:linear-gradient(to_bottom,transparent,#000)]"
        aria-hidden="true"
      />
      <p className="text-center text-xs text-earth">{BRAND_NAME}</p>
    </div>
  );
}
