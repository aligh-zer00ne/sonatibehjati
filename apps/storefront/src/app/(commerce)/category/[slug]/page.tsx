import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CatalogPage from '@/components/shop/CatalogPage';
import { getHomepageCatalog } from '@/lib/catalog/service';
import type { CatalogParams } from '@/lib/catalog/params';
async function category(slug: string) {
  return (await getHomepageCatalog()).categories.find((item) => item.slug === slug);
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await category(slug);
  return {
    title: item?.title ?? 'دسته‌بندی پیدا نشد',
    alternates: { canonical: `/category/${encodeURIComponent(slug)}` },
  };
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
