import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Form, Input, Select, Pagination, Tag, Empty, Radio } from 'antd';
import { paymentRequestInputSchema } from '@behjati/shared/payment-requests';
import { paymentStatusLabels, pendingPaymentStates } from '@behjati/shared/payments';
import {
  AdminCustomerAccountDocument,
  AdminPaymentRequestsDocument,
  CreateAdminPaymentRequestDocument,
  CancelAdminPaymentRequestDocument,
  RetryAdminPaymentDocument,
  type AdminPaymentRequestInput,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { useAdmin } from '../auth/AdminProvider';
import { adminRequest, AdminRequestError } from '../lib/client';
import { Money, MoneyInput } from '../components/Money';
import AccountStatus from '../components/AccountStatus';
import RichCustomerSelect from '../components/RichCustomerSelect';
import CopyPaymentLink from '../components/CopyPaymentLink';
import AdminIcon from '../components/AdminIcon';
import DataState from '../components/DataState';
import RecordDialog from '../components/RecordDialog';
import { customerName, formatDateTime } from '../lib/format';
const labels = { ACTIVE: 'فعال', PAID: 'پرداخت‌شده', CANCELED: 'غیرفعال', EXPIRED: 'منقضی' };
export default function PaymentLinks() {
  const { admin } = useAdmin();
  const [recovered] = useState<AdminPaymentRequestInput | null>(() => {
    try {
      const v = JSON.parse(sessionStorage.getItem('behjati-admin-payment-link') ?? 'null');
      const p = paymentRequestInputSchema.safeParse(v?.input);
      return v?.adminId === admin?.id && p.success ? p.data : null;
    } catch {
      return null;
    }
  });
  function remember(input: AdminPaymentRequestInput | null) {
    try {
      if (input)
        sessionStorage.setItem(
          'behjati-admin-payment-link',
          JSON.stringify({ adminId: admin?.id, input }),
        );
      else sessionStorage.removeItem('behjati-admin-payment-link');
    } catch {
      /* Keep UUID in memory. */
    }
  }
  const { pathname } = useLocation();
  const creating = pathname.endsWith('/new');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'ACTIVE' | 'PAID' | 'CANCELED' | 'EXPIRED' | ''>(''),
    [page, setPage] = useState(1);
  const [form] = Form.useForm();
  const [paymentDetails, setPaymentDetails] = useState<string | null>(null);
  const preset = recovered?.customerId ?? params.get('customerId') ?? '';
  const scope =
    Form.useWatch('scope', form) ??
    recovered?.scope ??
    (preset ? 'CUSTOMER_BALANCE' : 'CUSTOM_AMOUNT');
  const customerId = Form.useWatch('customerId', form) ?? preset;
  const amount = Form.useWatch('amount', form) ?? recovered?.amount ?? 0;
  const account = useAdminQuery(
    AdminCustomerAccountDocument,
    { customerId },
    creating && scope === 'CUSTOMER_BALANCE' && !!customerId,
  );
  const balance = account.data?.adminCustomerAccount.balance ?? 0;
  const user = account.data?.adminCustomerAccount.user;
  const list = useAdminQuery(
    AdminPaymentRequestsDocument,
    { input: { status: status || null, page } },
    !creating,
    { pollInterval: 30000 },
  );
  useEffect(() => {
    if (
      paymentDetails &&
      (creating ||
        (list.data &&
          !list.data.adminPaymentRequests.items.some((item) => item.id === paymentDetails)))
    )
      setPaymentDetails(null);
  }, [creating, list.data, paymentDetails]);
  const [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [result, setResult] = useState<{ url: string; amount: number } | null>(null);
  const request = useRef<AdminPaymentRequestInput | null>(recovered),
    lock = useRef(false);
  const actualAmount = request.current?.amount ?? (scope === 'CUSTOMER_BALANCE' ? balance : amount);
  const header = (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-extrabold">
          {creating ? 'ساخت لینک پرداخت' : 'لینک‌های پرداخت'}
        </h1>
        <p className="mt-2 text-sm leading-7 text-[#796653]">
          دریافت مانده مشتری یا مبلغ دلخواه؛ ثبت رسید پس از تأیید بانک.
        </p>
      </div>
      <Link to={creating ? '/admin/settlements/links' : '/admin/settlements/links/new'}>
        <Button
          type={creating ? 'default' : 'primary'}
          icon={<AdminIcon name={creating ? 'arrow' : 'plus'} />}
          className="!h-12 !rounded-xl !font-bold"
        >
          {creating ? 'بازگشت به لینک‌ها' : 'لینک پرداخت جدید'}
        </Button>
      </Link>
    </header>
  );
  if (!creating)
    return (
      <div className="space-y-5">
        {header}
        <div className="flex flex-wrap gap-2" aria-label="وضعیت لینک‌ها">
          {(['', 'ACTIVE', 'PAID', 'EXPIRED', 'CANCELED'] as const).map((value) => (
            <Button
              key={value}
              type={status === value ? 'primary' : 'default'}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
            >
              {value ? labels[value] : 'همه لینک‌ها'}
            </Button>
          ))}
        </div>
        {error && <Alert type="error" title={error} />}{' '}
        {!list.data ? (
          <DataState error={list.error} retry={list.refresh} />
        ) : (
          <>
            {!list.data.adminPaymentRequests.gatewayAvailable && (
              <Alert
                type="warning"
                title="درگاه در دسترس نیست؛ لینک‌های قبلی و رسیدها محفوظ‌اند."
              />
            )}
            {!list.data.adminPaymentRequests.items.length ? (
              <Empty description="هنوز لینکی در این بخش ثبت نشده است." />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {list.data.adminPaymentRequests.items.map((item) => (
                  <article
                    key={item.id}
                    data-payment-request={item.id}
                    className="space-y-4 rounded-[24px] border border-[#e8ded1] bg-white p-5 shadow-sm"
                  >
                    <header className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-extrabold">{item.title}</h2>
                        <p className="mt-1 text-sm text-[#796653]">
                          {item.customerName ?? item.payerName ?? 'دریافت عمومی'}
                        </p>
                      </div>
                      <Tag
                        color={
                          item.status === 'PAID'
                            ? 'green'
                            : item.status === 'ACTIVE'
                              ? 'gold'
                              : 'default'
                        }
                      >
                        {labels[item.status]}
                      </Tag>
                    </header>
                    <div className="text-xl font-extrabold text-[#4e141c]">
                      <Money compact amount={item.amount} />
                    </div>
                    <p className="text-xs text-[#857467]">
                      اعتبار تا {formatDateTime(item.expiresAt)}
                    </p>
                    {item.payments[0] && (
                      <p className="text-sm font-semibold">
                        آخرین تراکنش: {paymentStatusLabels[item.payments[0].status]}
                      </p>
                    )}
                    {item.payments.length > 0 && (
                      <>
                        <Button
                          icon={<AdminIcon name="receipt" />}
                          onClick={() => setPaymentDetails(item.id)}
                        >
                          جزئیات تراکنش‌ها
                        </Button>
                        {paymentDetails === item.id && (
                          <RecordDialog
                            title="جزئیات تراکنش‌ها"
                            subtitle={item.title}
                            icon="wallet"
                            busy={pending}
                            onClose={() => {
                              if (!pending) setPaymentDetails(null);
                            }}
                            width={800}
                          >
                            <div className="mb-4 rounded-2xl border border-[#e8ded1] bg-[#faf6ee] p-4 text-xl font-extrabold text-[#4e141c]">
                              <Money compact amount={item.amount} />
                            </div>
                            <CopyPaymentLink url={item.url} />
                            {error && <Alert type="error" title={error} className="!mt-3" />}
                            <div className="mt-3 space-y-3">
                              {item.payments.map((payment) => (
                                <div
                                  key={payment.id}
                                  className="space-y-2 border-t border-[#e8ded1] pt-3"
                                >
                                  <p>
                                    {paymentStatusLabels[payment.status]} ·{' '}
                                    {formatDateTime(payment.createdAt)}
                                  </p>
                                  {payment.reference && (
                                    <p>
                                      رسید بانک: <bdi>{payment.reference}</bdi>
                                    </p>
                                  )}
                                  {(pendingPaymentStates.includes(payment.status) ||
                                    payment.status === 'REVIEW_REQUIRED') && (
                                    <Button
                                      loading={pending}
                                      onClick={async () => {
                                        setPending(true);
                                        setError('');
                                        try {
                                          await adminRequest(RetryAdminPaymentDocument, {
                                            paymentId: payment.id,
                                          });
                                          list.refresh();
                                        } catch (e) {
                                          setError(
                                            e instanceof Error ? e.message : 'بررسی انجام نشد.',
                                          );
                                        } finally {
                                          setPending(false);
                                        }
                                      }}
                                    >
                                      استعلام دوباره از بانک
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </RecordDialog>
                        )}
                      </>
                    )}
                    <CopyPaymentLink url={item.url} />
                    {item.status === 'ACTIVE' && (
                      <Button
                        danger
                        disabled={
                          pending ||
                          (!!item.payments[0] &&
                            (pendingPaymentStates.includes(item.payments[0].status) ||
                              item.payments[0].status === 'READY'))
                        }
                        onClick={async () => {
                          setPending(true);
                          setError('');
                          try {
                            await adminRequest(CancelAdminPaymentRequestDocument, { id: item.id });
                            list.refresh();
                          } catch (e) {
                            setError(e instanceof Error ? e.message : 'غیرفعال‌سازی انجام نشد.');
                          } finally {
                            setPending(false);
                          }
                        }}
                      >
                        غیرفعال‌کردن لینک
                      </Button>
                    )}
                  </article>
                ))}
              </div>
            )}
            <Pagination
              current={page}
              total={list.data.adminPaymentRequests.total}
              pageSize={20}
              showSizeChanger={false}
              onChange={setPage}
            />
          </>
        )}
      </div>
    );
  return (
    <div className="space-y-5">
      {header}
      <section className="rounded-[26px] border border-[#e8ded1] bg-white p-5 shadow-sm sm:p-7">
        {result ? (
          <div className="space-y-5">
            <h2 className="text-xl font-extrabold">لینک پرداخت آماده است</h2>
            <div className="text-2xl font-extrabold text-[#4e141c]">
              <Money compact amount={result.amount} />
            </div>
            <CopyPaymentLink url={result.url} />
            <Button onClick={() => navigate('/admin/settlements/links')}>مشاهده لینک‌ها</Button>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
            <Form
              form={form}
              layout="vertical"
              initialValues={
                recovered ?? {
                  scope: preset ? 'CUSTOMER_BALANCE' : 'CUSTOM_AMOUNT',
                  customerId: preset,
                  amount: 0,
                  title: 'پرداخت به سنتی بهجتی',
                  expiresInHours: 72,
                }
              }
              disabled={pending || !!request.current}
              onFinish={async (values) => {
                if (lock.current) return;
                lock.current = true;
                setError('');
                try {
                  let input = request.current;
                  if (!input) {
                    const parsed = paymentRequestInputSchema.safeParse({
                      ...values,
                      customerId: scope === 'CUSTOMER_BALANCE' ? customerId : null,
                      amount: actualAmount,
                      payerPhone: values.payerPhone || null,
                      requestId: crypto.randomUUID(),
                    });
                    if (!parsed.success)
                      throw new Error(parsed.error.issues[0]?.message ?? 'اطلاعات را بررسی کنید.');
                    input = parsed.data;
                    request.current = input;
                    remember(input);
                  }
                  setPending(true);
                  const data = await adminRequest(CreateAdminPaymentRequestDocument, { input });
                  setResult(data.createAdminPaymentRequest);
                  request.current = null;
                  remember(null);
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'لینک ساخته نشد.');
                  if (
                    e instanceof AdminRequestError &&
                    [
                      'BAD_USER_INPUT',
                      'NOT_FOUND',
                      'PRICE_CHANGED',
                      'REQUEST_CONFLICT',
                      'PAYMENT_DISABLED',
                    ].includes(e.code)
                  ) {
                    request.current = null;
                    remember(null);
                    account.refresh();
                  }
                } finally {
                  lock.current = false;
                  setPending(false);
                }
              }}
            >
              {request.current && (
                <Alert
                  className="!mb-4"
                  type="info"
                  title="همان درخواست قبلی با مبلغ ثابت بررسی می‌شود؛ لینک تکراری ساخته نخواهد شد."
                />
              )}
              <Form.Item name="scope" label="نوع لینک">
                <Radio.Group
                  options={[
                    { value: 'CUSTOMER_BALANCE', label: 'مانده مشتری' },
                    { value: 'CUSTOM_AMOUNT', label: 'مبلغ دلخواه / غیرمشتری' },
                  ]}
                />
              </Form.Item>
              {scope === 'CUSTOMER_BALANCE' ? (
                <>
                  <Form.Item name="customerId" label="مشتری">
                    <RichCustomerSelect
                      selected={user ? { ...user, accountBalance: balance } : null}
                    />
                  </Form.Item>
                  {account.error && <Alert type="error" title={account.error} />}
                  <p className="mb-5 text-sm leading-7">
                    مانده فعلی: <AccountStatus balance={balance} />
                  </p>
                </>
              ) : (
                <>
                  <Form.Item name="amount" label="مبلغ (ریال)" rules={[{ required: true }]}>
                    <MoneyInput />
                  </Form.Item>
                  <div className="grid gap-x-3 sm:grid-cols-2">
                    <Form.Item name="payerName" label="نام پرداخت‌کننده (اختیاری)">
                      <Input maxLength={100} />
                    </Form.Item>
                    <Form.Item name="payerPhone" label="موبایل (اختیاری)">
                      <Input dir="ltr" maxLength={11} />
                    </Form.Item>
                  </div>
                </>
              )}
              <Form.Item
                name="title"
                label="عنوان قابل نمایش به پرداخت‌کننده"
                rules={[{ required: true }]}
              >
                <Input maxLength={200} />
              </Form.Item>
              <Form.Item name="expiresInHours" label="اعتبار لینک">
                <Select
                  options={[
                    { value: 24, label: 'یک روز' },
                    { value: 72, label: 'سه روز' },
                    { value: 168, label: 'هفت روز' },
                  ]}
                />
              </Form.Item>
              {error && <Alert className="!mb-4" type="error" title={error} />}
              <Button
                htmlType="submit"
                type="primary"
                loading={pending}
                disabled={
                  !request.current && (actualAmount <= 0 || (scope === 'CUSTOMER_BALANCE' && !user))
                }
                className="!h-12 !w-full !rounded-xl !text-base !font-bold"
              >
                {request.current ? 'بررسی و ساخت مجدد همین لینک' : 'ساخت لینک پرداخت'}
              </Button>
            </Form>
            <aside className="space-y-4 rounded-[24px] border border-[#d9c7a8] bg-[linear-gradient(145deg,#faf7ef,white)] p-5">
              <h2 className="font-extrabold text-[#796653]">پیش‌نمایش لینک</h2>
              <div className="space-y-4 rounded-2xl border border-[#e8ded1] bg-white p-5 text-center">
                <AdminIcon name="link" className="mx-auto size-10 text-[#c49536]" />
                <p className="font-bold">
                  {scope === 'CUSTOMER_BALANCE' && user ? customerName(user) : 'دریافت مبلغ دلخواه'}
                </p>
                <div className="text-2xl font-extrabold text-[#4e141c]">
                  <Money compact amount={Math.max(0, actualAmount)} />
                </div>
              </div>
              <p className="text-sm leading-8 text-[#796653]">
                مبلغ پس از ساخت ثابت است. پرداخت تأییدشدهٔ مشتری ابتدا فاکتورهای باز را تسویه
                می‌کند؛ اضافه وجه بستانکاری می‌شود. این لینک پیامک ارسال نمی‌کند.
              </p>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
