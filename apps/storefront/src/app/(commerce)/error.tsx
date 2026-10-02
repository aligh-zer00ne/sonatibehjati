'use client';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
export default function CommerceError({ reset }: { reset: () => void }) {
  return (
    <EmptyState
      title="دریافت اطلاعات انجام نشد"
      description="اتصال را بررسی کنید و دوباره تلاش کنید."
    >
      <Button className="mt-5" onClick={reset}>
        تلاش دوباره
      </Button>
    </EmptyState>
  );
}
