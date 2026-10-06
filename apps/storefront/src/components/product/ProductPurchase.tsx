'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/stores/cart';
import { formatNumber, MAX_CART_QUANTITY, MAX_CART_LINES } from '@behjati/shared';
export default function ProductPurchase({
  id,
  title,
  weight,
}: {
  id: string;
  title: string;
  weight: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const cartQuantity = useCart((state) => state.items[id] ?? 0);
  const add = useCart((state) => state.add);
  const full = useCart((state) => Object.keys(state.items).length >= MAX_CART_LINES);
  const limited = cartQuantity >= MAX_CART_QUANTITY || (full && !cartQuantity);
  return (
    <div className="mt-6 space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-bold">وزن محصول</legend>
        <Button
          type="button"
          variant="outline"
          aria-pressed="true"
          className="min-w-28 rounded-xl border-primary/50 bg-primary/5 px-4 font-bold text-primary"
        >
          {weight}
        </Button>
        <p className="mt-1 text-[11px] text-muted-foreground">وزن ثبت‌شده برای این محصول</p>
      </fieldset>
      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex h-12 w-32 shrink-0 items-center justify-between rounded-xl border border-border bg-background/80">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setQuantity((value) => value + 1);
              setAdded(false);
            }}
            disabled={quantity >= MAX_CART_QUANTITY}
            aria-label="افزایش تعداد انتخابی"
          >
            <Plus size={19} />
          </Button>
          <output
            key={quantity}
            className="animate-in fade-in text-sm duration-200 motion-reduce:animate-none"
            aria-label="تعداد انتخابی"
            aria-live="polite"
          >
            {formatNumber(quantity)}
          </output>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setQuantity((value) => value - 1);
              setAdded(false);
            }}
            disabled={quantity <= 1}
            aria-label="کاهش تعداد انتخابی"
          >
            <Minus size={19} />
          </Button>
        </div>
        <Button
          className="h-12 min-w-44 flex-1 rounded-xl text-sm font-bold"
          disabled={limited}
          aria-label={`افزودن ${title} به سبد خرید`}
          onClick={() => {
            add(id, quantity);
            setAdded(true);
          }}
        >
          <ShoppingCart size={20} />
          افزودن به سبد خرید
        </Button>
      </div>
      <p role="status" className="min-h-5 text-center text-xs text-earth">
        {full && !cartQuantity ? (
          'سبد به حداکثر تعداد محصولات رسیده است. برای افزودن، یک محصول را حذف کنید.'
        ) : cartQuantity >= MAX_CART_QUANTITY ? (
          'حداکثر تعداد این محصول در سبد ثبت شده است.'
        ) : added ? (
          <span className="inline-flex items-center gap-1.5">
            <Check size={16} />
            محصول به سبد اضافه شد
          </span>
        ) : cartQuantity ? (
          `${formatNumber(cartQuantity)} عدد از این محصول در سبد شماست`
        ) : (
          ''
        )}
      </p>
      {cartQuantity > 0 && (
        <Button variant="outline" className="w-full" asChild>
          <Link href="/cart">مشاهده سبد خرید</Link>
        </Button>
      )}
    </div>
  );
}
