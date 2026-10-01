import type { HomepageCatalogQuery } from '@/generated/graphql';
import ProductCard from './ProductCard';
export default function ProductGrid({ products }: { products: HomepageCatalogQuery['products'] }) {
  if (!products.length)
    return (
      <div className="empty-state">
        <h3>محصولی برای نمایش وجود ندارد</h3>
        <p>به‌زودی محصولات این بخش معرفی می‌شوند.</p>
      </div>
    );
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
