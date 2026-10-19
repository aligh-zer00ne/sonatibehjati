import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import SearchBar from '@/components/layout/SearchBar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import HomePanels from '@/components/layout/HomePanels';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import ProductSection from '@/components/home/ProductSection';
import DiscountSection from '@/components/promotion/DiscountSection';
import BrandStory from '@/components/home/BrandStory';
import { getHomepageCatalog, getHomepageContent } from '@/lib/catalog/service';
import { Reveal } from '@/components/ui/reveal';
import { pageMetadata } from '@/lib/seo';
import { organizationSchema, websiteSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
export const metadata = pageMetadata({ title: 'خرید ارده و حلواارده اردکان', path: '/' });
export default async function Home() {
  const [{ products, categories, promotionalProducts }, content] = await Promise.all([
    getHomepageCatalog(),
    getHomepageContent(),
  ]);
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
      <JsonLd data={[organizationSchema(content.story.description), websiteSchema()]} />
      <AnnouncementBar />
      <Header />
      <SearchBar />
      <main id="main" className="mx-auto w-full max-w-[1200px] px-4 min-[480px]:px-6 xl:px-0">
        <HeroSection slides={content.slides} />
        <Reveal>
          <CategorySection categories={categories} />
        </Reveal>
        <DiscountSection products={promotionalProducts} />
        <Reveal>
          <ProductSection
            title="پرفروش‌های سنتی بهجتی"
            id="products"
            products={featured}
            carouselOnMobile
          />
        </Reveal>
        <Reveal>
          <BrandStory content={content.story} />
        </Reveal>
        <div id="all-products">
          {['tahini', 'halva', 'oil', 'traditional-sweets', 'sesame'].map((slug) => {
            const category = categories.find((item) => item.slug === slug);
            return category ? (
              <Reveal key={category.id}>
                <ProductSection
                  title={category.title}
                  id={`products-${slug}`}
                  href={`/category/${slug}`}
                  horizontal
                  products={products.filter((product) => product.category.slug === slug)}
                />
              </Reveal>
            ) : null;
          })}
        </div>
        {process.env.CATALOG_SOURCE !== 'api' && (
          <p className="pt-3.5 pb-8 text-center text-[11px] text-muted-foreground">
            محصولات و قیمت‌های این نسخه نمونه‌اند؛ فروش آنلاین هنوز فعال نیست.
          </p>
        )}
      </main>
      <Footer />
      <MobileBottomNav />
      <HomePanels products={products} />
    </>
  );
}
