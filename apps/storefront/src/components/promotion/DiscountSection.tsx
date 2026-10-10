'use client';
import { useEffect, useState } from 'react';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import ProductGrid from '@/components/product/ProductGrid';
import SectionHeading from '@/components/home/SectionHeading';
export default function DiscountSection({
  products,
}: {
  products: HomepageCatalogQuery['products'];
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!products.length) return;
    const update = () => setNow(Date.now());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [products]);
  const active = products.filter(
    (product) => product.promotion && (now === null || Date.parse(product.promotion.endsAt) > now),
  );
  if (!active.length) return null;
  return (
    <section
      id="promotions"
      className="my-8 rounded-3xl border border-primary/15 bg-sesame/20 p-3 md:my-12 md:p-5"
    >
      <SectionHeading title="تخفیف‌ها و جشنواره‌های سنتی بهجتی" href="/shop" />
      <ProductGrid products={active} horizontal promotionDetails />
    </section>
  );
}
