'use client';
import { Dialog } from '@/components/ui/dialog';
import { useUI } from '@/stores/ui';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import MobileMenu from './MobileMenu';
import SearchPanel from './SearchPanel';
import CartPanel from './CartPanel';
const titles = {
  menu: 'فهرست بهجتی',
  search: 'جستجو در محصولات',
  cart: 'سبد خرید',
  account: 'حساب کاربری',
};
export default function HomePanels({ products }: { products: HomepageCatalogQuery['products'] }) {
  const panel = useUI((state) => state.panel);
  const setPanel = useUI((state) => state.setPanel);
  return (
    <Dialog
      open={panel !== null}
      onOpenChange={(open) => {
        if (!open) setPanel(null);
      }}
      title={panel ? titles[panel] : ''}
      description={
        panel === 'cart'
          ? 'محصولات انتخاب‌شدهٔ شما'
          : panel === 'search'
            ? 'طعم دلخواهتان را پیدا کنید'
            : 'حلواارده سنتی بهجتی اردکان'
      }
    >
      {panel === 'menu' && <MobileMenu />}
      {panel === 'search' && <SearchPanel products={products} />}
      {panel === 'cart' && <CartPanel products={products} />}
      {panel === 'account' && (
        <div className="empty-state">
          <h3>به بهجتی خوش آمدید</h3>
          <p>
            ورود با شماره موبایل و رمز یکبار مصرف در فاز ۵ فعال می‌شود. برای دیدن محصولات و ساخت سبد
            نیازی به ورود ندارید.
          </p>
        </div>
      )}
    </Dialog>
  );
}
