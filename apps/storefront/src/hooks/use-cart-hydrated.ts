'use client';
import { useSyncExternalStore } from 'react';
import { useCart } from '@/stores/cart';
const subscribe = (callback: () => void) => {
  const start = useCart.persist.onHydrate(callback);
  const finish = useCart.persist.onFinishHydration(callback);
  return () => {
    start();
    finish();
  };
};
export function useCartHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => useCart.persist?.hasHydrated() ?? false,
    () => false,
  );
}
