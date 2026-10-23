import AmbientBackdrop from '../components/AmbientBackdrop';
import { Navigate, useParams } from 'react-router-dom';
import { adminLanding } from '@behjati/shared/permissions';
import { formatNumber } from '@behjati/shared';
import { useAdmin } from '../auth/AdminProvider';
import { availableNavigation, AdminNavigationCards } from '../components/AdminNavigation';
import AdminIcon from '../components/AdminIcon';

export default function AdminSection() {
  const { section } = useParams();
  const { admin } = useAdmin();
  const group = availableNavigation(admin).groups.find((item) => item.id === section);
  if (!group) return <Navigate to={admin ? adminLanding(admin) : '/login'} replace />;
  const count = group.items.reduce((sum, item) => sum + (item.href === '/admin/orders' ? 2 : 1), 0);
  return (
    <div
      data-admin-section={group.id}
      className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 motion-safe:animate-surface-enter"
    >
      <header className="relative isolate overflow-hidden flex min-h-[180px] flex-wrap items-center justify-between gap-5 rounded-[26px] border border-[#9c5358]/40 bg-[radial-gradient(ellipse_at_top_right,#7b3039,transparent_65%),linear-gradient(125deg,#5c1924,#290c12)] p-6 text-[#fff5e1] shadow-[0_12px_30px_-14px_#4e141c60] sm:p-8">
        <AmbientBackdrop />
        <div className="relative z-10">
          <p className="mb-2 text-sm text-[#edc57d]">فضای مدیریت سنتی بهجتی</p>
          <h1 className="text-[26px] leading-normal font-extrabold sm:text-[30px]">
            {group.label}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#f2d6a2]">
            برای شروع، بخش موردنظر را از کارت‌های زیر انتخاب کنید.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-[#edc57d]/25 bg-white/10 px-4 py-3">
          <AdminIcon name={group.icon} width={28} height={28} className="text-[#edc57d]" />
          <span className="text-sm font-semibold">{formatNumber(count)} بخش در دسترس</span>
        </div>
      </header>
      <AdminNavigationCards group={group} onNavigate={() => {}} />
    </div>
  );
}
