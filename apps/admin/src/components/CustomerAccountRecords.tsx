import { Empty, Pagination, Button } from 'antd';
import { formatNumber } from '@behjati/shared';
import { offlinePaymentMethodLabels } from '@behjati/shared/sales';
import type { CustomerAccountFieldsFragment } from '../generated/graphql';
import { formatDateTime } from '../lib/format';
import { Money } from './Money';
import AccountStatus from './AccountStatus';
import AdminIcon from './AdminIcon';

type PageProps = { page: number; total: number; onPage: (page: number) => void };
function Pages({ page, total, onPage }: PageProps) {
  return total > 20 ? (
    <Pagination
      current={page}
      total={total}
      pageSize={20}
      onChange={onPage}
      showSizeChanger={false}
      className="!flex !flex-wrap !justify-center !gap-y-2"
    />
  ) : null;
}
export function AccountInvoices({
  items,
  onExpand,
  page,
  total,
  onPage,
}: PageProps & {
  items: CustomerAccountFieldsFragment['invoices'];
  onExpand: (id: string) => void;
}) {
  return (
    <div aria-label="فاکتورهای دستی مشتری" className="space-y-4">
      {!items.length ? (
        <Empty description="فاکتور دستی برای این مشتری ثبت نشده است." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((invoice) => (
            <article
              key={invoice.id}
              data-account-invoice
              className="relative overflow-hidden rounded-[22px] border border-[#e8ded1] bg-white p-4 shadow-[0_4px_16px_#62452f08]"
            >
              <div className="absolute inset-x-4 top-0 h-[3px] rounded-full bg-gradient-to-l from-[#96140d] to-[#dfb65c]" />
              <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-extrabold">
                  <AdminIcon name="receipt" className="text-[#96140d]" />
                  فاکتور {formatNumber(invoice.number)}
                </h3>
                <AccountStatus balance={invoice.total - invoice.offlinePaidAmount} amount={false} />
              </header>
              <dl className="grid gap-3 rounded-2xl bg-[#faf6ee] p-3">
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-sm text-[#796653]">مبلغ فاکتور</dt>
                  <dd className="text-base font-extrabold text-[#76100b]">
                    <Money compact amount={invoice.total} />
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-sm text-[#796653]">تسویه‌شده</dt>
                  <dd className="font-bold">
                    <Money compact amount={invoice.offlinePaidAmount} />
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 border-t border-[#e8ded1] pt-3">
                  <dt className="text-sm text-[#796653]">مانده فاکتور</dt>
                  <dd className="font-extrabold">
                    <Money compact amount={invoice.total - invoice.offlinePaidAmount} />
                  </dd>
                </div>
              </dl>
              <Button
                className="!mt-4 !h-auto !min-h-11 !w-full !whitespace-normal !rounded-xl !font-semibold"
                icon={<AdminIcon name="print" width={18} />}
                onClick={() => onExpand(invoice.id)}
              >
                محصولات و چاپ فاکتور / لیبل
              </Button>
            </article>
          ))}
        </div>
      )}
      <Pages page={page} total={total} onPage={onPage} />
    </div>
  );
}
export function AccountLedger({
  items,
  page,
  total,
  onPage,
}: PageProps & { items: CustomerAccountFieldsFragment['entries'] }) {
  return (
    <div aria-label="گردش حساب مشتری" className="space-y-3">
      {!items.length ? (
        <div className="rounded-[22px] border border-dashed border-[#dccbab] bg-[#faf6ee] py-10">
          <Empty description="هنوز دریافت یا پرداختی برای این مشتری ثبت نشده است." />
        </div>
      ) : (
        items.map((entry) => (
          <article
            key={entry.id}
            data-account-entry={entry.id}
            className="rounded-[22px] border border-[#e8ded1] bg-white p-4 shadow-[0_3px_12px_#62452f06] sm:p-5"
          >
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-2xl ${entry.direction === 'RECEIPT' ? 'bg-[#f2e5cd] text-[#926720]' : 'bg-[#fbece7] text-[#96140d]'}`}
                >
                  <AdminIcon
                    name={entry.direction === 'RECEIPT' ? 'wallet' : 'logout'}
                    width={22}
                  />
                </span>
                <div>
                  <h3 className="text-base font-extrabold">
                    {entry.direction === 'RECEIPT' ? 'دریافت از مشتری' : 'پرداخت به مشتری'}
                  </h3>
                  <p className="mt-1 text-xs text-[#857467]">{formatDateTime(entry.createdAt)}</p>
                </div>
              </div>
              <p
                className={`text-lg font-extrabold ${entry.direction === 'RECEIPT' ? 'text-[#926720]' : 'text-[#96140d]'}`}
              >
                <Money compact amount={entry.amount} />
              </p>
            </header>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-lg border border-[#e8ded1] bg-[#faf6ee] px-2.5 py-1 font-semibold">
                {offlinePaymentMethodLabels[entry.method]}
              </span>
              {entry.method === 'CHECK' && (
                <span className="min-w-0 text-[#796653] [overflow-wrap:anywhere]">
                  چک <bdi>{entry.chequeNumber}</bdi> · {entry.chequeBank || 'بانک ثبت نشده'} ·
                  سررسید <bdi>{entry.chequeDueDate}</bdi>
                </span>
              )}
            </div>
            {entry.note && (
              <p className="mt-3 break-words text-sm leading-7 text-[#796653]">{entry.note}</p>
            )}
            <details className="mt-3 border-t border-dashed border-[#e8ded1] pt-3 text-sm text-[#796653]">
              <summary className="cursor-pointer font-semibold text-[#76100b]">
                جزئیات سند و تخصیص به فاکتورها
              </summary>
              <div className="mt-3 space-y-2 leading-7">
                {entry.allocations.length ? (
                  <ul className="space-y-2">
                    {entry.allocations.map((allocation) => (
                      <li
                        key={allocation.orderId}
                        className="flex flex-wrap justify-between gap-2 rounded-lg bg-[#faf6ee] px-3 py-2"
                      >
                        <span>فاکتور {formatNumber(allocation.number)}</span>
                        <Money compact amount={allocation.amount} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>این سند تخصیص مستقیم به فاکتور ندارد.</p>
                )}
                <p className="break-words text-xs">
                  ثبت‌کننده: <bdi>{entry.adminEmail}</bdi>
                </p>
              </div>
            </details>
          </article>
        ))
      )}
      <Pages page={page} total={total} onPage={onPage} />
    </div>
  );
}
