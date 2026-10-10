'use client';
import { productSellingPrice } from '@behjati/shared/promotions';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MAX_CART_LINES, MAX_CART_QUANTITY } from '@behjati/shared';
interface CartState {
  items: Record<string, number>;
  favorites: string[];
  add: (id: string, quantity?: number) => void;
  remove: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
  toggleFavorite: (id: string) => void;
}
const validId = (id: unknown): id is string =>
  typeof id === 'string' &&
  id.length > 0 &&
  id.length <= 100 &&
  !['__proto__', 'constructor', 'prototype'].includes(id);
export const adjustCart = (items: Record<string, number>, id: string, delta: number) => {
  if (!validId(id) || !Number.isInteger(delta)) return items;
  const previous = Object.hasOwn(items, id) ? items[id]! : 0;
  if (!previous && delta > 0 && Object.keys(items).length >= MAX_CART_LINES) return items;
  const next = { ...items };
  const quantity = Math.min(MAX_CART_QUANTITY, Math.max(0, previous + delta));
  if (quantity) next[id] = quantity;
  else delete next[id];
  return next;
};
export function sanitizePersistedCart(persisted: unknown) {
  const raw = persisted as { items?: Record<string, unknown>; favorites?: unknown };
  const items = Object.fromEntries(
    Object.entries(raw?.items ?? {})
      .filter(
        ([key, value]) =>
          validId(key) &&
          typeof value === 'number' &&
          Number.isInteger(value) &&
          value > 0 &&
          value <= MAX_CART_QUANTITY,
      )
      .slice(0, MAX_CART_LINES),
  ) as Record<string, number>;
  const favorites = Array.isArray(raw?.favorites)
    ? [...new Set(raw.favorites.filter(validId))].slice(0, MAX_CART_LINES)
    : [];
  return { items, favorites };
}
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      favorites: [],
      add: (id, quantity = 1) =>
        set((state) => ({ items: adjustCart(state.items, id, Math.max(1, quantity)) })),
      increment: (id) => set((state) => ({ items: adjustCart(state.items, id, 1) })),
      decrement: (id) => set((state) => ({ items: adjustCart(state.items, id, -1) })),
      remove: (id) =>
        set((state) => ({
          items: Object.fromEntries(Object.entries(state.items).filter(([key]) => key !== id)),
        })),
      clear: () => set({ items: {} }),
      toggleFavorite: (id) => {
        if (!validId(id)) return;
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((item) => item !== id)
            : [...state.favorites, id].slice(0, MAX_CART_LINES),
        }));
      },
    }),
    {
      name: 'behjati-guest-cart-v1',
      skipHydration: true,
      partialize: (state) => ({ items: state.items, favorites: state.favorites }),
      merge: (persisted, current) => {
        const { items, favorites } = sanitizePersistedCart(persisted);
        return { ...current, items, favorites };
      },
    },
  ),
);
export const getSubtotal = (
  items: Record<string, number>,
  products: ReadonlyArray<{
    id: string;
    price: number;
    promotion?: { price: number; startsAt: string; endsAt: string } | null;
  }>,
) =>
  products.reduce(
    (total, product) => total + productSellingPrice(product) * (items[product.id] ?? 0),
    0,
  );
