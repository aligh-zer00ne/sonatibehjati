import type { Metadata } from 'next';
import CatalogPage from '@/components/shop/CatalogPage';
import { param, type CatalogParams } from '@/lib/catalog/params';
export const metadata: Metadata = {
  title: 'جستجوی محصولات',
  robots: { index: false, follow: true },
  alternates: { canonical: '/search' },
};
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<CatalogParams>;
}) {
  const params = await searchParams;
  return (
    <CatalogPage
      path="/search"
      params={params}
      title={
        param(params.q) ? `نتایج جستجو برای «${param(params.q).slice(0, 100)}»` : 'جستجوی محصولات'
      }
    />
  );
}
