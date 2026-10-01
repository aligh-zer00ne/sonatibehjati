import type { HomepageCatalogQuery } from '@/generated/graphql';
import ProductCard from './ProductCard';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
export default function ProductGrid({
  products,
  compact = false,
}: {
  products: HomepageCatalogQuery['products'];
  compact?: boolean;
}) {
  if (!products.length)
    return (
      <EmptyState
        title="محصولی برای نمایش وجود ندارد"
        description="به‌زودی محصولات این بخش معرفی می‌شوند."
      />
    );
  return (
    <div
      data-slot="product-grid"
      className={cn(
        'grid grid-cols-2 gap-x-3 gap-y-4 min-[480px]:gap-5',
        compact ? 'md:grid-cols-2' : 'md:grid-cols-3 lg:grid-cols-4 lg:gap-6',
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
