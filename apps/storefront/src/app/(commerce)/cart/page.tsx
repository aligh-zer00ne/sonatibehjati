import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import GuestCart from '@/components/cart/GuestCart';
export const metadata: Metadata = {
  title: 'سبد خرید',
  robots: { index: false, follow: true },
  alternates: { canonical: '/cart' },
};
export default function CartPage() {
  return (
    <>
      <Breadcrumbs items={[{ title: 'سبد خرید' }]} />
      <h1 className="mb-6 text-2xl font-extrabold">سبد خرید شما</h1>
      <GuestCart />
    </>
  );
}
