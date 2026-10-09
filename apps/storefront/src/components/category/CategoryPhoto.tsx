import Image from 'next/image';
import { photoCategories } from '@behjati/shared/photo-catalog';
import { cn } from '@/lib/utils';

export default function CategoryPhoto({
  slug,
  image,
  className,
}: {
  slug: string;
  image?: string;
  className?: string;
}) {
  const fallback =
    photoCategories.find((category) => category.slug === slug)?.image ??
    '/images/products/sesame-seeds.webp';
  // Previously saved category icons are replaced without requiring a database import.
  const src = image && !/\.svg(?:[?#]|$)/i.test(image) ? image : fallback;
  const familyPhoto = src.includes('/images/home/');
  return (
    <Image
      data-category-photo={slug}
      src={src}
      alt=""
      width={360}
      height={240}
      quality={85}
      sizes="(max-width: 767px) 150px, 220px"
      unoptimized={src.startsWith('https://') || src.startsWith('http://')}
      className={cn('h-full w-full', familyPhoto ? 'object-contain' : 'object-cover', className)}
    />
  );
}
