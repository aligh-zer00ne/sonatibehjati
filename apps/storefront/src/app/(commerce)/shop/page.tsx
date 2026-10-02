import type { Metadata } from 'next';
import CatalogPage from '@/components/shop/CatalogPage';
import type { CatalogParams } from '@/lib/catalog/params';
export const metadata: Metadata = {
  title: 'فروشگاه',
  description: 'مشاهده و مقایسهٔ ارده، حلواارده و روغن ارده سنتی بهجتی.',
  alternates: { canonical: '/shop' },
};
export default async function ShopPage({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  return <CatalogPage path="/shop" params={await searchParams} />;
}
