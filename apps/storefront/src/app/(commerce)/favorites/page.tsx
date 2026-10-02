import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import FavoritesList from '@/components/product/FavoritesList';
export const metadata: Metadata = {
  title: 'علاقه‌مندی‌ها',
  robots: { index: false, follow: true },
  alternates: { canonical: '/favorites' },
};
export default function FavoritesPage() {
  return (
    <>
      <Breadcrumbs items={[{ title: 'علاقه‌مندی‌ها' }]} />
      <h1 className="mb-6 text-2xl font-extrabold">محصولات مورد علاقهٔ شما</h1>
      <FavoritesList />
    </>
  );
}
