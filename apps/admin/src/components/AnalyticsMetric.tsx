import { formatNumber } from '@behjati/shared';
import { formatAdminPrice } from '../lib/money';
import AdminIcon, { type AdminIconName } from './AdminIcon';

export default function AnalyticsMetric({
  label,
  value,
  detail,
  icon,
  amount = false,
  featured = false,
}: {
  label: string;
  value: number;
  detail: string;
  icon: AdminIconName;
  amount?: boolean;
  featured?: boolean;
}) {
  return (
    <article
      className={`relative min-w-0 overflow-hidden rounded-2xl border p-4 sm:p-5 ${featured ? 'border-[#76100b] bg-[#76100b] text-white shadow-[0_8px_24px_#76100b18]' : 'border-[#e8ded1] bg-white text-[#34251e]'}`}
      data-analytics-metric={label}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
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
      <p className={`mt-3 text-xs leading-6 ${featured ? 'text-[#eed8c6]' : 'text-[#857467]'}`}>
        {detail}
      </p>
    </article>
  );
}
