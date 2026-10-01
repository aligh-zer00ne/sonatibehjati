'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface CartState {
  items: Record<string, number>;
  favorites: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
  toggleFavorite: (id: string) => void;
}
const adjust = (items: Record<string, number>, id: string, delta: number) => {
  const next = { ...items };
  const quantity = Math.min(99, Math.max(0, (next[id] ?? 0) + delta));
  if (quantity) next[id] = quantity;
  else delete next[id];
  return next;
};
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      favorites: [],
      add: (id) => set((state) => ({ items: adjust(state.items, id, 1) })),
      increment: (id) => set((state) => ({ items: adjust(state.items, id, 1) })),
      decrement: (id) => set((state) => ({ items: adjust(state.items, id, -1) })),
      remove: (id) =>
        set((state) => ({
          items: Object.fromEntries(Object.entries(state.items).filter(([key]) => key !== id)),
        })),
      clear: () => set({ items: {} }),
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((item) => item !== id)
            : [...state.favorites, id],
        })),
    }),
    {
      name: 'behjati-guest-cart-v1',
      skipHydration: true,
      partialize: (state) => ({ items: state.items, favorites: state.favorites }),
      merge: (persisted, current) => {
        const raw = persisted as { items?: Record<string, unknown>; favorites?: unknown };
        const items = Object.fromEntries(
          Object.entries(raw?.items ?? {}).filter(
            ([key, value]) =>
              key.length < 100 &&
              typeof value === 'number' &&
              Number.isInteger(value) &&
              value > 0 &&
              value <= 99,
          ),
        ) as Record<string, number>;
        const favorites = Array.isArray(raw?.favorites)
          ? raw.favorites.filter((id): id is string => typeof id === 'string').slice(0, 200)
          : [];
        return { ...current, items, favorites };
      },
    },
  ),
);
export const getSubtotal = (
  items: Record<string, number>,
  products: ReadonlyArray<{ id: string; price: number }>,
) => products.reduce((total, product) => total + product.price * (items[product.id] ?? 0), 0);
