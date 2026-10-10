'use client';
import { productPhotoUrl } from '@/lib/product-photo';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, ImageOff } from 'lucide-react';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import { MAX_CART_LINES } from '@behjati/shared';
import { useCart } from '@/stores/cart';
import ProductPrice from '@/components/promotion/ProductPrice';
import ProductBadge from './ProductBadge';
import QuantityControl from './QuantityControl';
import FavoriteButton from './FavoriteButton';
import { cn } from '@/lib/utils';
export default function ProductCard({
  product,
  compactOnMobile = false,
  horizontal = false,
  promotionDetails = false,
}: {
  product: HomepageCatalogQuery['products'][number];
  compactOnMobile?: boolean;
  horizontal?: boolean;
  promotionDetails?: boolean;
}) {
  const quantity = useCart((state) => state.items[product.id] ?? 0);
  const add = useCart((state) => state.add);
  const full = useCart((state) => Object.keys(state.items).length >= MAX_CART_LINES);
  const image = product.images[0];
  return (
    <article
      className={cn(
        'group/product min-w-0',
        horizontal
          ? 'w-[154px] shrink-0 snap-start min-[480px]:w-[180px] md:w-[210px] lg:w-[230px]'
          : compactOnMobile && 'w-[154px] shrink-0 snap-start min-[480px]:w-[180px] md:w-auto',
      )}
      data-product-slug={product.slug}
    >
      <Card className="relative isolate h-full overflow-hidden rounded-[19px] border-earth/10 bg-[linear-gradient(155deg,#fdf8ee,#f4e6d2)] p-2 shadow-[0_4px_18px_rgba(98,69,47,0.04)] transition-[translate,box-shadow,border-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:border-clay/40 group-hover/product:shadow-[0_16px_32px_rgba(98,69,47,0.16)] group-focus-within/product:border-clay/40 motion-safe:group-hover/product:-translate-y-2 motion-safe:group-focus-within/product:-translate-y-1 motion-reduce:transition-none lg:p-3">
        <div className="relative aspect-square overflow-hidden rounded-[14px] bg-[#f4ecdf]">
          <Link
            href={`/product/${product.slug}`}
            className="absolute inset-0"
            aria-label={`مشاهده ${product.title}`}
          >
            {image ? (
              <Image
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/product:scale-[1.08] motion-safe:group-focus-within/product:scale-[1.04] motion-reduce:transition-none"
                src={productPhotoUrl(image.url)}
                unoptimized={image.url.startsWith('https://')}
                alt={image.alt || product.title}
                fill
                sizes="(max-width: 480px) 45vw, (max-width: 1023px) 30vw, 270px"
              />
            ) : (
              <span className="grid h-full place-items-center text-clay">
                <ImageOff size={36} aria-label="تصویر محصول موجود نیست" />
              </span>
            )}
          </Link>
          {product.badge && <ProductBadge label={product.badge} />}
          <FavoriteButton
            id={product.id}
            title={product.title}
            className="absolute top-0.5 left-0.5 z-10"
          />
        </div>
        <div className="pt-2.5 text-center lg:pt-3.5 lg:pb-0.5">
          <h3 className="text-sm leading-[1.7] font-[750] min-[480px]:text-base lg:text-[17px]">
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex min-h-11 items-center justify-center hover:text-primary"
            >
              {product.title}
            </Link>
          </h3>
          <p className="my-[3px] text-xs text-muted-foreground">{product.weight}</p>
          <ProductPrice
            product={product}
            details={promotionDetails}
            className="min-[480px]:text-base lg:text-lg"
          />
          {quantity ? (
            <QuantityControl id={product.id} title={product.title} />
          ) : (
            <Button
              className="min-h-11 w-full gap-[5px] rounded-3xl px-2 py-0 text-xs lg:text-sm"
              onClick={() => add(product.id)}
              disabled={full}
              title={full ? 'سبد به حداکثر تعداد محصولات رسیده است' : undefined}
              aria-label={`افزودن ${product.title} به سبد خرید`}
            >
              <Plus size={15} /> افزودن
            </Button>
          )}
        </div>
      </Card>
    </article>
  );
}
