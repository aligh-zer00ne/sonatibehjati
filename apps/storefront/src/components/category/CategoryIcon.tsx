import Image from 'next/image';
import { cn } from '@/lib/utils';

const symbols: Record<string, string> = {
  tahini: 'tahini',
  halva: 'halva',
  oil: 'oil',
  'traditional-sweets': 'sweets',
  sesame: 'sesame',
};

export default function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  return (
    <Image
      data-category-symbol={slug}
      src={`/images/categories/${symbols[slug] ?? 'sesame'}-emblem.svg`}
      alt=""
      width={200}
      height={200}
      unoptimized
      className={cn('h-full w-full object-contain', className)}
    />
  );
}
