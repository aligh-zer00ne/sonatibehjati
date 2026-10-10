'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const sealCode = 'LhcPkkTt16DfQeGGnaGyvZEhRrXuuVuY';
const sealQuery = `id=7974460&Code=${sealCode}`;

export default function EnamadBadge({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div
      data-enamad-badge
      className={cn(
        'flex h-[80px] w-[76px] flex-col items-center justify-center gap-1 rounded-xl border border-earth/10 bg-white/65 p-1 text-center',
        compact && 'size-12 gap-0 rounded-lg',
        className,
      )}
      role="region"
      aria-labelledby="enamad-title"
    >
      <a
        href={`https://trustseal.enamad.ir/?${sealQuery}`}
        target="_blank"
        rel="noopener"
        referrerPolicy="origin"
        aria-label="مشاهده اعتبار نماد اعتماد الکترونیکی سنتی بهجتی در تب جدید"
        className={cn(
          'inline-flex size-[46px] cursor-pointer items-center justify-center rounded-lg transition-transform duration-300 motion-safe:hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none',
          compact && 'size-10',
        )}
      >
        {imageFailed ? (
          <span className="flex flex-col items-center text-center">
            <ExternalLink className="size-5 text-primary" aria-hidden="true" />
            <span
              className={cn('text-[9px] leading-3 font-bold text-primary', compact && 'text-[7px]')}
            >
              استعلام نماد
            </span>
          </span>
        ) : (
          <img
            src={`https://trustseal.enamad.ir/logo.aspx?${sealQuery}`}
            referrerPolicy="origin"
            alt="نماد اعتماد الکترونیکی سنتی بهجتی"
            width={46}
            height={46}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className={cn('size-[46px] cursor-pointer object-contain', compact && 'size-10')}
            {...{ code: sealCode }}
          />
        )}
      </a>
      <h3
        id="enamad-title"
        className={cn('text-[8px] leading-3 font-bold text-earth', compact && 'sr-only')}
      >
        نماد اعتماد
      </h3>
    </div>
  );
}
