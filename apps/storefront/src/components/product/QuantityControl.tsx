'use client';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/stores/cart';
import { formatNumber } from '@behjati/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
export default function QuantityControl({
  id,
  title,
  className,
}: {
  id: string;
  title: string;
  className?: string;
}) {
  const quantity = useCart((state) => state.items[id] ?? 0);
  const increment = useCart((state) => state.increment);
  const decrement = useCart((state) => state.decrement);
  return (
    <div
      className={cn(
        'flex min-h-11 items-center justify-between overflow-hidden rounded-3xl bg-primary text-white',
        className,
      )}
    >
      <Button
        size="icon"
        variant="ghost"
        className="rounded-none text-white hover:bg-brand-red-dark"
        aria-label={`افزایش تعداد ${title}`}
        disabled={quantity >= 99}
        onClick={() => increment(id)}
      >
        <Plus size={17} />
      </Button>
      <output
        key={quantity}
        className="animate-in fade-in slide-in-from-bottom-2 text-sm duration-250 motion-reduce:animate-none"
        aria-label="تعداد"
        aria-live="polite"
      >
        {formatNumber(quantity)}
      </output>
      <Button
        size="icon"
        variant="ghost"
        className="rounded-none text-white hover:bg-brand-red-dark"
        aria-label={`کاهش تعداد ${title}`}
        onClick={() => decrement(id)}
      >
        <Minus size={17} />
      </Button>
    </div>
  );
}
