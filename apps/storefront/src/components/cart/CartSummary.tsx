import { ShoppingCart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@behjati/shared';
export default function CartSummary({
  subtotal,
  unavailable,
}: {
  subtotal: number;
  unavailable: boolean;
}) {
  return (
    <Card className="rounded-3xl bg-card/85 p-5 md:sticky md:top-6">
      <h2 className="mb-5 text-lg font-extrabold">خلاصهٔ سبد خرید</h2>
      <dl className="space-y-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt>جمع محصولات</dt>
          <dd className="font-bold">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-3 text-muted-foreground">
          <dt>کد تخفیف</dt>
          <dd className="text-xs">در مرحلهٔ ثبت سفارش</dd>
        </div>
        <div className="flex justify-between gap-3 text-muted-foreground">
          <dt>هزینهٔ ارسال</dt>
          <dd className="text-xs">پس از انتخاب نشانی</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-border pt-4">
          <dt className="font-bold">مبلغ محصولات</dt>
          <dd className="font-extrabold text-primary">{formatPrice(subtotal)}</dd>
        </div>
      </dl>
      <Button className="mt-6 w-full" disabled aria-describedby="checkout-status">
        <ShoppingCart size={18} />
        ادامهٔ ثبت سفارش
      </Button>
      <p id="checkout-status" className="mt-3 text-xs leading-7 text-muted-foreground">
        {unavailable ? 'ابتدا محصولات ناموجود را از سبد حذف کنید. ' : ''}تکمیل سفارش به‌زودی فعال
        می‌شود. مبلغ نهایی با هزینهٔ ارسال و تخفیف، پیش از پرداخت نمایش داده خواهد شد.
      </p>
    </Card>
  );
}
