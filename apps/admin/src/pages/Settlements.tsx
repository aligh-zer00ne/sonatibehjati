import AmbientBackdrop from '../components/AmbientBackdrop';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from 'antd';
import { AdminCustomerAccountDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { customerName } from '../lib/format';
import { Money } from '../components/Money';
import AccountStatus from '../components/AccountStatus';
import RichCustomerSelect from '../components/RichCustomerSelect';
import { AccountInvoices, AccountLedger } from '../components/CustomerAccountRecords';
import AnalyticsRefresh from '../components/AnalyticsRefresh';
import OrderDetailsDialog from '../components/OrderDetailsDialog';
import DataState from '../components/DataState';
import AdminIcon from '../components/AdminIcon';
export default function Settlements({
  fixedCustomerId,
  inDialog = false,
}: {
  fixedCustomerId?: string;
  inDialog?: boolean;
}) {
  const [params, setParams] = useSearchParams();
  const customerId = fixedCustomerId ?? params.get('customerId') ?? '';
  const [page, setPage] = useState(1),
    [invoicePage, setInvoicePage] = useState(1);
  const [activeTab, setActiveTab] = useState<'entries' | 'invoices'>('entries');
  const [expanded, setExpanded] = useState<string | null>(null);
  const account = useAdminQuery(
    AdminCustomerAccountDocument,
    { customerId, page, invoicePage },
    !!customerId,
    { pollInterval: 30000 },
  );
  const data = account.data?.adminCustomerAccount;
  return (
    <>
      <div data-settlements className="flex min-w-0 flex-col gap-5">
        {!inDialog && (
          <>
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-sm font-semibold text-[#a17b3d]">حساب مشتریان فروش دستی</p>
                <h1 className="text-[26px] font-extrabold text-[#34251e] sm:text-[30px]">
                  دریافت و پرداخت
                </h1>
                <p className="mt-2 text-sm leading-7 text-[#796653]">
                  مانده حساب، فاکتورهای مستقل و دریافت‌های نقدی، کارت‌خوان و چک.
                </p>
              </div>
              <span className="grid size-14 place-items-center rounded-[18px] border border-[#e7ce96] bg-[#f6e4bc] text-[#926720]">
                <AdminIcon name="wallet" width={28} height={28} />
              </span>
            </header>
            <section
              aria-label="انتخاب حساب مشتری"
              className="rounded-[24px] border border-[#e8ded1] bg-white p-5 shadow-[0_4px_18px_#62452f08]"
            >
              <label
                htmlFor="account-customer"
                className="mb-3 flex items-center gap-2 text-base font-extrabold"
              >
                <AdminIcon name="search" width={20} />
                جستجو و انتخاب مشتری
              </label>
              <RichCustomerSelect
                id="account-customer"
                value={customerId}
                selected={data ? { ...data.user, accountBalance: data.balance } : null}
                onChange={(id) => {
                  setParams({ customerId: id });
                  setPage(1);
                  setInvoicePage(1);
                  setExpanded(null);
                  setActiveTab('entries');
                }}
              />
            </section>
          </>
        )}
        {!customerId ? (
          <section className="flex flex-col items-center rounded-[26px] border border-dashed border-[#d9c7a8] bg-[#faf6ee] px-5 py-12 text-center">
            <span className="mb-5 grid size-20 place-items-center rounded-3xl border border-[#ead9b7] bg-[#f4e8d3] text-[#a17b3d]">
              <AdminIcon name="users" width={36} height={36} />
            </span>
            <h2 className="text-xl font-extrabold">حساب کدام مشتری را بررسی کنیم؟</h2>
            <p className="mt-3 max-w-md text-sm leading-8 text-[#796653]">
              مشتری را از جستجوی بالا انتخاب کنید تا مانده حساب، فاکتورها و گردش دریافت و پرداخت او
              نمایش داده شود.
            </p>
          </section>
        ) : !data ? (
          <DataState error={account.error} retry={account.refresh} />
        ) : (
          <>
            <section
              aria-label="خلاصه حساب مشتری"
              className="overflow-hidden rounded-[26px] border border-[#e8ded1] bg-white shadow-[0_6px_22px_#62452f08]"
            >
              <header className="relative isolate overflow-hidden flex flex-wrap items-center justify-between gap-5 bg-[linear-gradient(125deg,#5c1924,#290c12)] p-5 text-[#fff5e1] sm:p-6">
                <AmbientBackdrop />
                <div className="relative z-10 flex items-center gap-3">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-[#f6dfa0] bg-[linear-gradient(135deg,#f6dfa0,#c49536)] text-[#4e141c]">
                    <AdminIcon name="person" width={28} height={28} />
                  </span>
                  <div>
                    <h2 className="text-xl leading-8 font-extrabold">{customerName(data.user)}</h2>
                    <p className="mt-1 text-sm text-[#f2d6a2]">
                      <bdi>{data.user.phone}</bdi>
                    </p>
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="mb-2 text-sm text-[#f2d6a2]">مانده کل حساب</p>
                  <div className="text-2xl font-extrabold text-[#f6dfa0]">
                    <Money compact amount={Math.abs(data.balance)} />
                  </div>
                  <div className="mt-2">
                    <AccountStatus balance={data.balance} amount={false} />
                  </div>
                </div>
              </header>
              <dl className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
                {[
                  { title: 'جمع فاکتورها', amount: data.invoiced, icon: 'receipt' as const },
                  { title: 'جمع دریافتی', amount: data.received, icon: 'wallet' as const },
                  { title: 'پرداخت به مشتری', amount: data.paid, icon: 'logout' as const },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#eee5d9] bg-[#faf6ee] p-3 sm:block sm:p-4"
                  >
                    <dt className="flex items-center gap-2 text-sm font-semibold text-[#796653] sm:mb-3">
                      <AdminIcon name={item.icon} width={18} />
                      {item.title}
                    </dt>
                    <dd className="text-base font-extrabold sm:text-lg">
                      <Money compact amount={item.amount} />
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap gap-3 border-t border-[#eee5d9] p-4 sm:px-5">
                <Link to={`/admin/settlements/receipt?customerId=${customerId}`}>
                  <Button type="primary" icon={<AdminIcon name="plus" />}>
                    ثبت دریافت از مشتری
                  </Button>
                </Link>
                <Link to={`/admin/settlements/payment?customerId=${customerId}`}>
                  <Button disabled={data.balance >= 0} icon={<AdminIcon name="logout" />}>
                    پرداخت به مشتری
                  </Button>
                </Link>
                {data.balance > 0 && (
                  <Link to={`/admin/settlements/links/new?customerId=${customerId}`}>
                    <Button icon={<AdminIcon name="link" />}>لینک پرداخت مانده</Button>
                  </Link>
                )}
                <p className="flex items-center text-xs leading-7 text-[#857467]">
                  دریافت‌ها ابتدا قدیمی‌ترین فاکتور باز را تسویه می‌کنند؛ اضافه وجه بستانکاری مشتری
                  است.
                </p>
              </div>
            </section>
            <AnalyticsRefresh
              refreshing={account.refreshing}
              updatedAt={account.updatedAt}
              error={account.error}
              refresh={account.refresh}
            />
            <section className="min-w-0 rounded-[24px] border border-[#e8ded1] bg-[#fffdf9] p-3 sm:p-5">
              <div
                role="tablist"
                aria-label="اسناد حساب مشتری"
                className="mb-5 flex flex-wrap gap-2 rounded-2xl bg-[#f4ebdd] p-1.5"
              >
                {[
                  {
                    key: 'entries' as const,
                    label: 'گردش حساب',
                    count: data.total,
                    icon: 'wallet' as const,
                  },
                  {
                    key: 'invoices' as const,
                    label: 'فاکتورهای مستقل مشتری',
                    count: data.invoiceTotal,
                    icon: 'receipt' as const,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    id={`account-tab-${tab.key}`}
                    type="button"
                    role="tab"
                    aria-label={tab.label}
                    tabIndex={activeTab === tab.key ? 0 : -1}
                    aria-selected={activeTab === tab.key}
                    aria-controls={`account-panel-${tab.key}`}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setExpanded(null);
                    }}
                    onKeyDown={(event) => {
                      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                      event.preventDefault();
                      const next =
                        event.key === 'Home'
                          ? 'entries'
                          : event.key === 'End'
                            ? 'invoices'
                            : activeTab === 'entries'
                              ? 'invoices'
                              : 'entries';
                      setActiveTab(next);
                      setExpanded(null);
                      requestAnimationFrame(() =>
                        document.getElementById(`account-tab-${next}`)?.focus(),
                      );
                    }}
                    className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-[#796653] aria-selected:bg-white aria-selected:text-[#4e141c] aria-selected:shadow-sm"
                  >
                    <AdminIcon name={tab.icon} width={19} />
                    {tab.key === 'invoices' ? 'فاکتورها' : tab.label}
                    <span className="rounded-lg bg-[#f4ebdd] px-2 py-0.5 text-xs">
                      {tab.count.toLocaleString('fa-IR')}
                    </span>
                  </button>
                ))}
              </div>
              <div
                role="tabpanel"
                id={`account-panel-${activeTab}`}
                aria-labelledby={`account-tab-${activeTab}`}
                className="min-w-0"
              >
                {activeTab === 'entries' ? (
                  <AccountLedger
                    items={data.entries}
                    page={page}
                    total={data.total}
                    onPage={setPage}
                  />
                ) : (
                  <>
                    <AccountInvoices
                      items={data.invoices}
                      page={invoicePage}
                      total={data.invoiceTotal}
                      onPage={setInvoicePage}
                      onExpand={(id) => setExpanded(expanded === id ? null : id)}
                    />
                    {expanded && (
                      <OrderDetailsDialog
                        id={expanded}
                        onClose={() => setExpanded(null)}
                        onUpdated={account.refresh}
                      />
                    )}
                  </>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
