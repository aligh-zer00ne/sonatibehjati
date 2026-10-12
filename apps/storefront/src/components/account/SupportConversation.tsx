'use client';
import { useState } from 'react';
import Link from 'next/link';
import { formatDate, formatNumber } from '@behjati/shared';
import { MyTicketDocument, ReplyTicketDocument } from '@/generated/graphql';
import { authRequest } from '@/lib/auth/client';
import { useAccountQuery } from '@/hooks/useAccountQuery';
import AccountDataState from './AccountDataState';
import { ticketStatusLabels } from './SupportTickets';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
export default function SupportConversation({ id }: { id: string }) {
  const query = useAccountQuery(MyTicketDocument, { id });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  if (!query.data) return <AccountDataState error={query.error} retry={query.refresh} />;
  const ticket = query.data.myTicket;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold">{ticket.subject}</h1>
        <Button asChild variant="outline">
          <Link href="/account/support">همه تیکت‌ها</Link>
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p>{ticketStatusLabels[ticket.status]}</p>
        {ticket.orderNumber && <span>سفارش {formatNumber(ticket.orderNumber)}</span>}
        <Button variant="ghost" onClick={query.refresh}>
          تازه‌سازی گفتگو
        </Button>
      </div>
      <Card className="flex flex-col gap-4 rounded-2xl p-4 sm:p-6">
        {ticket.messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-xl p-4 ${message.fromSupport ? 'ml-4 bg-primary/5' : 'mr-4 bg-surface sm:mr-10'}`}
          >
            <p className="mb-2 text-xs text-muted-foreground">
              {message.fromSupport ? 'پشتیبانی سنتی بهجتی' : 'شما'} ·{' '}
              {formatDate(message.createdAt)}
            </p>
            <p className="text-sm leading-7 break-words whitespace-pre-wrap">{message.body}</p>
          </div>
        ))}
      </Card>
      {ticket.status === 'CLOSED' ? (
        <p className="rounded-xl bg-surface p-4 text-sm">
          این گفتگو بسته شده است. برای درخواست تازه، تیکت جدید ثبت کنید.
        </p>
      ) : (
        <Card className="rounded-2xl p-4 sm:p-6">
          <form
            className="flex flex-col gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (pending) return;
              const element = event.currentTarget;
              const body = String(new FormData(element).get('body') ?? '').trim();
              if (!body) return;
              setPending(true);
              setError('');
              try {
                await authRequest(ReplyTicketDocument, { input: { id, body } });
                element.reset();
                query.refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : 'پیام ارسال نشد.');
              } finally {
                setPending(false);
              }
            }}
          >
            <label className="flex flex-col gap-2 text-sm">
              پاسخ شما
              <textarea
                name="body"
                required
                maxLength={4000}
                rows={4}
                className="w-full rounded-xl border border-input bg-card p-3 focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-primary">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending} className="self-start">
              {pending ? 'در حال ارسال…' : 'ارسال پیام'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
