'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate, formatNumber } from '@behjati/shared';
import { ticketInput } from '@behjati/shared/operations';
import {
  MyTicketsDocument,
  CreateTicketDocument,
  AccountOrdersDocument,
} from '@/generated/graphql';
import { useAccountQuery } from '@/hooks/useAccountQuery';
import { authRequest } from '@/lib/auth/client';
import AccountDataState from './AccountDataState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
export const ticketStatusLabels = {
  OPEN: 'منتظر پاسخ',
  IN_PROGRESS: 'در حال پیگیری',
  CLOSED: 'بسته',
};
export default function SupportTickets() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const query = useAccountQuery(MyTicketsDocument, { input: { page, pageSize: 10 } });
  const orders = useAccountQuery(AccountOrdersDocument, { input: { page: 1, pageSize: 50 } }, open);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold">پشتیبانی و تیکت‌ها</h1>
        <Button onClick={() => setOpen(true)}>تیکت جدید</Button>
        <Dialog
          title="تیکت جدید"
          description="موضوع و توضیحات را بنویسید؛ پاسخ پشتیبانی در همین بخش نمایش داده می‌شود."
          open={open}
          onOpenChange={(value) => {
            if (!pending) {
              setOpen(value);
              setError('');
            }
          }}
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (pending) return;
              setError('');
              const form = new FormData(event.currentTarget);
              const parsed = ticketInput.safeParse({
                subject: form.get('subject'),
                body: form.get('body'),
                orderId: form.get('orderId') || null,
              });
              if (!parsed.success) {
                setError('موضوع و توضیحات را کامل کنید.');
                return;
              }
              setPending(true);
              try {
                const result = await authRequest(CreateTicketDocument, { input: parsed.data });
                setOpen(false);
                router.push(`/account/support/${result.createTicket.id}`);
              } catch (e) {
                setError(e instanceof Error ? e.message : 'تیکت ثبت نشد.');
              } finally {
                setPending(false);
              }
            }}
          >
            <label className="flex flex-col gap-2 text-sm">
              موضوع
              <Input name="subject" required minLength={3} maxLength={150} />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              سفارش مرتبط (اختیاری)
              <select
                name="orderId"
                className="h-11 w-full rounded-xl border border-input bg-card px-3"
              >
                <option value="">بدون سفارش</option>
                {orders.data?.myOrders.items.map((order) => (
                  <option key={order.id} value={order.id}>
                    سفارش {formatNumber(order.number)}
                  </option>
                ))}
              </select>
            </label>
            {orders.error && (
              <p role="alert" className="text-sm text-primary">
                سفارش‌ها دریافت نشدند؛ می‌توانید تیکت را بدون سفارش ثبت کنید.
              </p>
            )}
            <label className="flex flex-col gap-2 text-sm">
              توضیحات
              <textarea
                name="body"
                required
                minLength={3}
                maxLength={4000}
                rows={5}
                className="w-full rounded-xl border border-input bg-card p-3 focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-primary">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? 'در حال ثبت…' : 'ثبت تیکت'}
            </Button>
          </form>
        </Dialog>
      </div>
      {!query.data ? (
        <AccountDataState error={query.error} retry={query.refresh} />
      ) : query.data.myTickets.items.length === 0 ? (
        <Card className="rounded-2xl p-6 text-center text-sm text-muted-foreground">
          هنوز تیکتی ثبت نکرده‌اید.
        </Card>
      ) : (
        query.data.myTickets.items.map((ticket) => (
          <Card
            key={ticket.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
          >
            <div>
              <h2 className="font-bold">{ticket.subject}</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                {ticketStatusLabels[ticket.status]} · {formatDate(ticket.updatedAt)}
                {ticket.orderNumber ? ` · سفارش ${formatNumber(ticket.orderNumber)}` : ''}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/account/support/${ticket.id}`}>مشاهده گفتگو</Link>
            </Button>
          </Card>
        ))
      )}
      {query.data && query.data.myTickets.total > 10 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((value) => value - 1)}
          >
            قبلی
          </Button>
          <span className="text-sm">صفحه {formatNumber(page)}</span>
          <Button
            variant="outline"
            disabled={page * 10 >= query.data.myTickets.total}
            onClick={() => setPage((value) => value + 1)}
          >
            بعدی
          </Button>
        </div>
      )}
    </div>
  );
}
