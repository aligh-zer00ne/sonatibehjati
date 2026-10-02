'use client';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { CatalogProductFragment } from '@/generated/graphql';
export default function ProductGallery({
  title,
  images,
}: {
  title: string;
  images: CatalogProductFragment['images'];
}) {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const sources = images;
  if (!sources.length)
    return (
      <div className="grid aspect-square place-items-center rounded-[22px] border border-border bg-surface text-sm text-muted-foreground">
        تصویر این محصول به‌زودی اضافه می‌شود
      </div>
    );
  const image = sources[selected] ?? sources[0]!;
  return (
    <div>
      <div className="group/gallery relative aspect-square overflow-hidden rounded-[22px] border border-border bg-[#f4ecdf]">
        <Image
          key={image.id}
          src={image.url}
          alt={image.alt || title}
          fill
          priority
          className="animate-in fade-in object-contain p-4 mix-blend-multiply duration-400 transition-transform ease-out motion-safe:group-hover/gallery:scale-105 motion-reduce:animate-none motion-reduce:transition-none"
          sizes="(max-width: 767px) 100vw, 580px"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-3 left-3 bg-background/80 text-earth"
          onClick={() => setOpen(true)}
          aria-label="بزرگ‌نمایی تصویر محصول"
        >
          <Expand size={19} />
        </Button>
        {sources.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-background/80"
              onClick={() => setSelected((value) => (value - 1 + sources.length) % sources.length)}
              aria-label="تصویر قبلی"
            >
              <ChevronRight />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-background/80"
              onClick={() => setSelected((value) => (value + 1) % sources.length)}
              aria-label="تصویر بعدی"
            >
              <ChevronLeft />
            </Button>
          </>
        )}
      </div>
      {sources.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {sources.map((item, index) => (
            <Button
              key={item.id}
              variant="outline"
              className={cn(
                'size-16 overflow-hidden rounded-xl p-1',
                index === selected && 'border-primary ring-1 ring-primary',
              )}
              aria-label={`نمایش تصویر ${index + 1}`}
              aria-pressed={index === selected}
              onClick={() => setSelected(index)}
            >
              <Image
                src={item.url}
                alt=""
                width={60}
                height={60}
                className="object-contain mix-blend-multiply"
              />
            </Button>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen} title={title} description="نمایش تصویر محصول">
        <div className="relative aspect-square">
          <Image
            src={image.url}
            alt={image.alt || title}
            fill
            className="object-contain"
            sizes="560px"
          />
        </div>
      </Dialog>
    </div>
  );
}
