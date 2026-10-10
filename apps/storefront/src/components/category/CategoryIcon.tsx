import Image from 'next/image';
import { photoCategories } from '@behjati/shared/photo-catalog';
import { cn } from '@/lib/utils';

export default function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const category = photoCategories.find((category) => category.slug === slug);
  return (
    <Image
      data-category-symbol={slug}
      src={category?.image ?? '/images/categories/sesame-icon.png'}
      alt=""
      width={200}
      height={200}
      quality={85}
      sizes="(min-width: 1024px) 190px, (min-width: 768px) 140px, 138px"
      className={cn('h-full w-full object-contain', className)}
    />
  );
}
