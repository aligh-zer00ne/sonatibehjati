import Image from 'next/image';
import { cn } from '@/lib/utils';

const symbols: Record<string, string> = {
  tahini: 'tahini',
  halva: 'halva',
  oil: 'oil',
  sesame: 'sesame',
};

export default function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  return (
    <Image
      data-category-symbol={slug}
      src={`/images/categories/${symbols[slug] ?? 'sesame'}.svg`}
      alt=""
      width={128}
      height={128}
      unoptimized
      className={cn('h-full w-full object-contain', className)}
    />
  );
}
