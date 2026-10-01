import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 min-[480px]:px-6 xl:px-0 px-[18px] py-9 text-center">
      <h1 className="mb-2.5 text-2xl font-bold">صفحه پیدا نشد</h1>
      <p className="mb-4 text-[13px] text-muted-foreground">این مسیر هنوز در دسترس نیست.</p>
      <Button asChild>
        <Link href="/">بازگشت به خانه</Link>
      </Button>
    </main>
  );
}
