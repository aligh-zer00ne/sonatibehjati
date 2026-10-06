import { productPhotoUrl } from '@/lib/product-photo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProduct, getCatalogPage } from '@/lib/catalog/service';
import { formatPrice } from '@behjati/shared';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProductGallery from '@/components/product/ProductGallery';
import ProductPurchase from '@/components/product/ProductPurchase';
import ProductFeatures from '@/components/product/ProductFeatures';
import ProductTabs from '@/components/product/ProductTabs';
import PurchaseJourney from '@/components/product/PurchaseJourney';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
          images: product.images.map((image) => ({
            url: productPhotoUrl(image.url),
            alt: image.alt,
          })),
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
      <section className="grid items-start gap-7 md:grid-cols-2 md:gap-8 lg:gap-12">
        <div className="min-w-0 md:col-start-2 md:row-start-1">
          <ProductGallery
            key={product.id}
            id={product.id}
            title={product.title}
            images={product.images}
          />
        </div>
        <Card className="min-w-0 rounded-3xl border-earth/10 bg-card/85 p-5 shadow-[0_12px_35px_-24px_rgba(98,69,47,0.25)] md:col-start-1 md:row-start-1 lg:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              className="text-sm font-semibold text-clay hover:text-primary"
              href={`/category/${product.category.slug}`}
            >
              {product.category.title}
            </Link>
            {product.badge && <Badge>{product.badge}</Badge>}
          </div>
          <h1 className="mt-3 text-2xl leading-relaxed font-extrabold text-earth lg:text-4xl">
            {product.title}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">فرآورده‌های کنجدی سنتی بهجتی اردکان</p>
          <p className="mt-5 text-sm leading-8 text-earth/85">{product.shortDescription}</p>
          <div className="mt-5 border-t border-border/70 pt-5">
            <p className="mb-1 text-xs text-muted-foreground">قیمت محصول</p>
            <p className="text-2xl font-extrabold text-primary lg:text-3xl">
              {formatPrice(product.price)}
            </p>
          </div>
          <ProductPurchase
            key={product.id}
            id={product.id}
            title={product.title}
            weight={product.weight}
          />
          <ProductFeatures />
        </Card>
      </section>
      <PurchaseJourney />
      <ProductTabs key={product.id} product={product} />
      {catalog.items.length > 0 && (
        <section className="mt-9">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-earth">محصولات مرتبط</h2>
            <Button asChild variant="ghost" className="gap-2 px-2 text-xs text-clay">
              <Link href={`/category/${product.category.slug}`}>
                مشاهده همه <ArrowLeft size={16} />
              </Link>
            </Button>
          </div>
          <ProductGrid products={catalog.items} />
        </section>
      )}
    </>
  );
}
