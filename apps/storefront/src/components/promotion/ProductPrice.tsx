'use client';
import { useEffect, useState } from 'react';
import { formatPrice, formatNumber } from '@behjati/shared';
import type { CatalogProductFragment } from '@/generated/graphql';
import { Timer } from 'lucide-react';
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
export function PromotionTimer({ promotion: sale }: { promotion: Sale }) {
  const { promotion, remaining, ready } = useLivePromotion(sale);
  if (!promotion) return null;
  const days = Math.floor(remaining / 86400);
  const time = [
    Math.floor((remaining % 86400) / 3600),
    Math.floor((remaining % 3600) / 60),
    remaining % 60,
  ]
    .map((value) => formatNumber(value).padStart(2, '۰'))
    .join(':');
  return (
    <span
      aria-label="زمان باقی‌مانده تخفیف"
      className="absolute top-0 left-1/2 z-20 flex h-6 -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-primary/30 bg-[#fff8ed] px-2 text-[10px] font-bold text-primary shadow-sm min-[480px]:text-xs"
    >
      <Timer size={13} aria-hidden="true" />
      {ready ? (
        <>
          {days > 0 && <span>{formatNumber(days)} روز</span>}
          <span dir="ltr" className="tabular-nums">
            {time}
          </span>
        </>
      ) : (
        <span>در حال محاسبه…</span>
      )}
    </span>
  );
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
  const { promotion } = useLivePromotion(product.promotion);
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
        <div className="relative mt-4 rounded-lg border border-primary/30 p-3">
          <PromotionTimer promotion={promotion} />
        </div>
      )}
    </div>
  );
}
