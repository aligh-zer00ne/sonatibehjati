'use client';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 min-[480px]:px-6 xl:px-0 px-[18px] py-9 text-center">
      <h1 className="mb-2.5 text-2xl font-bold">دریافت اطلاعات انجام نشد</h1>
      <p className="mb-4 text-[13px] text-muted-foreground">
        لطفاً اتصال را بررسی کنید و دوباره تلاش کنید.
      </p>
      <Button onClick={reset}>تلاش دوباره</Button>
    </main>
  );
}
