'use client';

import Link from 'next/link';
import { MessagesSquare, Package, Phone } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SupportTickets from './SupportTickets';

export default function SupportEntry() {
  const { user, loading, error, refresh } = useAuth();
  if (loading) return <Skeleton className="h-72 rounded-3xl" aria-label="در حال دریافت پشتیبانی" />;
  if (user) return <SupportTickets />;
  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <Card className="rounded-3xl bg-surface/90 p-5 sm:p-8">
        <MessagesSquare className="mb-4 size-9 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-extrabold">پشتیبانی سنتی بهجتی</h1>
        <p className="mt-3 leading-8 text-muted-foreground">
          برای پرسش دربارهٔ محصولات یا پیگیری سفارش، تیکت ثبت کنید. پیام‌ها و پاسخ‌های پشتیبانی در
          حساب شما نگهداری می‌شوند و می‌توانید گفت‌وگو را از همین بخش ادامه دهید.
        </p>
        <Button asChild className="mt-5">
          <Link href="/login?next=%2Fsupport">ورود و ثبت تیکت</Link>
        </Button>
        {error && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p role="alert" className="text-primary">
              {error}
            </p>
            <Button variant="outline" onClick={() => void refresh()}>
              تلاش دوباره
            </Button>
          </div>
        )}
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl p-5">
          <Package className="mb-3 text-primary" aria-hidden="true" />
          <h2 className="font-bold">پیگیری سفارش</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            هنگام ثبت تیکت، سفارش مرتبط را انتخاب کنید تا اطلاعات آن همراه پیام شما باشد.
          </p>
        </Card>
        <Card className="rounded-2xl p-5">
          <Phone className="mb-3 text-primary" aria-hidden="true" />
          <h2 className="font-bold">تماس با سنتی بهجتی</h2>
          <a
            href="tel:+989131564876"
            className="mt-3 inline-flex min-h-11 items-center text-base font-bold text-primary"
            dir="ltr"
          >
            ۰۹۱۳ ۱۵۶ ۴۸۷۶
          </a>
        </Card>
      </div>
    </section>
  );
}
