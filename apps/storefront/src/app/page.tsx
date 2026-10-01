import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import SearchBar from '@/components/layout/SearchBar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import HomePanels from '@/components/layout/HomePanels';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import ProductSection from '@/components/home/ProductSection';
import HeritageSection from '@/components/home/HeritageSection';
import BrandStory from '@/components/home/BrandStory';
import BenefitsSection from '@/components/home/BenefitsSection';
import { getHomepageCatalog } from '@/lib/catalog/service';
import { Reveal } from '@/components/ui/reveal';
export default async function Home() {
  const { products, categories } = await getHomepageCatalog();
  return (
    <>
      <AnnouncementBar />
      <Header />
      <SearchBar />
      <main id="main" className="mx-auto w-full max-w-[1200px] px-4 min-[480px]:px-6 xl:px-0">
        <HeroSection />
        <Reveal>
          <CategorySection categories={categories} />
        </Reveal>
        <Reveal>
          <ProductSection
            title="پرفروش‌های سنتی بهجتی"
            id="products"
            products={products.slice(0, 4)}
          />
        </Reveal>
        <Reveal>
          <HeritageSection />
        </Reveal>
        <Reveal>
          <ProductSection title="محصولات کنجدی" id="all-products" products={products.slice(2)} />
        </Reveal>
        <Reveal>
          <BrandStory />
        </Reveal>
        <Reveal>
          <BenefitsSection />
        </Reveal>
        <p className="pt-3.5 pb-8 text-center text-[11px] text-muted-foreground">
          محصولات و قیمت‌های این نسخه نمونه‌اند؛ فروش آنلاین هنوز فعال نیست.
        </p>
      </main>
      <Footer />
      <MobileBottomNav />
      <HomePanels products={products} />
    </>
  );
}
