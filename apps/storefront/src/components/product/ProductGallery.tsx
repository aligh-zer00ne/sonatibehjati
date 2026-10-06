'use client';
import { productPhotoUrl } from '@/lib/product-photo';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import FavoriteButton from './FavoriteButton';
import { cn } from '@/lib/utils';
import type { CatalogProductFragment } from '@/generated/graphql';
import { formatNumber } from '@behjati/shared';
export default function ProductGallery({
  id,
  title,
  images,
}: {
  id: string;
  title: string;
  images: CatalogProductFragment['images'];
}) {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  if (!images.length)
    return (
      <div className="grid aspect-square place-items-center rounded-3xl border border-border bg-surface text-sm text-muted-foreground">
        تصویر این محصول به‌زودی اضافه می‌شود
      </div>
    );
  const image = images[selected] ?? images[0]!;
  return (
    <div data-product-gallery className="min-w-0" dir="ltr">
      <div className="grid gap-3 lg:grid-cols-[72px_minmax(0,1fr)]">
        <div className="group/gallery relative overflow-hidden rounded-3xl border border-earth/10 bg-[#f4ecdf] shadow-[0_18px_45px_-25px_rgba(98,69,47,0.5)] lg:col-start-2 lg:row-start-1">
          <Button
            variant="ghost"
            className="relative block aspect-square h-auto w-full overflow-hidden rounded-none p-0 hover:bg-transparent lg:aspect-[4/5]"
            onClick={() => setOpen(true)}
            aria-label="بزرگ‌نمایی تصویر محصول"
          >
            <Image
              key={image.id}
              src={productPhotoUrl(image.url)}
              unoptimized={image.url.startsWith('https://')}
              alt={image.alt || title}
              fill
              priority
              quality={85}
              className="animate-in fade-in object-cover duration-500 transition-transform ease-out motion-safe:group-hover/gallery:scale-[1.035] motion-reduce:animate-none motion-reduce:transition-none"
              sizes="(max-width: 767px) 150vw, (max-width: 1023px) 75vw, 960px"
            />
            <span className="absolute bottom-4 left-4 grid size-10 place-items-center rounded-full border border-white/50 bg-background/85 text-earth shadow-sm backdrop-blur-sm">
              <Expand size={19} />
            </span>
          </Button>
          <FavoriteButton
            id={id}
            title={title}
            className="absolute top-4 right-4 bg-background/90 shadow-sm"
          />
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-background/90 shadow-sm"
                onClick={() => setSelected((value) => (value - 1 + images.length) % images.length)}
                aria-label="تصویر قبلی"
              >
                <ChevronRight />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-background/90 shadow-sm"
                onClick={() => setSelected((value) => (value + 1) % images.length)}
                aria-label="تصویر بعدی"
              >
                <ChevronLeft />
              </Button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div
            aria-label="تصاویر محصول"
            className="mx-auto grid w-full max-w-sm grid-cols-4 gap-2 lg:col-start-1 lg:row-start-1 lg:flex lg:flex-col lg:gap-3"
          >
            {images.map((item, index) => (
              <Button
                key={item.id}
                variant="outline"
                className={cn(
                  'relative aspect-square h-auto w-full overflow-hidden rounded-xl border-2 border-transparent bg-[#f4ecdf] p-0 shadow-sm',
                  index === selected &&
                    'border-primary ring-2 ring-primary/15 ring-offset-2 ring-offset-background',
                )}
                aria-label={`نمایش تصویر ${formatNumber(index + 1)}`}
                aria-pressed={index === selected}
                onClick={() => setSelected(index)}
              >
                <Image
                  src={productPhotoUrl(item.url)}
                  unoptimized={item.url.startsWith('https://')}
                  alt=""
                  fill
                  sizes="90px"
                  className="object-cover"
                />
              </Button>
            ))}
          </div>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground" dir="rtl" aria-live="polite">
        تصویر {formatNumber(selected + 1)} از {formatNumber(images.length)}
      </p>
      <Dialog open={open} onOpenChange={setOpen} title={title} description="نمایش تصویر محصول">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f4ecdf]">
          <Image
            src={productPhotoUrl(image.url)}
            unoptimized={image.url.startsWith('https://')}
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
