'use client';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/stores/cart';
import { formatNumber } from '@behjati/shared';
export default function QuantityControl({ id, title }: { id: string; title: string }) {
  const quantity = useCart((state) => state.items[id] ?? 0);
  const increment = useCart((state) => state.increment);
  const decrement = useCart((state) => state.decrement);
  return (
    <div className="quantity-control">
      <button
        aria-label={`افزایش تعداد ${title}`}
        disabled={quantity >= 99}
        onClick={() => increment(id)}
      >
        <Plus size={17} />
      </button>
      <output aria-label="تعداد" aria-live="polite">
        {formatNumber(quantity)}
      </output>
      <button aria-label={`کاهش تعداد ${title}`} onClick={() => decrement(id)}>
        <Minus size={17} />
      </button>
    </div>
  );
}
