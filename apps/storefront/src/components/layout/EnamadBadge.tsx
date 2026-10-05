'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';

const sealCode = 'LhcPkkTt16DfQeGGnaGyvZEhRrXuuVuY';
const sealQuery = `id=7974460&Code=${sealCode}`;

export default function EnamadBadge() {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <Card
      data-enamad-badge
      className="mx-auto flex w-full max-w-[220px] flex-col items-center gap-3 border-earth/15 bg-background/70 p-5 text-center shadow-none md:mx-0"
      role="region"
      aria-labelledby="enamad-title"
    >
      <a
        href={`https://trustseal.enamad.ir/?${sealQuery}`}
        target="_blank"
        rel="noopener"
        referrerPolicy="origin"
        aria-label="مشاهده اعتبار نماد اعتماد الکترونیکی سنتی بهجتی در تب جدید"
        className="inline-flex min-h-32 min-w-32 cursor-pointer items-center justify-center rounded-xl transition-transform duration-300 motion-safe:hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none"
      >
        {imageFailed ? (
          <span className="flex min-h-32 max-w-40 flex-col items-center gap-3 px-2 py-3 text-center">
            <ExternalLink className="size-7 text-primary" aria-hidden="true" />
            <span className="text-sm font-bold text-primary">مشاهده اعتبار نماد</span>
            <span className="text-xs leading-6 text-muted-foreground">
              تصویر نماد موقتاً در دسترس نیست.
            </span>
          </span>
        ) : (
          <img
            src={`https://trustseal.enamad.ir/logo.aspx?${sealQuery}`}
            referrerPolicy="origin"
            alt="نماد اعتماد الکترونیکی سنتی بهجتی"
            width={128}
            height={128}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="h-32 w-32 cursor-pointer object-contain"
            {...{ code: sealCode }}
          />
        )}
      </a>
      <h3 id="enamad-title" className="text-sm font-bold text-earth">
        نماد اعتماد الکترونیکی
      </h3>
    </Card>
  );
}
