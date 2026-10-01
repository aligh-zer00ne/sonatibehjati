'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCart, getSubtotal } from '@/stores/cart';
import { formatPrice } from '@behjati/shared';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import QuantityControl from '@/components/product/QuantityControl';
export default function CartPanel({ products }: { products: HomepageCatalogQuery['products'] }) {
  const items = useCart((state) => state.items);
  const remove = useCart((state) => state.remove);
  const selected = products.filter((product) => items[product.id]);
  if (!selected.length)
    return (
      <div className="px-[18px] py-9 text-center">
        <ShoppingCart className="mx-auto mb-[15px] text-clay" size={40} />
        <h3 className="mb-2.5 text-[19px] font-[750]">سبد خرید شما خالی است</h3>
        <p className="text-[13px] leading-[2] text-muted-foreground">
          طعم دلخواهتان را از محصولات انتخاب کنید.
        </p>
      </div>
    );
  return (
    <div>
      <div>
        {selected.map((product) => (
          <div
            className="flex items-center gap-3 border-b border-border py-[15px]"
            key={product.id}
          >
            <Image
              className="rounded-xl mix-blend-multiply"
              src={product.images[0]!.url}
              alt={product.title}
              width={72}
              height={72}
            />
            <div className="flex-1">
              <h3 className="text-[13px] font-bold">{product.title}</h3>
              <small className="text-[11px] text-muted-foreground">{product.weight}</small>
              <strong className="my-1.5 block text-xs text-primary">
                {formatPrice(product.price)}
              </strong>
              <QuantityControl className="w-[140px]" id={product.id} title={product.title} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-foreground"
              aria-label={`حذف ${product.title}`}
              onClick={() => remove(product.id)}
            >
              <Trash2 size={19} />
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between text-sm">
        <span>جمع محصولات</span>
        <strong className="text-primary">{formatPrice(getSubtotal(items, products))}</strong>
      </div>
      <p className="mt-4 text-xs leading-6 text-muted-foreground">
        سبد نمونه در مرورگر شما ذخیره می‌شود. ثبت سفارش و محاسبهٔ هزینهٔ ارسال در فازهای بعد فعال
        خواهد شد.
      </p>
    </div>
  );
}
