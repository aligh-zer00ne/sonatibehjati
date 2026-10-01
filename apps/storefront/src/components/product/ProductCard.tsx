'use client';
import Image from 'next/image';
import { Heart, Plus } from 'lucide-react';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import { formatPrice } from '@behjati/shared';
import { useCart } from '@/stores/cart';
import ProductBadge from './ProductBadge';
import QuantityControl from './QuantityControl';
export default function ProductCard({
  product,
}: {
  product: HomepageCatalogQuery['products'][number];
}) {
  const quantity = useCart((state) => state.items[product.id] ?? 0);
  const favorite = useCart((state) => state.favorites.includes(product.id));
  const add = useCart((state) => state.add);
  const toggle = useCart((state) => state.toggleFavorite);
  return (
    <article className="product-card" data-product-slug={product.slug}>
      <div className="product-image">
        <Image
          src={product.images[0]?.url ?? '/images/tahini.webp'}
          alt={product.images[0]?.alt ?? product.title}
          fill
          sizes="(max-width: 480px) 45vw, (max-width: 1023px) 30vw, 270px"
        />
        {product.badge && <ProductBadge label={product.badge} />}
        <button
          className={`wishlist ${favorite ? 'selected' : ''}`}
          aria-label={`${favorite ? 'حذف از' : 'افزودن به'} علاقه‌مندی‌ها: ${product.title}`}
          aria-pressed={favorite}
          onClick={() => toggle(product.id)}
        >
          <Heart size={19} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="product-info">
        <h3>{product.title}</h3>
        <p className="product-weight">{product.weight}</p>
        <p className="product-price">{formatPrice(product.price)}</p>
        {quantity ? (
          <QuantityControl id={product.id} title={product.title} />
        ) : (
          <button
            className="add-button"
            onClick={() => add(product.id)}
            aria-label={`افزودن ${product.title} به سبد خرید`}
          >
            <Plus size={15} /> افزودن
          </button>
        )}
      </div>
    </article>
  );
}
