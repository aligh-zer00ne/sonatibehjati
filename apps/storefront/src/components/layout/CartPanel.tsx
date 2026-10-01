'use client';
import Image from 'next/image';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCart, getSubtotal } from '@/stores/cart';
import { formatPrice } from '@behjati/shared';
import type { HomepageCatalogQuery } from '@/generated/graphql';
import QuantityControl from '@/components/product/QuantityControl';
export default function CartPanel({ products }: { products: HomepageCatalogQuery['products'] }) {
  const items = useCart((state) => state.items);
  const remove = useCart((state) => state.remove);
  const selected = products.filter((product) => items[product.id]);
  if (!selected.length)
    return (
      <div className="empty-state">
        <ShoppingCart size={40} />
        <h3>سبد خرید شما خالی است</h3>
        <p>طعم دلخواهتان را از محصولات انتخاب کنید.</p>
      </div>
    );
  return (
    <div>
      <div className="cart-lines">
        {selected.map((product) => (
          <div className="cart-line" key={product.id}>
            <Image src={product.images[0]!.url} alt={product.title} width={72} height={72} />
            <div>
              <h3>{product.title}</h3>
              <small>{product.weight}</small>
              <strong>{formatPrice(product.price)}</strong>
              <QuantityControl id={product.id} title={product.title} />
            </div>
            <button
              className="icon-button"
              aria-label={`حذف ${product.title}`}
              onClick={() => remove(product.id)}
            >
              <Trash2 size={19} />
            </button>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <span>جمع محصولات</span>
        <strong>{formatPrice(getSubtotal(items, products))}</strong>
      </div>
      <p className="development-note">
        سبد نمونه در مرورگر شما ذخیره می‌شود. ثبت سفارش و محاسبهٔ هزینهٔ ارسال در فازهای بعد فعال
        خواهد شد.
      </p>
    </div>
  );
}
