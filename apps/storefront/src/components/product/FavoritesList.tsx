'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useCart } from '@/stores/cart';
import { useCartHydrated } from '@/hooks/use-cart-hydrated';
import { useSelectedProducts } from '@/hooks/use-selected-products';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import ProductGrid from './ProductGrid';
import CatalogSkeleton from '@/components/shop/CatalogSkeleton';
export default function FavoritesList() {
  const ids = useCart((state) => state.favorites);
  const toggle = useCart((state) => state.toggleFavorite);
  const { products, loading, error, retry } = useSelectedProducts(ids, useCartHydrated());
  if (loading) return <CatalogSkeleton />;
  if (error)
    return (
      <EmptyState title="علاقه‌مندی‌ها دریافت نشد" description={error}>
        <Button className="mt-4" onClick={retry}>
          تلاش دوباره
        </Button>
      </EmptyState>
    );
  const missing = ids.filter((id) => !products.some((product) => product.id === id));
  return (
    <>
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState
          title="هنوز محصولی انتخاب نکرده‌اید"
          description="با نشان قلب، محصولات دلخواهتان را ذخیره کنید."
          icon={<Heart size={38} />}
        >
          <Button className="mt-5" asChild>
            <Link href="/shop">مشاهده محصولات</Link>
          </Button>
        </EmptyState>
      )}
      {missing.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm">برخی علاقه‌مندی‌های ذخیره‌شده دیگر در دسترس نیستند.</p>
          <Button className="mt-3" variant="outline" onClick={() => missing.forEach(toggle)}>
            حذف موارد ناموجود
          </Button>
        </div>
      )}
    </>
  );
}
