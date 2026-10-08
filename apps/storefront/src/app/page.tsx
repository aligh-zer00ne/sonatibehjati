import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import SearchBar from '@/components/layout/SearchBar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import HomePanels from '@/components/layout/HomePanels';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import ProductSection from '@/components/home/ProductSection';
import BrandStory from '@/components/home/BrandStory';
import ShoppingBanner from '@/components/home/ShoppingBanner';
import BenefitsSection from '@/components/home/BenefitsSection';
import { getHomepageCatalog } from '@/lib/catalog/service';
import { Reveal } from '@/components/ui/reveal';
export default async function Home() {
  const { products, categories } = await getHomepageCatalog();
  const featuredSlugs = [
    'traditional-halva-500',
    'sesame-tahini-350',
    'pistachio-halva-500',
    'chocolate-tahini-350',
  ];
  const featured = [...products]
    .sort((a, b) => {
      const rank = (product: (typeof products)[number]) =>
        product.badge
          ? -1
          : featuredSlugs.includes(product.slug)
            ? featuredSlugs.indexOf(product.slug)
            : featuredSlugs.length;
      return rank(a) - rank(b);
    })
    .slice(0, 4);
  return (
    <>
      <AnnouncementBar />
      <Header />
      <SearchBar />
      <main id="main" className="mx-auto w-full max-w-[1200px] px-4 min-[480px]:px-6 xl:px-0">
        <HeroSection />
        <Reveal>
          <BenefitsSection />
        </Reveal>
        <Reveal>
          <CategorySection categories={categories} />
        </Reveal>
        <Reveal>
          <ProductSection title="پرفروش‌های سنتی بهجتی" id="products" products={featured} carouselOnMobile />
        </Reveal>
        <Reveal>
          <BrandStory />
        </Reveal>
        <Reveal>
          <ProductSection
            title="محصولات کنجدی"
            id="all-products"
            products={products.filter(
              (product) => !featured.some((item) => item.id === product.id),
            )}
          />
        </Reveal>
        <Reveal>
          <ShoppingBanner />
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
