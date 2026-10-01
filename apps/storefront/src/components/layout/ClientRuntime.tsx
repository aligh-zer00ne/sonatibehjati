'use client';
import { useEffect } from 'react';
import { useCart } from '@/stores/cart';
export default function ClientRuntime() {
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);
  return null;
}
