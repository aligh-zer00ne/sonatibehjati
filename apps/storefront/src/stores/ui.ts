'use client';
import { create } from 'zustand';
type Panel = 'menu' | 'search' | 'cart' | 'account' | null;
export const useUI = create<{
  panel: Panel;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setPanel: (panel: Panel) => void;
}>((set) => ({
  panel: null,
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setPanel: (panel) => set({ panel }),
}));
