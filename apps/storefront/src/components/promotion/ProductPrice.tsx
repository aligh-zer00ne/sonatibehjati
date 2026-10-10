'use client';
import { useEffect, useState } from 'react';
import { formatPrice, formatNumber } from '@behjati/shared';
import type { CatalogProductFragment } from '@/generated/graphql';
import { cn } from '@/lib/utils';
type Sale = CatalogProductFragment['promotion'];
export function useLivePromotion(promotion: Sale) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!promotion) return;
    const update = () => setNow(Date.now());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [promotion]);
  const active =
    promotion &&
    (now === null || (Date.parse(promotion.startsAt) <= now && Date.parse(promotion.endsAt) > now))
      ? promotion
      : null;
  return {
    promotion: active,
    remaining: active
      ? Math.max(
          0,
          Math.ceil((Date.parse(active.endsAt) - (now ?? Date.parse(active.startsAt))) / 1000),
        )
      : 0,
    ready: now !== null,
  };
}
export default function ProductPrice({
  product,
  details = false,
  className,
}: {
  product: Pick<CatalogProductFragment, 'price' | 'promotion'>;
  details?: boolean;
  className?: string;
}) {
  const { promotion, remaining, ready } = useLivePromotion(product.promotion);
  const days = Math.floor(remaining / 86400),
    hours = Math.floor((remaining % 86400) / 3600),
    minutes = Math.floor((remaining % 3600) / 60),
    seconds = remaining % 60;
  return (
    <div
      className={cn('my-2 space-y-1 text-sm font-bold text-primary', className)}
      data-product-price
    >
      {promotion && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
          <del className="font-normal text-muted-foreground" aria-label="قیمت قبل از تخفیف">
            {formatPrice(product.price)}
          </del>
          <span className="rounded-full bg-primary/10 px-2 py-0.5">
            {formatNumber(promotion.percent)}٪ تخفیف
          </span>
        </div>
      )}
      <p aria-label="قیمت فعلی">{formatPrice(promotion?.price ?? product.price)}</p>
      {details && promotion && (
        <div className="space-y-1 text-[10px] font-normal">
          <p className="truncate font-semibold">{promotion.title}</p>
          <p>{formatPrice(promotion.amount)} تخفیف</p>
          <p aria-label="زمان باقی‌مانده تخفیف" className="tabular-nums">
            {ready
              ? `${days ? formatNumber(days) + ' روز و ' : ''}${formatNumber(hours)} ساعت و ${formatNumber(minutes)} دقیقه و ${formatNumber(seconds)} ثانیه`
              : 'زمان باقی‌مانده در حال محاسبه…'}
          </p>
        </div>
      )}
    </div>
  );
}
