import { formatNumber } from '@behjati/shared';
import { formatAdminPrice } from '../lib/money';
import AdminIcon, { type AdminIconName } from './AdminIcon';
import { surfaceCardMotion, useSurfaceMotion } from '../hooks/useSurfaceMotion';
import SurfaceGlow from './SurfaceGlow';

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
  const motion = useSurfaceMotion<HTMLElement>({ tilt: !!onInspect });
  return (
    <article
      {...motion}
      className={`${surfaceCardMotion} relative min-w-0 overflow-hidden rounded-2xl border ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'} ${onInspect ? 'hover:border-[#c69b48] hover:shadow-[0_10px_24px_#62452f12] focus-within:ring-2 focus-within:ring-[#c69b48]/40' : ''} ${featured ? 'border-[#76100b] bg-[linear-gradient(135deg,#96281b,#580d09)] text-white shadow-[0_8px_24px_#76100b18]' : 'border-[#e8ded1] bg-white text-[#34251e]'}`}
      data-analytics-metric={label}
    >
      <SurfaceGlow />
      <div className={`${compact ? 'mb-2' : 'mb-4'} flex items-center justify-between gap-2`}>
        <h2 className={`text-xs font-semibold ${featured ? 'text-[#f7ddbb]' : 'text-[#76685d]'}`}>
          {label}
        </h2>
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${featured ? 'bg-white/10 text-[#ecc878]' : 'bg-[#f8f0e1] text-[#96140d]'}`}
        >
          <AdminIcon name={icon} width={19} />
        </span>
      </div>
      <p className="break-words text-base font-extrabold tabular-nums sm:text-2xl">
        {amount ? formatAdminPrice(value) : formatNumber(value)}
      </p>
      <p
        className={`${compact ? 'mt-1' : 'mt-3'} text-xs leading-6 ${featured ? 'text-[#eed8c6]' : 'text-[#857467]'}`}
      >
        {detail}
      </p>
      {onInspect && (
        <button
          type="button"
          aria-label={actionLabel ?? `مشاهده ${label}`}
          onClick={onInspect}
          className="absolute inset-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#c69b48]"
        />
      )}
    </article>
  );
}
