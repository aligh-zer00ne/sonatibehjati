import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import { cn } from '@/lib/utils';
export default function CategoryChips({
  categories,
  current = '',
}: {
  categories: HomepageCatalogQuery['categories'];
  current?: string;
}) {
  const links = [{ slug: '', title: 'همه', image: '' }, ...categories];
  return (
    <nav
      id="categories"
      aria-label="دسته‌های محصولات"
      className="mb-6 grid grid-cols-4 gap-2 rounded-2xl border border-border bg-background/65 p-2 md:gap-4 md:p-4"
    >
      {links.map((category) => (
        <Link
          key={category.slug}
          href={category.slug ? `/category/${category.slug}` : '/shop'}
          aria-current={current === category.slug ? 'page' : undefined}
          className={cn(
            'group/chip flex min-h-11 flex-col items-center gap-1 rounded-xl p-1 text-center text-[11px] text-earth transition-[background-color,translate] duration-300 hover:bg-surface motion-safe:hover:-translate-y-1 motion-reduce:transition-none md:flex-row md:justify-center md:gap-3 md:text-sm',
            current === category.slug && 'bg-sesame/50 font-bold text-primary',
          )}
        >
          <span className="grid size-[52px] place-items-center rounded-full bg-surface md:size-16">
            {category.image ? (
              <Image
                src={category.image}
                alt=""
                className="rounded-full object-contain mix-blend-multiply"
                width={58}
                height={58}
              />
            ) : (
              <LayoutGrid size={25} />
            )}
          </span>
          {category.title}
        </Link>
      ))}
    </nav>
  );
}
