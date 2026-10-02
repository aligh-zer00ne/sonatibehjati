import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import SectionHeading from './SectionHeading';
export default function CategorySection({
  categories,
}: {
  categories: HomepageCatalogQuery['categories'];
}) {
  return (
    <section id="categories" className="my-8 md:my-12 xl:my-14">
      <SectionHeading title="دسته‌بندی محصولات" href="/shop#categories" />
      <div className="grid grid-cols-3 gap-3 md:gap-5">
        {categories.map((category) => (
          <Button
            variant="outline"
            key={category.id}
            asChild
            className="group/category flex-col gap-0 text-foreground whitespace-normal md:flex-row rounded-[18px] border border-border bg-[linear-gradient(145deg,#fcf9f3,#f3e9da)] px-1.5 py-3 text-center hover:border-clay/40 hover:shadow-[0_12px_24px_rgba(98,69,47,0.14)] motion-safe:hover:-translate-y-1.5 md:flex md:items-center md:justify-center md:gap-[15px] md:p-5 lg:p-6"
          >
            <Link href={`/category/${category.slug}`} aria-label={category.title}>
              <div className="flex h-[100px] items-center justify-center min-[480px]:h-[140px] md:h-[110px] md:w-[110px]">
                <Image
                  className="h-full w-full rounded-[14px] object-contain mix-blend-multiply transition-transform duration-500 ease-out motion-safe:group-hover/category:scale-[1.08] motion-safe:group-hover/category:-rotate-3 motion-reduce:transition-none"
                  src={category.image}
                  alt={category.title}
                  width={140}
                  height={140}
                />
              </div>
              <h3 className="mt-[5px] text-sm font-[650] md:text-lg">{category.title}</h3>
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
