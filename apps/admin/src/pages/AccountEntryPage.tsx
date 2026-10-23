import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Form, Input, Select } from 'antd';
import { accountEntryInputSchema } from '@behjati/shared/admin';
import { offlinePaymentMethods, offlinePaymentMethodLabels } from '@behjati/shared/sales';
import {
  AdminCustomerAccountDocument,
  RecordAdminAccountEntryDocument,
  type AdminAccountEntryInput,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { useAdmin } from '../auth/AdminProvider';
import { adminRequest, AdminRequestError } from '../lib/client';
import { customerName } from '../lib/format';
import { Money, MoneyInput } from '../components/Money';
import AccountStatus from '../components/AccountStatus';
import RichCustomerSelect from '../components/RichCustomerSelect';
import CalendarPicker from '../components/CalendarPicker';
import AdminIcon from '../components/AdminIcon';
const pendingKey = 'behjati-admin-account-request';
export default function AccountEntryPage({ direction }: { direction: 'RECEIPT' | 'PAYMENT' }) {
  const { admin } = useAdmin();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form] = Form.useForm();
  const [submission, setSubmission] = useState<AdminAccountEntryInput | null>(() => {
    try {
      const v = JSON.parse(sessionStorage.getItem(pendingKey) ?? 'null');
      const p = accountEntryInputSchema.safeParse(v?.input);
      return v?.adminId === admin?.id && p.success ? p.data : null;
    } catch {
      return null;
    }
  });
  const lock = useRef(false);
  const [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const customerId =
    Form.useWatch('customerId', form) ?? submission?.customerId ?? params.get('customerId') ?? '';
  const amount = Number(Form.useWatch('amount', form) ?? submission?.amount ?? 0);
  const method = Form.useWatch('method', form) ?? submission?.method ?? 'CASH';
  const operation = submission?.direction ?? direction;
  const account = useAdminQuery(AdminCustomerAccountDocument, { customerId }, !!customerId, {
    pollInterval: 30000,
  });
  const data = account.data?.adminCustomerAccount;
  const balance = data?.balance ?? 0;
  const after = balance + (operation === 'PAYMENT' ? amount : -amount);
  const title = operation === 'RECEIPT' ? 'دریافت از مشتری' : 'پرداخت به مشتری';
  function remember(input: AdminAccountEntryInput | null) {
    try {
      if (input) sessionStorage.setItem(pendingKey, JSON.stringify({ adminId: admin?.id, input }));
      else sessionStorage.removeItem(pendingKey);
    } catch {
      /* UUID survives in memory. */
    }
  }
  async function submit(values: Record<string, unknown>) {
    if (lock.current) return;
    lock.current = true;
    let input = submission;
    if (!input) {
      const p = accountEntryInputSchema.safeParse({
        ...values,
        customerId,
        direction: operation,
        requestId: crypto.randomUUID(),
      });
      if (!p.success) {
        lock.current = false;
        setError(p.error.issues[0]?.message ?? 'اطلاعات را بررسی کنید.');
        return;
      }
      input = p.data;
      setSubmission(input);
      remember(input);
    }
    setPending(true);
    setError('');
    try {
      await adminRequest(RecordAdminAccountEntryDocument, { input });
      setSubmission(null);
      remember(null);
      navigate('/admin/settlements/account?customerId=' + input.customerId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ثبت انجام نشد.');
      if (
        e instanceof AdminRequestError &&
        ['BAD_USER_INPUT', 'NOT_FOUND', 'REQUEST_CONFLICT'].includes(e.code)
      ) {
        setSubmission(null);
        remember(null);
        account.refresh();
      }
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  return (
    <section
      data-account-operation={operation}
      className="mx-auto w-full max-w-[1180px] rounded-[26px] border border-[#e8ded1] bg-white p-5 shadow-[0_10px_30px_#62452f10] sm:p-7"
    >
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-[#e5d7c2] pb-5">
        <div className="flex items-center gap-3">
          <span className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-[linear-gradient(135deg,#7b3039,#4e141c)] text-[#fff0ca] shadow-lg">
            <AdminIcon name={operation === 'RECEIPT' ? 'wallet' : 'logout'} width={27} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold">{title}</h1>
            <p className="mt-2 text-sm leading-7 text-[#796653]">
              {operation === 'RECEIPT'
                ? 'ثبت دریافت و تسویهٔ قدیمی‌ترین فاکتورهای باز مشتری.'
                : 'ثبت بازپرداخت از محل بستانکاری فعلی مشتری.'}
            </p>
          </div>
        </div>
        <Link to="/admin/settlements">
          <Button icon={<AdminIcon name="arrow" />}>بازگشت به گزینه‌ها</Button>
        </Link>
      </header>
      {submission && (
        <Alert
          className="!mb-5"
          type="info"
          title="درخواست قبلی هنوز قطعی نشده است؛ برای جلوگیری از ثبت تکراری، همان درخواست بررسی می‌شود."
        />
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Form
          layout="vertical"
          form={form}
          disabled={pending || !!submission}
          initialValues={
            submission ?? {
              customerId: params.get('customerId') ?? undefined,
              amount: 0,
              method: 'CASH',
              note: '',
              chequeNumber: '',
              chequeBank: '',
            }
          }
          onFinish={submit}
        >
          <Form.Item
            name="customerId"
            label="مشتری"
            rules={[{ required: true, message: 'مشتری را انتخاب کنید.' }]}
          >
            <RichCustomerSelect
              selected={data ? { ...data.user, accountBalance: data.balance } : null}
            />
          </Form.Item>
          {account.error && (
            <Alert
              className="!mb-4"
              type="error"
              title={account.error}
              action={<Button onClick={account.refresh}>تلاش دوباره</Button>}
            />
          )}
          {data && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e5d7c2] bg-[#faf6ee] p-4">
              <div>
                <p className="font-extrabold">{customerName(data.user)}</p>
                <p className="mt-1 text-xs text-[#857467]">
                  <bdi>{data.user.phone}</bdi>
                </p>
              </div>
              <AccountStatus balance={balance} />
            </div>
          )}
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="amount"
              label="مبلغ (ریال)"
              rules={[{ required: true, message: 'مبلغ را وارد کنید.' }]}
            >
              <MoneyInput />
            </Form.Item>
            <Form.Item name="method" label="روش دریافت / پرداخت">
              <Select
                options={offlinePaymentMethods.map((value) => ({
                  value,
                  label: offlinePaymentMethodLabels[value],
                }))}
              />
            </Form.Item>
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            {[100000, 500000, 1000000].map((value) => (
              <Button
                key={value}
                size="small"
                disabled={pending || !!submission}
                onClick={() => form.setFieldValue('amount', amount + value)}
              >
                +{(value * 10).toLocaleString('fa-IR')} ریال
              </Button>
            ))}
            {data && (
              <Button
                size="small"
                disabled={
                  pending || !!submission || (operation === 'RECEIPT' ? balance <= 0 : balance >= 0)
                }
                onClick={() => form.setFieldValue('amount', Math.abs(balance))}
              >
                کل مانده
              </Button>
            )}
          </div>
          {method === 'CHECK' && (
            <div className="mb-5 rounded-2xl border border-[#e5d7c2] bg-[#faf6ee] p-4">
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
              <p className="text-xs leading-7 text-[#796653]">
                مبلغ چک از زمان ثبت در مانده حساب لحاظ می‌شود.
              </p>
            </div>
          )}
          <Form.Item name="note" label="توضیحات (اختیاری)">
            <Input.TextArea
              rows={2}
              maxLength={500}
              placeholder="بابت فاکتور، شماره رسید یا توضیح عملیات…"
            />
          </Form.Item>
          {error && <Alert className="!mb-4" type="error" title={error} role="alert" />}
          <div className="flex gap-3">
            {submission ? (
              <Button
                type="primary"
                className="!h-[54px] flex-1 !text-base !font-bold"
                loading={pending}
                disabled={pending}
                onClick={() => void submit({})}
              >
                بررسی و ثبت مجدد همین درخواست
              </Button>
            ) : (
              <Button
                type="primary"
                className="!h-[54px] flex-1 !text-base !font-bold"
                htmlType="submit"
                loading={pending}
                disabled={
                  !data ||
                  amount <= 0 ||
                  (operation === 'PAYMENT' && (balance >= 0 || amount > -balance))
                }
              >
                ثبت {title}
              </Button>
            )}
            <Link to="/admin/settlements">
              <Button className="!h-[54px]" disabled={pending}>
                بازگشت
              </Button>
            </Link>
          </div>
        </Form>
        <aside
          data-account-preview
          className="rounded-[24px] border border-[#d9c7a8] bg-[linear-gradient(135deg,#f8efdd,white)] p-5 lg:sticky lg:top-28"
        >
          <h2 className="mb-4 text-sm font-bold text-[#796653]">پیش‌نمایش نتیجه</h2>
          <div className="rounded-[20px] border border-[#e8ded1] bg-white p-5 text-center">
            <span className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-[#f4e8d3] text-[#a17b3d]">
              <AdminIcon name="person" width={28} />
            </span>
            <p className="text-xs text-[#857467]">
              {operation === 'RECEIPT' ? 'پرداخت‌کننده' : 'دریافت‌کننده'}
            </p>
            <h3 className="my-3 text-base font-extrabold">
              {data ? customerName(data.user) : 'هنوز مشتری انتخاب نشده'}
            </h3>
            {data && (
              <>
                <div className="my-5 flex flex-wrap items-center justify-center gap-3">
                  <div className="text-sm text-[#857467]">
                    <Money compact amount={Math.abs(balance)} />
                    <AccountStatus balance={balance} amount={false} />
                  </div>
                  <AdminIcon name="arrow" />
                  <div className="text-lg font-extrabold text-[#4e141c]">
                    <Money compact amount={Math.abs(after)} />
                    <AccountStatus balance={after} amount={false} />
                  </div>
                </div>
                <p className="text-xs leading-7 text-[#857467]">مانده حساب پس از ثبت</p>
              </>
            )}
          </div>
          <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-dashed border-[#d9c7a8] pt-4 text-sm font-bold">
            <span className="text-[#857467]">مبلغ این عملیات</span>
            <Money compact amount={amount} />
          </div>
          {operation === 'PAYMENT' && data && (balance >= 0 || amount > -balance) && (
            <p className="mt-4 text-sm leading-7 text-red-700">
              پرداخت فقط تا سقف بستانکاری فعلی مشتری امکان‌پذیر است.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
