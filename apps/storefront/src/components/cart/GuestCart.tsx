'use client';
import Link from 'next/link';
import { ShoppingCart, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart, getSubtotal } from '@/stores/cart';
import { useCartHydrated } from '@/hooks/use-cart-hydrated';
import { useSelectedProducts } from '@/hooks/use-selected-products';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
export default function GuestCart() {
  const items = useCart((state) => state.items);
  const remove = useCart((state) => state.remove);
  const hydrated = useCartHydrated();
  const ids = Object.keys(items);
  const { products, loading, error, retry } = useSelectedProducts(ids, hydrated);
  if (loading)
    return (
      <div
        aria-busy="true"
        aria-label="در حال دریافت سبد خرید"
        className="grid gap-6 md:grid-cols-[1.6fr_1fr]"
      >
        <div className="space-y-4">
          {[1, 2].map((id) => (
            <Skeleton key={id} className="h-40 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  if (error)
    return (
      <EmptyState title="سبد دریافت نشد" description={error} icon={<AlertCircle size={36} />}>
        <Button className="mt-4" onClick={retry}>
          تلاش دوباره
        </Button>
      </EmptyState>
    );
  if (!ids.length)
    return (
      <EmptyState
        title="سبد خرید شما خالی است"
        description="طعم دلخواهتان را از محصولات انتخاب کنید."
        icon={<ShoppingCart size={40} />}
      >
        <Button className="mt-5" asChild>
          <Link href="/shop">مشاهده محصولات</Link>
        </Button>
      </EmptyState>
    );
  const missing = ids.filter((id) => !products.some((product) => product.id === id));
  return (
    <div className="grid items-start gap-6 md:grid-cols-[1.6fr_1fr] md:gap-9">
      <div className="rounded-3xl border border-border bg-card/80 px-4 md:px-6">
        <div className="flex justify-between border-b border-border py-3">
          <span className="self-center text-xs text-muted-foreground">
            سبد در مرورگر شما ذخیره می‌شود
          </span>
          <Button variant="ghost" size="icon" aria-label="به‌روزرسانی اطلاعات سبد" onClick={retry}>
            <RefreshCw size={18} />
          </Button>
        </div>
        {products.map((product) => (
          <CartItem key={product.id} product={product} />
        ))}
        {missing.length > 0 && (
          <div className="my-5 rounded-xl border border-primary/20 bg-surface p-3">
            <p role="status" className="text-sm font-bold">
              برخی محصولات دیگر در دسترس نیستند
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              این موارد در مبلغ سبد محاسبه نشده‌اند.
            </p>
            {missing.map((id, index) => (
              <div key={id} className="mt-2 flex items-center justify-between">
                <span className="text-xs">محصول ناموجود {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(id)}
                  aria-label={`حذف محصول ناموجود ${index + 1}`}
                >
                  حذف از سبد
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <CartSummary subtotal={getSubtotal(items, products)} unavailable={missing.length > 0} />
    </div>
  );
}
