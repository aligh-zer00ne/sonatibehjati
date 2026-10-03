import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
export default function AccountDataState({ error, retry }: { error?: string; retry: () => void }) {
  if (error)
    return (
      <div className="rounded-3xl border border-border p-6 text-center">
        <p role="alert" className="mb-4 text-primary">
          {error}
        </p>
        <Button onClick={retry}>تلاش دوباره</Button>
      </div>
    );
  return (
    <div className="space-y-4" aria-label="در حال دریافت اطلاعات">
      <Skeleton className="h-36 rounded-3xl" />
      <Skeleton className="h-36 rounded-3xl" />
    </div>
  );
}
