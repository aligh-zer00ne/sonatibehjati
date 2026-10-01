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
export default async function Home() {
  const { products, categories } = await getHomepageCatalog();
  return (
    <>
      <AnnouncementBar />
      <Header />
      <SearchBar />
      <main id="main" className="container">
        <HeroSection />
        <CategorySection categories={categories} />
        <ProductSection title="پرفروش‌های بهجتی" id="products" products={products.slice(0, 4)} />
        <HeritageSection />
        <ProductSection title="محصولات کنجدی" id="all-products" products={products.slice(2)} />
        <BrandStory />
        <BenefitsSection />
        <p className="catalog-note">
          محصولات و قیمت‌های این نسخه نمونه‌اند؛ فروش آنلاین هنوز فعال نیست.
        </p>
      </main>
      <Footer />
      <MobileBottomNav />
      <HomePanels products={products} />
    </>
  );
}
