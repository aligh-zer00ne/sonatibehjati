import type { ReactNode } from 'react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import CommerceHeader from '@/components/layout/CommerceHeader';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import HomePanels from '@/components/layout/HomePanels';
import CommerceNavigation from '@/components/shop/CommerceNavigation';
import { getHomepageCatalog } from '@/lib/catalog/service';
export default async function CommerceLayout({ children }: { children: ReactNode }) {
  const { products } = await getHomepageCatalog();
  return (
    <>
      <AnnouncementBar />
      <div className="hidden md:block">
        <Header />
      </div>
      <CommerceHeader />
      <CommerceNavigation>
        <main
          id="main"
          className="mx-auto w-full max-w-[1200px] px-4 pt-5 pb-[calc(80px+env(safe-area-inset-bottom))] min-[480px]:px-6 md:pt-8 md:pb-10 xl:px-0"
        >
          {children}
        </main>
      </CommerceNavigation>
      <MobileBottomNav />
      <HomePanels products={products} />
    </>
  );
}
