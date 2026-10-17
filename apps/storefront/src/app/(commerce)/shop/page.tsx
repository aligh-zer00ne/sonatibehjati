import type { Metadata } from 'next';
import CatalogPage from '@/components/shop/CatalogPage';
import type { CatalogParams } from '@/lib/catalog/params';
import { listingMetadata } from '@/lib/seo-catalog';
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogParams>;
}): Promise<Metadata> {
  return listingMetadata('/shop', 'فروشگاه محصولات کنجدی و سنتی', await searchParams);
}
export default async function ShopPage({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  return <CatalogPage path="/shop" params={await searchParams} />;
}
