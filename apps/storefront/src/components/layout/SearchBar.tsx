'use client';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/stores/ui';
export default function SearchBar() {
  const open = useUI((state) => state.setPanel);
  const setQuery = useUI((state) => state.setSearchQuery);
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 min-[480px]:px-6 xl:px-0 mb-3 md:mb-6">
      <Button
        variant="outline"
        className="flex min-h-12 w-full justify-start gap-2.5 rounded-3xl border border-border bg-white/35 px-4 text-right text-xs font-normal text-muted-foreground"
        onClick={() => {
          setQuery('');
          open('search');
        }}
      >
        <Search size={21} />
        <span>جستجو در محصولات سنتی بهجتی...</span>
        <span className="mr-auto hidden text-[11px] md:block">ارده، حلواارده، روغن ارده</span>
      </Button>
    </div>
  );
}
