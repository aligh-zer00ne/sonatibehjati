'use client';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/stores/cart';
import { MAX_CART_LINES } from '@behjati/shared';
export default function FavoriteButton({
  id,
  title,
  className,
}: {
  id: string;
  title: string;
  className?: string;
}) {
  const favorite = useCart((state) => state.favorites.includes(id));
  const toggle = useCart((state) => state.toggleFavorite);
  const full = useCart((state) => state.favorites.length >= MAX_CART_LINES);
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'rounded-full bg-[#f4ecdf] text-[#615649]',
        favorite && 'text-primary',
        className,
      )}
      aria-label={`${favorite ? 'حذف از' : 'افزودن به'} علاقه‌مندی‌ها: ${title}`}
      aria-pressed={favorite}
      disabled={full && !favorite}
      title={full && !favorite ? 'فهرست علاقه‌مندی‌ها به حداکثر تعداد رسیده است' : undefined}
      onClick={() => toggle(id)}
    >
      <Heart
        key={String(favorite)}
        className={
          favorite ? 'animate-in zoom-in-50 duration-300 motion-reduce:animate-none' : undefined
        }
        size={19}
        fill={favorite ? 'currentColor' : 'none'}
      />
    </Button>
  );
}
