'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Heart, Plus } from 'lucide-react';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import { formatPrice } from '@behjati/shared';
import { useCart } from '@/stores/cart';
import ProductBadge from './ProductBadge';
import QuantityControl from './QuantityControl';
import { SesamePattern } from '@/components/decoration/sesame-pattern';
import { productMotif } from './product-motif';
export default function ProductCard({
  product,
}: {
  product: HomepageCatalogQuery['products'][number];
}) {
  const quantity = useCart((state) => state.items[product.id] ?? 0);
  const favorite = useCart((state) => state.favorites.includes(product.id));
  const add = useCart((state) => state.add);
  const toggle = useCart((state) => state.toggleFavorite);
  return (
    <article className="group/product min-w-0" data-product-slug={product.slug}>
      <Card className="relative isolate h-full overflow-hidden rounded-[19px] border-earth/10 bg-[linear-gradient(155deg,#fdf8ee,#f4e6d2)] p-2 shadow-[0_4px_18px_rgba(98,69,47,0.04)] transition-[translate,box-shadow,border-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:border-clay/40 group-hover/product:shadow-[0_16px_32px_rgba(98,69,47,0.16)] group-focus-within/product:border-clay/40 motion-safe:group-hover/product:-translate-y-2 motion-safe:group-focus-within/product:-translate-y-1 motion-reduce:transition-none lg:p-3">
        <SesamePattern
          motif={productMotif(product)}
          className="-z-10 text-[#a97b47] opacity-[0.26] transition-opacity duration-500 group-hover/product:opacity-45 motion-reduce:transition-none"
        />
        <div className="relative aspect-square overflow-hidden rounded-[14px] bg-[#f4ecdf]">
          <Image
            className="object-contain p-1.5 mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/product:scale-[1.08] motion-safe:group-focus-within/product:scale-[1.04] motion-reduce:transition-none"
            src={product.images[0]?.url ?? '/images/tahini.webp'}
            alt={product.images[0]?.alt ?? product.title}
            fill
            sizes="(max-width: 480px) 45vw, (max-width: 1023px) 30vw, 270px"
          />
          {product.badge && <ProductBadge label={product.badge} />}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-0.5 left-0.5 rounded-full bg-[#f4ecdf] text-[#615649]',
              favorite && 'text-primary',
            )}
            aria-label={`${favorite ? 'حذف از' : 'افزودن به'} علاقه‌مندی‌ها: ${product.title}`}
            aria-pressed={favorite}
            onClick={() => toggle(product.id)}
          >
            <Heart
              key={String(favorite)}
              className={
                favorite
                  ? 'animate-in zoom-in-50 duration-300 motion-reduce:animate-none'
                  : undefined
              }
              size={19}
              fill={favorite ? 'currentColor' : 'none'}
            />
          </Button>
        </div>
        <div className="pt-2.5 text-center lg:pt-3.5 lg:pb-0.5">
          <h3 className="text-sm leading-[1.7] font-[750] min-[480px]:text-base lg:text-[17px]">
            {product.title}
          </h3>
          <p className="my-[3px] text-xs text-muted-foreground">{product.weight}</p>
          <p className="my-[9px] text-sm font-[750] text-primary min-[480px]:text-base lg:text-lg">
            {formatPrice(product.price)}
          </p>
          {quantity ? (
            <QuantityControl id={product.id} title={product.title} />
          ) : (
            <Button
              className="min-h-11 w-full gap-[5px] rounded-3xl px-2 py-0 text-xs lg:text-sm"
              onClick={() => add(product.id)}
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
