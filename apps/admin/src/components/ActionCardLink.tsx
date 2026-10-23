import { Link, type LinkProps } from 'react-router-dom';
import { cardInteraction } from '../lib/card-interaction';
import { surfaceCardMotion, useSurfaceMotion } from '../hooks/useSurfaceMotion';
import SurfaceGlow from './SurfaceGlow';

export default function ActionCardLink({ children, className = '', ...props }: LinkProps) {
  const motion = useSurfaceMotion<HTMLAnchorElement>({ tilt: false });
  return (
    <Link
      {...props}
      {...motion}
      data-interactive-card
      className={`${surfaceCardMotion} ${cardInteraction} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c69b48]/50 focus-visible:ring-offset-2 ${className}`}
    >
      <SurfaceGlow />
      {children}
    </Link>
  );
}
