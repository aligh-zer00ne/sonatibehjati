import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '@behjati/shared';
import { formatAdminPrice } from '../lib/money';
/** Animate only real response values; accessible text always exposes the final value. */
export default function AnimatedNumber({
  value,
  amount = false,
}: {
  value: number;
  amount?: boolean;
}) {
  const [shown, setShown] = useState(value);
  const previous = useRef(value);
  const first = useRef(true);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const from = first.current ? 0 : previous.current;
    first.current = false;
    previous.current = value;
    let frame = 0,
      start = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      setShown(value);
    };
    if (media.matches || document.hidden) {
      finish();
      return;
    }
    const step = (time: number) => {
      if (!start) start = time;
      const progress = Math.min(1, (time - start) / 650);
      setShown(Math.round(from + (value - from) * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    media.addEventListener('change', finish);
    document.addEventListener('visibilitychange', finish);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener('change', finish);
      document.removeEventListener('visibilitychange', finish);
    };
  }, [value]);
  const format = amount ? formatAdminPrice : formatNumber;
  return (
    <span aria-label={format(value)} data-counter-value={value}>
      <span aria-hidden="true">{format(shown)}</span>
    </span>
  );
}
