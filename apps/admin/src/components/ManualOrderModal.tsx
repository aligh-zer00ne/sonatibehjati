import { useEffect, useState } from 'react';
import { Alert, Button, Checkbox, Form, Input, InputNumber, Modal, Select } from 'antd';
import { manualOrderInputSchema } from '@behjati/shared/admin';
import {
  shippingMethods,
  shippingMethodLabels,
  offlinePaymentMethods,
  offlinePaymentMethodLabels,
} from '@behjati/shared/sales';
import { hasPermission } from '@behjati/shared/permissions';
import {
  AdminManualQuoteDocument,
  AdminOrderCustomersDocument,
  AdminOrderCustomerDocument,
  ManualCatalogDocument,
  CreateAdminManualOrderDocument,
  type AdminManualOrderInput,
  type ShippingMethod,
  type OfflinePaymentMethod,
  type SalesChannel,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest, AdminRequestError } from '../lib/client';
import { useAdmin } from '../auth/AdminProvider';
import RetailCustomerModal from './RetailCustomerModal';
import { Money, MoneyInput } from './Money';
import { customerName } from '../lib/format';
export default function ManualOrderModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { admin } = useAdmin();
  const [form] = Form.useForm();
  const [customerId, setCustomerId] = useState('');
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState('');
  const [productTerm, setProductTerm] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [lines, setLines] = useState<Array<{ productId: string; title: string; quantity: number }>>(
    [],
  );
  const [channel, setChannel] = useState<SalesChannel>('IN_PERSON');
  const [pickup, setPickup] = useState(true);
  const [method, setMethod] = useState<ShippingMethod>('POST');
  const [received, setReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<OfflinePaymentMethod>('POS');
  const [discountCode, setDiscountCode] = useState('');
  const [couponDraft, setCouponDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [addCustomer, setAddCustomer] = useState(false);
  // Keep the exact payload and UUID after a transport failure: retry cannot duplicate the sale.
  const [submission, setSubmission] = useState<AdminManualOrderInput | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setSearch(term), 300);
    return () => clearTimeout(t);
  }, [term]);
  useEffect(() => {
    const t = setTimeout(() => setProductSearch(productTerm), 300);
    return () => clearTimeout(t);
  }, [productTerm]);
  const customers = useAdminQuery(AdminOrderCustomersDocument, {
    input: { search, page: 1, pageSize: 20 },
  });
  const selected = useAdminQuery(AdminOrderCustomerDocument, { id: customerId }, !!customerId);
  const products = useAdminQuery(ManualCatalogDocument, {
    input: { search: productSearch, page: 1, pageSize: 20 },
  });
  const quoteInput = {
    items: lines.map(({ productId, quantity }) => ({ productId, quantity })),
    discountCode,
    shippingMethod: method,
    pickup,
  };
  const quote = useAdminQuery(AdminManualQuoteDocument, { input: quoteInput }, lines.length > 0);
  const price = quote.data?.adminManualQuote;
  const options = [...(customers.data?.adminOrderCustomers.items ?? [])];
  if (selected.data && !options.some((u) => u.id === customerId))
    options.unshift(selected.data.adminOrderCustomer);
  async function submit(values: Record<string, unknown>) {
    let input = submission;
    if (!input) {
      if (!price || !customerId) {
        setError('مشتری و محصولات را انتخاب کنید.');
        return;
      }
      const parsed = manualOrderInputSchema.safeParse({
        ...quoteInput,
        customerId,
        salesChannel: channel,
        address: pickup ? null : { ...values, title: 'نشانی سفارش', isDefault: false },
        receivedAmount: received,
        paymentMethod: received ? paymentMethod : null,
        requestId: crypto.randomUUID(),
        expectedTotal: price.total,
      });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? 'اطلاعات را بررسی کنید.');
        return;
      }
      input = parsed.data;
      setSubmission(input);
    }
    setPending(true);
    setError('');
    try {
      const result = await adminRequest(CreateAdminManualOrderDocument, { input });
      onSaved(result.createAdminManualOrder.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ثبت انجام نشد.');
      if (
        e instanceof AdminRequestError &&
        [
          'BAD_USER_INPUT',
          'PRICE_CHANGED',
          'INVALID_DISCOUNT',
          'SHIPPING_UNAVAILABLE',
          'NOT_FOUND',
        ].includes(e.code)
      ) {
        setSubmission(null);
        quote.refresh();
      }
    } finally {
      setPending(false);
    }
  }
  return (
    <Modal
      open
      title="ثبت سفارش حضوری / اینستاگرام"
      width={760}
      footer={null}
      maskClosable={false}
      onCancel={() => {
        if (!pending) onClose();
      }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={submit} disabled={pending || !!submission}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Form.Item label="مشتری">
            <Select
              aria-label="مشتری سفارش دستی"
              showSearch
              filterOption={false}
              value={customerId || undefined}
              onSearch={setTerm}
              onChange={setCustomerId}
              options={options.map((u) => ({
                value: u.id,
                label: `${customerName(u)} · ${u.phone}`,
              }))}
            />
          </Form.Item>
          <Form.Item label="محل خرید">
            <Select
              value={channel}
              onChange={setChannel}
              options={[
                { value: 'IN_PERSON', label: 'حضوری' },
                { value: 'INSTAGRAM', label: 'اینستاگرام' },
              ]}
            />
          </Form.Item>
        </div>
        {hasPermission(admin, 'CUSTOMERS') && (
          <Button
            className="!mb-4"
            disabled={pending || !!submission}
            onClick={() => setAddCustomer(true)}
          >
            افزودن مشتری جدید
          </Button>
        )}
        <Form.Item label="افزودن محصول">
          <Select<string>
            aria-label="محصول سفارش دستی"
            showSearch
            filterOption={false}
            value={undefined}
            onSearch={setProductTerm}
            loading={!products.data}
            options={(products.data?.catalog.items ?? []).map((p) => ({
              value: p.id,
              label: `${p.title} · ${p.weight}`,
            }))}
            onChange={(id) => {
              const p = products.data?.catalog.items.find((p) => p.id === id);
              if (p && !lines.some((l) => l.productId === id))
                setLines([...lines, { productId: id, title: p.title, quantity: 1 }]);
            }}
          />
        </Form.Item>
        <ul className="mb-4 space-y-2">
          {lines.map((l) => (
            <li
              key={l.productId}
              className="flex flex-wrap items-center gap-2 rounded-xl bg-[#fcf9f3] p-3"
            >
              <b className="min-w-0 flex-1 break-words text-sm">{l.title}</b>
              <InputNumber
                aria-label={`تعداد ${l.title}`}
                min={1}
                max={99}
                precision={0}
                value={l.quantity}
                onChange={(q) => {
                  if (q)
                    setLines(
                      lines.map((x) => (x.productId === l.productId ? { ...x, quantity: q } : x)),
                    );
                }}
              />
              <Button onClick={() => setLines(lines.filter((x) => x.productId !== l.productId))}>
                حذف
              </Button>
            </li>
          ))}
        </ul>
        <Form.Item label="کد تخفیف">
          <Input.Search
            value={couponDraft}
            onChange={(e) => setCouponDraft(e.target.value)}
            onSearch={() => setDiscountCode(couponDraft.trim())}
            enterButton="اعمال"
            maxLength={50}
          />
        </Form.Item>
        <Form.Item>
          <Checkbox checked={pickup} onChange={(e) => setPickup(e.target.checked)}>
            تحویل حضوری — بدون هزینه ارسال
          </Checkbox>
        </Form.Item>
        {!pickup && (
          <>
            <Form.Item label="شیوه ارسال">
              <Select
                value={method}
                onChange={setMethod}
                options={shippingMethods.map((value) => ({
                  value,
                  label: shippingMethodLabels[value],
                }))}
              />
            </Form.Item>
            <div className="grid gap-x-3 sm:grid-cols-2">
              {[
                ['recipientName', 'نام گیرنده'],
                ['recipientPhone', 'موبایل گیرنده'],
                ['province', 'استان'],
                ['city', 'شهر'],
                ['postalCode', 'کد پستی'],
                ['postalAddress', 'آدرس کامل'],
              ].map(([name, label]) => (
                <Form.Item key={name} name={name} label={label} rules={[{ required: true }]}>
                  <Input maxLength={name === 'postalAddress' ? 1000 : 100} />
                </Form.Item>
              ))}
            </div>
          </>
        )}
        {quote.error && <Alert type="error" title={quote.error} role="alert" />}
        {price && (
          <dl className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-[#f4e8d3] p-4 text-sm">
            {[
              ['جمع کالاها', price.subtotal],
              ['تخفیف', price.discount],
              ['ارسال', price.shipping],
              ['مبلغ سفارش', price.total],
            ].map(([label, amount]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd className="mt-2 font-bold">
                  <Money amount={Number(amount)} />
                </dd>
              </div>
            ))}
          </dl>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Form.Item label="مبلغ دریافت‌شده (تومان)" htmlFor="manual-received">
            <MoneyInput
              id="manual-received"
              value={received}
              onChange={(v) => setReceived(v ?? 0)}
            />
          </Form.Item>
          <Form.Item label="نوع پرداخت خارج از سایت">
            <Select
              disabled={!received || pending || !!submission}
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={offlinePaymentMethods.map((value) => ({
                value,
                label: offlinePaymentMethodLabels[value],
              }))}
            />
          </Form.Item>
        </div>
        <p className="mb-3 text-xs leading-6 text-[#76685d]">
          این دریافت توسط مدیر ثبت می‌شود. ماندهٔ پرداخت را می‌توانید بعداً در جزئیات سفارش ثبت
          کنید.
        </p>
        {error && <Alert className="!mb-3" type="error" title={error} role="alert" />}
        {submission ? (
          <div className="flex flex-wrap gap-2">
            <Button
              loading={pending}
              type="primary"
              disabled={pending}
              onClick={() => void submit({})}
            >
              تلاش دوباره برای ثبت همین سفارش
            </Button>
            <p className="text-xs leading-6">
              نتیجهٔ درخواست مشخص نشده است؛ برای جلوگیری از سفارش تکراری، همین درخواست را دوباره
              بررسی کنید.
            </p>
          </div>
        ) : (
          <Button
            type="primary"
            htmlType="submit"
            disabled={!price || !customerId}
            loading={pending}
          >
            ثبت نهایی سفارش
          </Button>
        )}
      </Form>
      {addCustomer && (
        <RetailCustomerModal
          onClose={() => setAddCustomer(false)}
          onSaved={(id) => {
            setCustomerId(id);
            setAddCustomer(false);
            customers.refresh();
          }}
        />
      )}
    </Modal>
  );
}
