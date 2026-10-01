'use client';
import Image from 'next/image';
import { useUI } from '@/stores/ui';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import SectionHeading from './SectionHeading';
export default function CategorySection({
  categories,
}: {
  categories: HomepageCatalogQuery['categories'];
}) {
  const open = useUI((state) => state.setPanel);
  const setQuery = useUI((state) => state.setSearchQuery);
  return (
    <section id="categories" className="home-section">
      <SectionHeading title="دسته‌بندی محصولات" href="#products" />
      <div className="category-grid">
        {categories.map((category) => (
          <button
            key={category.id}
            aria-label={category.title}
            onClick={() => {
              setQuery(category.title);
              open('search');
            }}
            className="category-card"
          >
            <div>
              <Image src={category.image} alt={category.title} width={140} height={140} />
            </div>
            <h3>{category.title}</h3>
          </button>
        ))}
      </div>
    </section>
  );
}
