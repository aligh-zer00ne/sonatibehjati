import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Form, Input, Modal, Select, Radio } from 'antd';
import { accountEntryInputSchema } from '@behjati/shared/admin';
import { offlinePaymentMethods, offlinePaymentMethodLabels } from '@behjati/shared/sales';
import {
  AdminCustomerAccountDocument,
  AdminOrderCustomersDocument,
  RecordAdminAccountEntryDocument,
  type AdminAccountEntryInput,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest, AdminRequestError } from '../lib/client';
import { customerName } from '../lib/format';
import { Money, MoneyInput } from '../components/Money';
import AccountStatus from '../components/AccountStatus';
import CalendarPicker from '../components/CalendarPicker';
import { AccountInvoices, AccountLedger } from '../components/CustomerAccountRecords';
import AnalyticsRefresh from '../components/AnalyticsRefresh';
import OrderDetailsCard from '../components/OrderDetailsCard';
import DataState from '../components/DataState';
import AdminIcon from '../components/AdminIcon';
import { useAdmin } from '../auth/AdminProvider';

const pendingKey = 'behjati-admin-account-request';

export default function Settlements() {
  const { admin } = useAdmin();
  const [params, setParams] = useSearchParams();
  const customerId = params.get('customerId') ?? '';
  const [term, setTerm] = useState(''),
    [search, setSearch] = useState('');
  const [page, setPage] = useState(1),
    [invoicePage, setInvoicePage] = useState(1);
  const [form] = Form.useForm();
  const [entryDirection, setEntryDirection] = useState<'RECEIPT' | 'PAYMENT'>('RECEIPT');
  const submitLock = useRef(false);
  const [activeTab, setActiveTab] = useState<'entries' | 'invoices'>('entries');
  const method = Form.useWatch('method', form);
  const [submission, setSubmission] = useState<AdminAccountEntryInput | null>(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(pendingKey) ?? 'null');
      const parsed = accountEntryInputSchema.safeParse(stored?.input);
      return stored?.adminId === admin?.id && parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  });
  const [open, setOpen] = useState(!!submission),
    [pending, setPending] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    if (submission && submission.customerId !== customerId)
      setParams({ customerId: submission.customerId });
  }, [submission, customerId, setParams]);
  function remember(input: AdminAccountEntryInput | null) {
    try {
      if (input) sessionStorage.setItem(pendingKey, JSON.stringify({ adminId: admin?.id, input }));
      else sessionStorage.removeItem(pendingKey);
    } catch {
      /* The in-memory UUID still protects retries when storage is unavailable. */
    }
  }
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setSearch(term), 300);
    return () => clearTimeout(timer);
  }, [term]);
  const customers = useAdminQuery(AdminOrderCustomersDocument, {
    input: { search, page: 1, pageSize: 20 },
  });
  const account = useAdminQuery(
    AdminCustomerAccountDocument,
    { customerId, page, invoicePage },
    !!customerId,
    { pollInterval: 30000 },
  );
  const data = account.data?.adminCustomerAccount;
  const options = (customers.data?.adminOrderCustomers.items ?? []).map((u) => ({
    value: u.id,
    label: `${customerName(u)} · ${u.phone}`,
  }));
  if (data && !options.some((o) => o.value === data.user.id))
    options.unshift({
      value: data.user.id,
      label: `${customerName(data.user)} · ${data.user.phone}`,
    });
  async function submit(values: Record<string, unknown>) {
    if (submitLock.current) return;
    submitLock.current = true;
    let input = submission;
    if (!input) {
      const parsed = accountEntryInputSchema.safeParse({
        ...values,
        customerId,
        requestId: crypto.randomUUID(),
      });
      if (!parsed.success) {
        submitLock.current = false;
        setError(parsed.error.issues[0]?.message ?? 'اطلاعات معتبر وارد کنید.');
        return;
      }
      input = parsed.data;
      setSubmission(input);
      remember(input);
    }
    setPending(true);
    setError('');
    try {
      await adminRequest(RecordAdminAccountEntryDocument, { input });
      setOpen(false);
      setSubmission(null);
      remember(null);
      form.resetFields();
      setPage(1);
      setInvoicePage(1);
      account.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ثبت انجام نشد.');
      if (
        e instanceof AdminRequestError &&
        ['BAD_USER_INPUT', 'NOT_FOUND', 'REQUEST_CONFLICT'].includes(e.code)
      ) {
        setSubmission(null);
        remember(null);
      }
    } finally {
      submitLock.current = false;
      setPending(false);
    }
  }
  return (
    <>
      <div data-settlements className="flex min-w-0 flex-col gap-5">
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
          <Select
            id="account-customer"
            disabled={pending || !!submission}
            aria-label="مشتری دریافت و پرداخت"
            showSearch
            filterOption={false}
            onSearch={setTerm}
            loading={customers.refreshing}
            value={customerId || undefined}
            options={options}
            className="!h-12 w-full"
            placeholder="نام مشتری یا شماره موبایل را بنویسید…"
            onChange={(id) => {
              setParams({ customerId: id });
              setPage(1);
              setInvoicePage(1);
              setExpanded(null);
              setActiveTab('entries');
            }}
          />
          {customers.error && (
            <Alert
              className="!mt-3"
              type="error"
              title={customers.error}
              action={<Button onClick={customers.refresh}>تلاش دوباره</Button>}
            />
          )}
        </section>
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
              <header className="flex flex-wrap items-center justify-between gap-5 bg-[linear-gradient(125deg,#83160e,#4b0c09)] p-5 text-[#fff5e1] sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-[#f6dfa0] bg-[linear-gradient(135deg,#f6dfa0,#c49536)] text-[#76100b]">
                    <AdminIcon name="person" width={28} height={28} />
                  </span>
                  <div>
                    <h2 className="text-xl leading-8 font-extrabold">{customerName(data.user)}</h2>
                    <p className="mt-1 text-sm text-[#f2d6a2]">
                      <bdi>{data.user.phone}</bdi>
                    </p>
                  </div>
                </div>
                <div>
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
                <Button
                  type="primary"
                  className="!h-12 !rounded-xl !px-5 !text-base !font-bold"
                  icon={<AdminIcon name="plus" width={20} />}
                  onClick={() => {
                    setError('');
                    if (!submission) setEntryDirection('RECEIPT');
                    setOpen(true);
                  }}
                >
                  ثبت دریافت و پرداخت
                </Button>
                <Button
                  className="!h-12 !rounded-xl !px-5 !text-base !font-semibold"
                  disabled={pending || !!submission || data.balance >= 0}
                  icon={<AdminIcon name="logout" width={20} />}
                  onClick={() => {
                    setError('');
                    setEntryDirection('PAYMENT');
                    setOpen(true);
                  }}
                >
                  پرداخت به مشتری
                </Button>
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
                    className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-[#796653] aria-selected:bg-white aria-selected:text-[#76100b] aria-selected:shadow-sm"
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
                      <div className="mt-4">
                        <OrderDetailsCard
                          id={expanded}
                          onClose={() => setExpanded(null)}
                          onUpdated={account.refresh}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </>
        )}
      </div>
      {open && (
        <Modal
          open
          title="ثبت دریافت و پرداخت مشتری"
          footer={null}
          width={600}
          maskClosable={false}
          onCancel={() => {
            if (!pending) {
              setOpen(false);
              setError('');
            }
          }}
        >
          <Form
            clearOnDestroy
            form={form}
            layout="vertical"
            initialValues={
              submission ?? {
                direction: entryDirection,
                method: 'CASH',
                amount: 0,
                note: '',
                chequeNumber: '',
                chequeBank: '',
              }
            }
            onFinish={submit}
            disabled={pending || !!submission}
          >
            <Form.Item label="نوع عملیات" name="direction">
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                className="!flex [&_.ant-radio-button-wrapper]:!h-auto [&_.ant-radio-button-wrapper]:!min-h-12 [&_.ant-radio-button-wrapper]:!flex-1 [&_.ant-radio-button-wrapper]:!content-center [&_.ant-radio-button-wrapper]:!text-center [&_.ant-radio-button-wrapper]:!font-semibold [&_.ant-radio-button-wrapper]:!whitespace-normal [&_.ant-radio-button-wrapper]:!leading-6 [&_.ant-radio-button-wrapper]:!px-2"
                options={[
                  { value: 'RECEIPT', label: 'دریافت از مشتری' },
                  { value: 'PAYMENT', label: 'پرداخت بستانکاری به مشتری' },
                ]}
              />
            </Form.Item>
            <Form.Item label="مبلغ (ریال)" name="amount" rules={[{ required: true }]}>
              <MoneyInput />
            </Form.Item>
            <Form.Item label="روش دریافت / پرداخت" name="method">
              <Select
                options={offlinePaymentMethods.map((value) => ({
                  value,
                  label: offlinePaymentMethodLabels[value],
                }))}
              />
            </Form.Item>
            {method === 'CHECK' && (
              <>
                <div className="grid gap-x-3 sm:grid-cols-2">
                  <Form.Item label="شماره چک" name="chequeNumber" rules={[{ required: true }]}>
                    <Input maxLength={60} />
                  </Form.Item>
                  <Form.Item label="بانک" name="chequeBank">
                    <Input maxLength={100} />
                  </Form.Item>
                  <Form.Item label="سررسید چک" name="chequeDueDate" rules={[{ required: true }]}>
                    <CalendarPicker />
                  </Form.Item>
                </div>
                <p className="mb-4 text-xs">مبلغ چک از زمان ثبت در ماندهٔ حساب لحاظ می‌شود.</p>
              </>
            )}
            <Form.Item label="شرح" name="note">
              <Input.TextArea maxLength={500} />
            </Form.Item>
            {error && <Alert className="!mb-3" type="error" title={error} role="alert" />}
            {submission ? (
              <Button
                type="primary"
                disabled={pending}
                loading={pending}
                onClick={() => void submit({})}
              >
                بررسی و ثبت مجدد همین درخواست
              </Button>
            ) : (
              <Button type="primary" htmlType="submit" loading={pending}>
                ثبت در حساب مشتری
              </Button>
            )}
          </Form>
        </Modal>
      )}
    </>
  );
}
