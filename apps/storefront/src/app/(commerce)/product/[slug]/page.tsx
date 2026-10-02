import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { getProduct, getCatalogPage } from '@/lib/catalog/service';
import { formatPrice } from '@behjati/shared';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProductGallery from '@/components/product/ProductGallery';
import ProductPurchase from '@/components/product/ProductPurchase';
import ProductFeatures from '@/components/product/ProductFeatures';
import ProductTabs from '@/components/product/ProductTabs';
import FavoriteButton from '@/components/product/FavoriteButton';
import ProductGrid from '@/components/product/ProductGrid';
import { Badge } from '@/components/ui/badge';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: product?.title ?? 'محصول پیدا نشد',
    description: product?.shortDescription,
    alternates: { canonical: `/product/${encodeURIComponent(slug)}` },
    openGraph: product
      ? {
          title: product.title,
          description: product.shortDescription,
          images: product.images.map((image) => ({ url: image.url, alt: image.alt })),
        }
      : undefined,
  };
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const { catalog } = await getCatalogPage({
    category: product.category.slug,
    excludeSlug: slug,
    pageSize: 4,
  });
  return (
    <>
      <Breadcrumbs
        items={[
          { title: 'فروشگاه', href: '/shop' },
          { title: product.category.title, href: `/category/${product.category.slug}` },
          { title: product.title },
        ]}
      />
      <div className="grid items-start gap-7 md:grid-cols-2 md:gap-10">
        <ProductGallery key={product.id} title={product.title} images={product.images} />
        <div className="rounded-3xl border border-border bg-card/80 p-4 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link className="text-xs text-earth" href={`/category/${product.category.slug}`}>
                {product.category.title}
              </Link>
              <h1 className="mt-1 text-2xl font-extrabold lg:text-3xl">{product.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{product.weight}</p>
            </div>
            <FavoriteButton id={product.id} title={product.title} />
          </div>
          <div className="my-4 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star size={15} className="text-clay" />
              امتیاز کاربران به‌زودی
            </span>
            {product.badge && <Badge>{product.badge}</Badge>}
          </div>
          <p className="text-2xl font-extrabold text-primary">{formatPrice(product.price)}</p>
          <p className="mt-4 text-sm leading-8 text-muted-foreground">{product.shortDescription}</p>
          <ProductPurchase
            key={product.id}
            id={product.id}
            title={product.title}
            weight={product.weight}
          />
          <ProductFeatures />
        </div>
      </div>
      <ProductTabs key={product.id} product={product} />
      {catalog.items.length > 0 && (
        <section className="mt-9">
          <h2 className="mb-5 text-xl font-extrabold">محصولات مرتبط</h2>
          <ProductGrid products={catalog.items} />
        </section>
      )}
    </>
  );
}
