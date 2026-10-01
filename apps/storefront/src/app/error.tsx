'use client';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container empty-state">
      <h1>دریافت اطلاعات انجام نشد</h1>
      <p>لطفاً اتصال را بررسی کنید و دوباره تلاش کنید.</p>
      <Button onClick={reset}>تلاش دوباره</Button>
    </main>
  );
}
