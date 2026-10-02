import type { ReactNode } from 'react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import CommerceHeader from '@/components/layout/CommerceHeader';
import Footer from '@/components/layout/Footer';
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
          className="mx-auto w-full max-w-[1200px] px-4 pt-5 pb-10 min-[480px]:px-6 md:pt-8 xl:px-0"
        >
          {children}
        </main>
      </CommerceNavigation>
      <Footer />
      <MobileBottomNav />
      <HomePanels products={products} />
    </>
  );
}
