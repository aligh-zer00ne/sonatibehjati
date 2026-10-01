import type { HomepageCatalogQuery } from '@/generated/graphql';
import SectionHeading from './SectionHeading';
import ProductGrid from '@/components/product/ProductGrid';
export default function ProductSection({
  title,
  products,
  id,
}: {
  title: string;
  products: HomepageCatalogQuery['products'];
  id: string;
}) {
  return (
    <section className="home-section" id={id}>
      <SectionHeading title={title} href="#all-products" />
      <ProductGrid products={products} />
    </section>
  );
}
