import AmbientBackdrop from './AmbientBackdrop';
import AnimatedNumber from './AnimatedNumber';
import AdminIcon, { type AdminIconName } from './AdminIcon';
import { surfaceCardMotion, useSurfaceMotion } from '../hooks/useSurfaceMotion';
import SurfaceGlow from './SurfaceGlow';
import { cardInteraction, cardIconInteraction } from '../lib/card-interaction';

export default function AnalyticsMetric({
  label,
  value,
  detail,
  icon,
  amount = false,
  featured = false,
  compact = false,
  onInspect,
  actionLabel,
}: {
  label: string;
  value: number;
  detail: string;
  icon: AdminIconName;
  amount?: boolean;
  featured?: boolean;
  compact?: boolean;
  onInspect?: () => void;
  actionLabel?: string;
}) {
  const motion = useSurfaceMotion<HTMLElement>({ tilt: false });
  return (
    <article
      {...motion}
      data-interactive-card={onInspect && !featured ? true : undefined}
      className={`${surfaceCardMotion} ${onInspect && !featured ? cardInteraction : 'group relative'} min-w-0 overflow-hidden rounded-2xl border ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'} ${onInspect ? 'focus-within:ring-2 focus-within:ring-[#c69b48]/40' : ''} ${featured ? 'border-[#4e141c] bg-[linear-gradient(135deg,#752632,#300c14)] text-white shadow-[0_8px_24px_#4e141c18]' : 'border-[#e8ded1] bg-white text-[#34251e]'}`}
      data-analytics-metric={label}
    >
      {featured && <AmbientBackdrop />}
      <SurfaceGlow />
      <div className="relative z-10 flex items-center gap-3">
        <span
          data-card-icon
          className={`${onInspect ? cardIconInteraction : ''} grid size-12 shrink-0 place-items-center rounded-2xl ${featured ? 'bg-white/10 text-[#ecc878]' : 'border border-[#e7ce96] bg-[linear-gradient(135deg,#f6e8c7,#e5c988)] text-[#701e2a]'}`}
        >
          <AdminIcon name={icon} width={26} />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            className={`text-sm leading-6 font-bold ${featured ? 'text-[#f7ddbb]' : 'text-[#624d40]'}`}
          >
            {label}
          </h2>
          <p
            className={`mt-0.5 break-words font-extrabold leading-9 tabular-nums ${amount ? 'text-xl sm:text-[23px]' : 'text-[28px]'}`}
          >
            <AnimatedNumber value={value} amount={amount} />
          </p>
        </div>
      </div>
      <p
        className={`relative z-10 ${compact ? 'mt-2' : 'mt-3'} text-[13px] leading-6 ${featured ? 'text-[#eed8c6]' : 'text-[#766253]'}`}
      >
        {detail}
      </p>
      {onInspect && (
        <button
          type="button"
          aria-label={actionLabel ?? `مشاهده ${label}`}
          onClick={onInspect}
          className="absolute inset-0 z-20 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#c69b48]"
        />
      )}
    </article>
  );
}
