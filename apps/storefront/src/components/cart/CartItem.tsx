'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuantityControl from '@/components/product/QuantityControl';
import { formatNumber, formatPrice } from '@behjati/shared';
import { useCart } from '@/stores/cart';
import type { CatalogProductFragment } from '@/generated/graphql';
export default function CartItem({ product }: { product: CatalogProductFragment }) {
  const quantity = useCart((state) => state.items[product.id] ?? 0);
  const remove = useCart((state) => state.remove);
  const image = product.images[0];
  return (
    <article
      data-cart-product={product.slug}
      className="flex gap-3 border-b border-border py-5 md:gap-5"
    >
      <Link
        className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-surface md:size-28"
        href={`/product/${product.slug}`}
        aria-label={`مشاهده ${product.title}`}
      >
        {image ? (
          <Image
            src={image.url}
            unoptimized={image.url.startsWith('https://')}
            alt={product.title}
            fill
            className="object-contain p-1 mix-blend-multiply"
            sizes="112px"
          />
        ) : (
          <span className="grid h-full place-items-center text-clay">
            <ImageOff size={24} />
          </span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/product/${product.slug}`} className="text-sm font-bold md:text-base">
          {product.title}
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">{product.weight}</p>
        <p className="my-2 text-sm font-bold text-primary">
          {formatPrice(product.price * quantity)}
        </p>
        <QuantityControl className="max-w-[170px]" id={product.id} title={product.title} />
        <p className="mt-2 text-[10px] text-muted-foreground">
          {formatNumber(quantity)} × {formatPrice(product.price)}
        </p>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="self-start text-primary"
        aria-label={`حذف ${product.title}`}
        onClick={() => remove(product.id)}
      >
        <Trash2 size={18} />
      </Button>
    </article>
  );
}
