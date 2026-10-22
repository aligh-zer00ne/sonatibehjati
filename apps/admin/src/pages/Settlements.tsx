import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, Empty, Form, Input, Modal, Select, Typography } from 'antd';
import { accountEntryInputSchema } from '@behjati/shared/admin';
import { offlinePaymentMethods, offlinePaymentMethodLabels } from '@behjati/shared/sales';
import { formatNumber } from '@behjati/shared';
import {
  AdminCustomerAccountDocument,
  AdminOrderCustomersDocument,
  RecordAdminAccountEntryDocument,
  type AdminAccountEntryInput,
  type CustomerAccountFieldsFragment,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest, AdminRequestError } from '../lib/client';
import { customerName, formatDateTime } from '../lib/format';
import { Money, MoneyInput } from '../components/Money';
import AccountStatus from '../components/AccountStatus';
import CalendarPicker from '../components/CalendarPicker';
import RecordCards from '../components/RecordCards';
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
    let input = submission;
    if (!input) {
      const parsed = accountEntryInputSchema.safeParse({
        ...values,
        customerId,
        requestId: crypto.randomUUID(),
      });
      if (!parsed.success) {
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
      setPending(false);
    }
  }
  return (
    <>
      <div>
        <Typography.Title level={2}>دریافت و پرداخت</Typography.Title>
        <p className="mt-2 text-sm text-[#76685d]">
          حساب فروش‌های دستی؛ دریافت‌ها ابتدا قدیمی‌ترین فاکتور باز را تسویه می‌کنند.
        </p>
      </div>
      <Card>
        <label className="mb-2 block font-semibold" htmlFor="account-customer">
          مشتری
        </label>
        <Select
          id="account-customer"
          disabled={pending || !!submission}
          aria-label="مشتری دریافت و پرداخت"
          showSearch
          filterOption={false}
          onSearch={setTerm}
          value={customerId || undefined}
          options={options}
          className="w-full"
          placeholder="نام یا شماره موبایل"
          onChange={(id) => {
            setParams({ customerId: id });
            setPage(1);
            setInvoicePage(1);
            setExpanded(null);
          }}
        />
      </Card>
      {!customerId ? (
        <Empty description="برای مشاهدهٔ حساب، مشتری را انتخاب کنید." />
      ) : !data ? (
        <DataState error={account.error} retry={account.refresh} />
      ) : (
        <>
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="mb-2 text-lg font-bold">{customerName(data.user)}</h2>
                <AccountStatus balance={data.balance} />
              </div>
              <Button
                type="primary"
                icon={<AdminIcon name="plus" />}
                onClick={() => {
                  setError('');
                  setOpen(true);
                }}
              >
                ثبت دریافت و پرداخت
              </Button>
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ['جمع فاکتورها', data.invoiced],
                ['جمع دریافتی', data.received],
                ['پرداخت به مشتری', data.paid],
              ].map(([title, amount]) => (
                <div key={title} className="rounded-xl bg-[#f4e8d3] p-3">
                  <dt className="mb-2 text-xs">{title}</dt>
                  <dd>
                    <Money amount={Number(amount)} />
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
          <h2 className="text-lg font-bold">فاکتورهای مستقل مشتری</h2>
          <RecordCards<CustomerAccountFieldsFragment['invoices'][number]>
            rowKey="id"
            icon="receipt"
            label="فاکتورهای دستی مشتری"
            dataSource={data.invoices}
            pagination={{
              current: invoicePage,
              pageSize: 20,
              total: data.invoiceTotal,
              onChange: setInvoicePage,
              showSizeChanger: false,
            }}
            columns={[
              { title: 'شماره فاکتور', render: (_, o) => formatNumber(o.number) },
              { title: 'مبلغ فاکتور', render: (_, o) => <Money amount={o.total} /> },
              { title: 'تسویه‌شده', render: (_, o) => <Money amount={o.offlinePaidAmount} /> },
              {
                title: 'وضعیت حساب',
                render: (_, o) => <AccountStatus balance={o.total - o.offlinePaidAmount} />,
              },
              {
                title: 'عملیات',
                render: (_, o) => (
                  <Button
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    icon={<AdminIcon name="print" />}
                  >
                    محصولات و چاپ فاکتور / لیبل
                  </Button>
                ),
              },
            ]}
          />
          {expanded && (
            <OrderDetailsCard
              id={expanded}
              onClose={() => setExpanded(null)}
              onUpdated={account.refresh}
            />
          )}
          <h2 className="text-lg font-bold">گزارش دریافت و پرداخت مشتری</h2>
          <RecordCards<CustomerAccountFieldsFragment['entries'][number]>
            rowKey="id"
            icon="wallet"
            label="گردش حساب مشتری"
            dataSource={data.entries}
            pagination={{
              current: page,
              pageSize: 20,
              total: data.total,
              onChange: setPage,
              showSizeChanger: false,
            }}
            columns={[
              { title: 'تاریخ', render: (_, e) => formatDateTime(e.createdAt) },
              {
                title: 'نوع',
                render: (_, e) =>
                  e.direction === 'RECEIPT' ? 'دریافت از مشتری' : 'پرداخت به مشتری',
              },
              { title: 'مبلغ', render: (_, e) => <Money amount={e.amount} /> },
              { title: 'روش', render: (_, e) => offlinePaymentMethodLabels[e.method] },
              {
                title: 'تسویه فاکتورها',
                render: (_, e) => (
                  <ul>
                    {e.allocations.map((a) => (
                      <li key={a.orderId}>
                        فاکتور {formatNumber(a.number)}: <Money amount={a.amount} />
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                title: 'اطلاعات چک',
                render: (_, e) =>
                  e.method === 'CHECK' ? (
                    <span>
                      شماره: {e.chequeNumber} · بانک: {e.chequeBank || '—'} · سررسید:{' '}
                      <bdi>{e.chequeDueDate}</bdi>
                    </span>
                  ) : (
                    '—'
                  ),
              },
              { title: 'شرح', render: (_, e) => e.note || '—' },
              { title: 'ثبت‌کننده', render: (_, e) => <bdi>{e.adminEmail}</bdi> },
            ]}
          />
        </>
      )}
      {open && (
        <Modal
          open
          title="ثبت دریافت و پرداخت مشتری"
          footer={null}
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
                direction: 'RECEIPT',
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
              <Select
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
