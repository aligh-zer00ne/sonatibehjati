'use client';
import { useUI } from '@/stores/ui';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { normalizeSearch } from '@behjati/shared';
import { Button } from '@/components/ui/button';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import { Input } from '@/components/ui/input';
import ProductGrid from '@/components/product/ProductGrid';
export default function SearchPanel({ products }: { products: HomepageCatalogQuery['products'] }) {
  const query = useUI((state) => state.searchQuery);
  const setQuery = useUI((state) => state.setSearchQuery);
  const results = products.filter((product) =>
    normalizeSearch(`${product.title} ${product.category.title}`).includes(normalizeSearch(query)),
  );
  return (
    <div>
      <label className="sr-only" htmlFor="product-search">
        جستجوی محصول
      </label>
      <div className="relative">
        <Search className="absolute top-[15px] right-3.5 text-muted-foreground" size={20} />
        <Input
          className="pr-[45px]"
          id="product-search"
          placeholder="مثلاً ارده کنجدی"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
        />
      </div>
      <p className="my-[15px] text-xs text-muted-foreground" aria-live="polite">
        {new Intl.NumberFormat('fa-IR').format(results.length)} محصول
      </p>
      <Button asChild variant="outline" className="mb-4 w-full">
        <Link href={`/search?q=${encodeURIComponent(query)}`}>مشاهده نتایج کامل جستجو</Link>
      </Button>
      {results.length ? (
        <ProductGrid products={results} compact />
      ) : (
        <div className="px-[18px] py-9 text-center">
          <Search className="mx-auto mb-[15px] text-clay" size={36} />
          <h3 className="mb-2.5 text-[19px] font-[750]">محصولی پیدا نشد</h3>
          <p className="text-[13px] leading-[2] text-muted-foreground">
            نام محصول دیگری را جستجو کنید.
          </p>
        </div>
      )}
    </div>
  );
}
