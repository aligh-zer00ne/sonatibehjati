'use client';
import { useEffect } from 'react';
import { useCart } from '@/stores/cart';
import { usePathname } from 'next/navigation';
import { useUI } from '@/stores/ui';
export default function ClientRuntime() {
  const path = usePathname();
  const close = useUI((state) => state.setPanel);
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);
  useEffect(() => close(null), [path, close]);
  return null;
}
