import type { HomepageCatalogQuery } from '@/generated/graphql';
import ProductCard from './ProductCard';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
export default function ProductGrid({
  products,
  compact = false,
  carouselOnMobile = false,
  horizontal = false,
  promotionDetails = false,
}: {
  products: HomepageCatalogQuery['products'];
  compact?: boolean;
  carouselOnMobile?: boolean;
  horizontal?: boolean;
  promotionDetails?: boolean;
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
        horizontal
          ? 'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-5'
          : carouselOnMobile
            ? '-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[480px]:mx-0 min-[480px]:px-0 md:grid md:overflow-visible md:pb-0'
            : 'grid grid-cols-2 gap-x-3 gap-y-4 min-[480px]:gap-5',
        promotionDetails && 'pt-3',
        !horizontal && (compact ? 'md:grid-cols-2' : 'md:grid-cols-3 lg:grid-cols-4 lg:gap-6'),
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          compactOnMobile={carouselOnMobile}
          horizontal={horizontal}
          promotionDetails={promotionDetails}
        />
      ))}
    </div>
  );
}
