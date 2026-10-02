'use client';
import { Dialog } from '@/components/ui/dialog';
import { useUI } from '@/stores/ui';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import MobileMenu from './MobileMenu';
import SearchPanel from './SearchPanel';
import CartPanel from './CartPanel';
import { useEffect, useState } from 'react';
const titles = {
  menu: 'فهرست سنتی بهجتی',
  search: 'جستجو در محصولات',
  cart: 'سبد خرید',
};
export default function HomePanels({ products }: { products: HomepageCatalogQuery['products'] }) {
  const panel = useUI((state) => state.panel);
  const setPanel = useUI((state) => state.setPanel);
  const [lastPanel, setLastPanel] = useState(panel);
  useEffect(() => {
    if (panel) setLastPanel(panel);
  }, [panel]);
  // Preserve content while Radix runs its exit animation.
  const activePanel = panel ?? lastPanel;
  return (
    <Dialog
      open={panel !== null}
      onOpenChange={(open) => {
        if (!open) setPanel(null);
      }}
      title={activePanel ? titles[activePanel] : ''}
      description={
        activePanel === 'cart'
          ? 'محصولات انتخاب‌شدهٔ شما'
          : activePanel === 'search'
            ? 'طعم دلخواهتان را پیدا کنید'
            : 'حلواارده سنتی بهجتی اردکان'
      }
    >
      {activePanel === 'menu' && <MobileMenu />}
      {activePanel === 'search' && <SearchPanel products={products} />}
      {activePanel === 'cart' && <CartPanel />}
    </Dialog>
  );
}
