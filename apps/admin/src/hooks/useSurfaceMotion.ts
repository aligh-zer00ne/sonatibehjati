import { useRef } from 'react';

/** Pointer-following effects were removed: surfaces no longer react to the mouse. */
export function useSurfaceMotion<T extends HTMLElement>(
  _options: { tilt?: boolean; enabled?: boolean } = {},
) {
  const ref = useRef<T>(null);
  return { ref, 'data-motion-surface': true };
}

export const surfaceCardMotion = '';
