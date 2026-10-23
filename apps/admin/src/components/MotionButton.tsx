import type { ButtonHTMLAttributes } from 'react';
import { surfaceCardMotion, useSurfaceMotion } from '../hooks/useSurfaceMotion';
import SurfaceGlow from './SurfaceGlow';
import { cardInteraction } from '../lib/card-interaction';

export default function MotionButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const motion = useSurfaceMotion<HTMLButtonElement>({ tilt: false });
  return (
    <button
      {...motion}
      {...props}
      data-interactive-card
      className={`${surfaceCardMotion} ${cardInteraction} overflow-hidden ${className}`}
    >
      <SurfaceGlow />
      {children}
    </button>
  );
}
