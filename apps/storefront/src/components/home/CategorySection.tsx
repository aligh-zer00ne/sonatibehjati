import Link from 'next/link';
import CategoryIcon from '@/components/category/CategoryIcon';
import { Button } from '@/components/ui/button';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import SectionHeading from './SectionHeading';
export default function CategorySection({
  categories,
}: {
  categories: HomepageCatalogQuery['categories'];
}) {
  const order = ['tahini', 'halva', 'oil', 'traditional-sweets', 'sesame'];
  const sortedCategories = [...categories].sort((a, b) =>
    (order.indexOf(a.slug) < 0 ? order.length : order.indexOf(a.slug)) -
    (order.indexOf(b.slug) < 0 ? order.length : order.indexOf(b.slug)),
  );
  return (
    <section id="categories" className="my-8 md:my-12 xl:my-14">
      <SectionHeading title="دسته‌بندی محصولات" href="/shop#categories" />
      <div className="-mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[480px]:mx-0 min-[480px]:px-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:pb-0">
        {sortedCategories.map((category) => (
          <Button
            variant="outline"
            key={category.id}
            asChild
            className="group/category w-[126px] shrink-0 snap-start flex-col gap-0 text-foreground whitespace-normal rounded-[18px] border border-border bg-[linear-gradient(145deg,#fcf9f3,#f3e9da)] px-1.5 py-3 text-center hover:border-clay/40 hover:shadow-[0_12px_24px_rgba(98,69,47,0.14)] motion-safe:hover:-translate-y-1.5 min-[480px]:w-[150px] md:w-auto md:p-4 lg:p-5"
          >
            <Link href={`/category/${category.slug}`} aria-label={category.title}>
              <div className="flex h-[82px] items-center justify-center min-[480px]:h-[100px] md:h-[110px] md:w-[110px]">
                <CategoryIcon
                  className="h-full w-full rounded-[14px] object-contain drop-shadow-sm transition-transform duration-500 ease-out motion-safe:group-hover/category:scale-[1.08] motion-safe:group-hover/category:-rotate-3 motion-reduce:transition-none"
                  slug={category.slug}
                />
              </div>
              <h3 className="mt-[5px] text-xs leading-5 font-[650] md:text-base lg:text-lg">{category.title}</h3>
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
