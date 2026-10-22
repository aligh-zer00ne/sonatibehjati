import type { ButtonHTMLAttributes } from 'react';
import { surfaceCardMotion, useSurfaceMotion } from '../hooks/useSurfaceMotion';
import SurfaceGlow from './SurfaceGlow';

export default function MotionButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const motion = useSurfaceMotion<HTMLButtonElement>({ tilt: true });
  return (
    <button
      {...motion}
      {...props}
      className={`${surfaceCardMotion} relative isolate overflow-hidden ${className}`}
    >
      <SurfaceGlow />
      {children}
    </button>
  );
}
