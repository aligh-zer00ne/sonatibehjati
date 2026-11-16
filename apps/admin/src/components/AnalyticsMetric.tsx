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
      className={`${surfaceCardMotion} ${onInspect && !featured ? cardInteraction : 'group relative'} min-w-0 overflow-hidden rounded-2xl border ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'} ${onInspect ? 'focus-within:ring-2 focus-within:ring-[#5c959e]/40' : ''} ${featured ? 'border-[#1e3a5f] bg-[linear-gradient(135deg,#304a6b,#101c2c)] text-white shadow-[0_8px_24px_#1e3a5f18]' : 'border-[#d7dce2] bg-white text-[#202832]'}`}
      data-analytics-metric={label}
    >
      <SurfaceGlow />
      <div className="relative z-10 flex items-center gap-3">
        <span
          data-card-icon
          className={`${onInspect ? cardIconInteraction : ''} grid size-12 shrink-0 place-items-center rounded-2xl ${featured ? 'bg-white/10 text-[#87c0c9]' : 'border border-[#9dc5cc] bg-[linear-gradient(135deg,#d5dde8,#92c0c7)] text-[#2c5282]'}`}
        >
          <AdminIcon name={icon} width={26} />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            className={`text-sm leading-6 font-bold ${featured ? 'text-[#bcdde2]' : 'text-[#444f5e]'}`}
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
        className={`relative z-10 ${compact ? 'mt-2' : 'mt-3'} text-[13px] leading-6 ${featured ? 'text-[#c3d9dd]' : 'text-[#576372]'}`}
      >
        {detail}
      </p>
      {onInspect && (
        <button
          type="button"
          aria-label={actionLabel ?? `مشاهده ${label}`}
          onClick={onInspect}
          className="absolute inset-0 z-20 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#5c959e]"
        />
      )}
    </article>
  );
}
