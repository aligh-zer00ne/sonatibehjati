import { Button } from 'antd';
import AdminIcon from './AdminIcon';
export default function AnalyticsRefresh({
  refreshing,
  updatedAt,
  error,
  refresh,
}: {
  refreshing: boolean;
  updatedAt: number | null;
  error: string;
  refresh: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs" aria-live="polite">
      <span className={`flex items-center gap-2 ${error ? 'text-red-700' : 'text-[#76685d]'}`}>
        <span
          className={`size-2 rounded-full ${error ? 'bg-red-600' : refreshing ? 'bg-[#d6a447]' : 'bg-emerald-600'}`}
        />
        {error
          ? 'به‌روزرسانی انجام نشد؛ آخرین اطلاعات نمایش داده می‌شود.'
          : refreshing
            ? 'در حال دریافت اطلاعات…'
            : updatedAt
              ? `آخرین دریافت ${new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Tehran' }).format(updatedAt)}`
              : 'در انتظار دریافت اطلاعات'}
      </span>
      <Button
        size="small"
        icon={<AdminIcon name="refresh" width={15} />}
        disabled={refreshing}
        onClick={refresh}
      >
        به‌روزرسانی
      </Button>
      <span className="text-[#857467]">خودکار، هر ۳۰ ثانیه</span>
    </div>
  );
}
