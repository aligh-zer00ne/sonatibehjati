import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CatalogPage from '@/components/shop/CatalogPage';
import { getHomepageCatalog } from '@/lib/catalog/service';
import type { CatalogParams } from '@/lib/catalog/params';
import { categoryPath } from '@/lib/seo';
import { listingMetadata } from '@/lib/seo-catalog';
async function category(slug: string) {
  return (await getHomepageCatalog()).categories.find((item) => item.slug === slug);
}
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await category(slug);
  if (!item) notFound();
  return listingMetadata(categoryPath(slug), item.title, await searchParams, slug);
}
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogParams>;
}) {
  const { slug } = await params;
  const item = await category(slug);
  if (!item) notFound();
  return (
    <CatalogPage
      path={`/category/${slug}`}
      params={await searchParams}
      category={slug}
      title={item.title}
    />
  );
}
