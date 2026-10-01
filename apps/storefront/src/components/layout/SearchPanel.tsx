'use client';
import { useUI } from '@/stores/ui';
import { Search } from 'lucide-react';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import { Input } from '@/components/ui/input';
import ProductGrid from '@/components/product/ProductGrid';
export default function SearchPanel({ products }: { products: HomepageCatalogQuery['products'] }) {
  const query = useUI((state) => state.searchQuery);
  const setQuery = useUI((state) => state.setSearchQuery);
  const results = products.filter(
    (product) =>
      product.title.includes(query.trim()) || product.category.title.includes(query.trim()),
  );
  return (
    <div>
      <label className="sr-only" htmlFor="product-search">
        جستجوی محصول
      </label>
      <div className="search-input">
        <Search size={20} />
        <Input
          id="product-search"
          placeholder="مثلاً ارده کنجدی"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
        />
      </div>
      <p className="search-result-count" aria-live="polite">
        {new Intl.NumberFormat('fa-IR').format(results.length)} محصول
      </p>
      {results.length ? (
        <ProductGrid products={results} />
      ) : (
        <div className="empty-state">
          <Search size={36} />
          <h3>محصولی پیدا نشد</h3>
          <p>نام محصول دیگری را جستجو کنید.</p>
        </div>
      )}
    </div>
  );
}
