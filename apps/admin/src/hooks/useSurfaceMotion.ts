import { useCallback, useEffect, useRef, type PointerEvent } from 'react';

/** Pointer decoration only: never captures touch or changes a control's click behavior. */
export function useSurfaceMotion<T extends HTMLElement>({ tilt = false, enabled = true } = {}) {
  const ref = useRef<T>(null);
  const frame = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reset = useCallback(() => {
    cancelAnimationFrame(frame.current);
    clearTimeout(timer.current);
    const style = ref.current?.style;
    if (!style) return;
    for (const name of [
      '--surface-rx',
      '--surface-ry',
      '--surface-dx',
      '--surface-dy',
      '--surface-glow',
      '--surface-transform',
    ])
      style.removeProperty(name);
  }, []);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const onVisibility = () => {
      if (document.hidden) reset();
    };
    media.addEventListener('change', reset);
    document.addEventListener('visibilitychange', onVisibility);
    if (!enabled) reset();
    return () => {
      reset();
      media.removeEventListener('change', reset);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, reset]);

  const update = (event: PointerEvent<T>) => {
    if (!enabled || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    const { clientX, clientY, pointerType } = event;
    clearTimeout(timer.current);
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const element = ref.current;
      if (!element?.isConnected) return;
      const bounds = element.getBoundingClientRect();
      const x = Math.max(0, Math.min(bounds.width, clientX - bounds.left));
      const y = Math.max(0, Math.min(bounds.height, clientY - bounds.top));
      const dx = x / Math.max(1, bounds.width) - 0.5;
      const dy = y / Math.max(1, bounds.height) - 0.5;
      const style = element.style;
      style.setProperty('--surface-x', `${x}px`);
      style.setProperty('--surface-y', `${y}px`);
      style.setProperty('--surface-glow', '1');
      style.setProperty('--surface-dx', `${dx * 12}px`);
      style.setProperty('--surface-dy', `${dy * 12}px`);
      // Keep text still on touch; subtle tilt is reserved for a hovering mouse/pen.
      style.setProperty('--surface-rx', `${tilt && pointerType !== 'touch' ? -dy * 3 : 0}deg`);
      style.setProperty('--surface-ry', `${tilt && pointerType !== 'touch' ? dx * 3 : 0}deg`);
      if (tilt && pointerType !== 'touch')
        style.setProperty(
          '--surface-transform',
          'perspective(1000px) rotateX(var(--surface-rx)) rotateY(var(--surface-ry))',
        );
      else style.removeProperty('--surface-transform');
    });
  };
  return {
    ref,
    'data-motion-surface': true,
    onPointerMove: (event: PointerEvent<T>) => {
      if (event.pointerType !== 'touch') update(event);
    },
    onPointerDown: update,
    onPointerLeave: reset,
    onPointerCancel: reset,
    onPointerUp: (event: PointerEvent<T>) => {
      if (event.pointerType === 'touch') timer.current = setTimeout(reset, 280);
    },
  };
}

export const surfaceCardMotion =
  'motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-200 motion-safe:ease-out motion-safe:[transform:var(--surface-transform,none)] motion-reduce:transform-none motion-reduce:transition-none';
