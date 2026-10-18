'use client';
import { useId, useRef, useState } from 'react';
import type { CatalogProductFragment, PublicProductReviewsQuery } from '@/generated/graphql';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProductReviews from './ProductReviews';
import { cn } from '@/lib/utils';
import { productDescription } from '@behjati/shared/photo-catalog';
const tabs = ['توضیحات', 'مشخصات', 'نظرات'];
export default function ProductTabs({
  product,
  reviews,
}: {
  product: CatalogProductFragment;
  reviews: PublicProductReviewsQuery['productReviews'];
}) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <Card className="mt-8 rounded-3xl border-earth/10 bg-card/85 p-4 sm:p-6">
      <div role="tablist" aria-label="اطلاعات محصول" className="flex gap-1 border-b border-border">
        {tabs.map((title, index) => (
          <Button
            ref={(element) => {
              refs.current[index] = element;
            }}
            key={title}
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel-${index}`}
            aria-selected={index === selected}
            tabIndex={index === selected ? 0 : -1}
            variant="ghost"
            className={cn(
              'rounded-none border-b-2 border-transparent px-4 text-sm text-muted-foreground',
              selected === index && 'border-primary bg-primary/5 font-bold text-primary',
            )}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? 2
                    : (selected + (event.key === 'ArrowLeft' ? 1 : 2)) % 3;
              setSelected(next);
              refs.current[next]?.focus();
            }}
          >
            {title}
          </Button>
        ))}
      </div>
      {tabs.map((_, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={selected !== index}
          tabIndex={0}
          className="py-5 text-sm leading-8 text-earth outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {index === 0 ? (
            <p className="whitespace-pre-line">{productDescription(product)}</p>
          ) : index === 1 ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 rounded-xl bg-surface/60 p-4">
              <dt>نام محصول</dt>
              <dd>{product.title}</dd>
              <dt>دسته‌بندی</dt>
              <dd>{product.category.title}</dd>
              <dt>وزن / حجم</dt>
              <dd>{product.weight}</dd>
            </dl>
          ) : selected === 2 ? (
            <ProductReviews productId={product.id} slug={product.slug} initial={reviews} />
          ) : null}
        </div>
      ))}
    </Card>
  );
}
