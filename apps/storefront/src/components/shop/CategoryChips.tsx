import Link from 'next/link';
import CategoryIcon from '@/components/category/CategoryIcon';
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
  const order = ['tahini', 'halva', 'oil', 'traditional-sweets', 'sesame'];
  const links = [
    { slug: '', title: 'همه', image: '' },
    ...[...categories].sort(
      (a, b) =>
        (order.indexOf(a.slug) < 0 ? order.length : order.indexOf(a.slug)) -
        (order.indexOf(b.slug) < 0 ? order.length : order.indexOf(b.slug)),
    ),
  ];
  return (
    <nav
      id="categories"
      aria-label="دسته‌های محصولات"
      className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-background/65 p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:p-4"
    >
      {links.map((category) => (
        <Link
          key={category.slug}
          href={category.slug ? `/category/${category.slug}` : '/shop'}
          aria-current={current === category.slug ? 'page' : undefined}
          className={cn(
            'group/chip flex min-h-11 w-[92px] shrink-0 flex-col items-center gap-1 rounded-xl p-1 text-center text-[11px] text-earth transition-[background-color,translate] duration-300 hover:bg-surface motion-safe:hover:-translate-y-1 motion-reduce:transition-none md:w-auto md:flex-row md:justify-center md:gap-3 md:text-sm',
            current === category.slug && 'bg-sesame/50 font-bold text-primary',
          )}
        >
          <span className="grid size-[52px] shrink-0 place-items-center overflow-hidden rounded-xl bg-surface md:size-16">
            {category.slug ? <CategoryIcon slug={category.slug} /> : <LayoutGrid size={25} />}
          </span>
          {category.title}
        </Link>
      ))}
    </nav>
  );
}
