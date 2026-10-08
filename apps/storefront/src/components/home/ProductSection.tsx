import type { HomepageCatalogQuery } from '@/generated/graphql';
import SectionHeading from './SectionHeading';
import ProductGrid from '@/components/product/ProductGrid';
export default function ProductSection({
  title,
  products,
  id,
  carouselOnMobile = false,
}: {
  title: string;
  products: HomepageCatalogQuery['products'];
  id: string;
  carouselOnMobile?: boolean;
}) {
  return (
    <section className="my-8 md:my-12 xl:my-14" id={id}>
      <SectionHeading title={title} href="/shop" />
      <ProductGrid products={products} carouselOnMobile={carouselOnMobile} />
    </section>
  );
}
