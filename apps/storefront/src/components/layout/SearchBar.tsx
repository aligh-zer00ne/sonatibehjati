'use client';
import { Search } from 'lucide-react';
import { useUI } from '@/stores/ui';
export default function SearchBar() {
  const open = useUI((state) => state.setPanel);
  const setQuery = useUI((state) => state.setSearchQuery);
  return (
    <div className="container search-wrap">
      <button
        className="search-bar"
        onClick={() => {
          setQuery('');
          open('search');
        }}
      >
        <Search size={21} />
        <span>جستجو در محصولات بهجتی...</span>
        <span className="search-hint">ارده، حلواارده، روغن ارده</span>
      </button>
    </div>
  );
}
