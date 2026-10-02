'use client';
import Link from 'next/link';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart, getSubtotal } from '@/stores/cart';
import { useCartHydrated } from '@/hooks/use-cart-hydrated';
import { useSelectedProducts } from '@/hooks/use-selected-products';
import { formatPrice } from '@behjati/shared';
import CartItem from '@/components/cart/CartItem';
export default function CartPanel() {
  const items = useCart((state) => state.items);
  const hydrated = useCartHydrated();
  const ids = Object.keys(items);
  const { products, loading, error, retry } = useSelectedProducts(ids, hydrated);
  if (loading) return <Skeleton className="h-64 rounded-2xl" aria-label="در حال دریافت سبد خرید" />;
  if (error)
    return (
      <EmptyState title="سبد دریافت نشد" description={error} icon={<AlertCircle size={36} />}>
        <Button className="mt-4" onClick={retry}>
          تلاش دوباره
        </Button>
      </EmptyState>
    );
  return (
    <div>
      {!ids.length ? (
        <EmptyState
          title="سبد خرید شما خالی است"
          description="طعم دلخواهتان را از محصولات انتخاب کنید."
          icon={<ShoppingCart size={40} />}
        />
      ) : (
        <>
          {products.map((product) => (
            <CartItem key={product.id} product={product} />
          ))}
          {ids.length > products.length && (
            <p role="status" className="my-4 text-sm">
              برخی محصولات دیگر در دسترس نیستند. آن‌ها را در صفحهٔ سبد بررسی کنید.
            </p>
          )}
          <div className="mt-6 flex justify-between text-sm">
            <span>جمع محصولات</span>
            <strong className="text-primary">{formatPrice(getSubtotal(items, products))}</strong>
          </div>
        </>
      )}
      <Button className="mt-5 w-full" asChild>
        <Link href={ids.length ? '/cart' : '/shop'}>
          {ids.length ? 'مشاهده سبد خرید' : 'مشاهده محصولات'}
        </Link>
      </Button>
    </div>
  );
}
