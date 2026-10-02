'use client';
import { useId, useRef, useState } from 'react';
import type { CatalogProductFragment } from '@/generated/graphql';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
const tabs = ['توضیحات', 'مشخصات', 'نظرات'];
export default function ProductTabs({ product }: { product: CatalogProductFragment }) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <section className="mt-8">
      <div role="tablist" aria-label="اطلاعات محصول" className="flex border-b border-border">
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
              selected === index && 'border-primary font-bold text-foreground',
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
            <p className="whitespace-pre-line">{product.description}</p>
          ) : index === 1 ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2">
              <dt>نام محصول</dt>
              <dd>{product.title}</dd>
              <dt>دسته‌بندی</dt>
              <dd>{product.category.title}</dd>
              <dt>وزن / حجم</dt>
              <dd>{product.weight}</dd>
            </dl>
          ) : (
            <p>هنوز نظری برای این محصول ثبت نشده است.</p>
          )}
        </div>
      ))}
    </section>
  );
}
