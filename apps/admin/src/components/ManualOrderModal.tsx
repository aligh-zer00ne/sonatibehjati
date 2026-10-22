import { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, InputNumber, Modal, Select } from 'antd';
import { manualOrderInputSchema, manualQuoteInputSchema } from '@behjati/shared/admin';
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
import AdminIcon from './AdminIcon';
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
  const [lines, setLines] = useState<
    Array<{
      productId: string;
      title: string;
      quantity: number;
      unitPrice: number;
      discountKind: 'PERCENT' | 'FIXED';
      discountValue: number;
    }>
  >([]);
  const [channel, setChannel] = useState<SalesChannel>('IN_PERSON');
  const [pickup, setPickup] = useState(true);
  const [method, setMethod] = useState<ShippingMethod>('POST');
  const [received, setReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<OfflinePaymentMethod>('POS');
  const [shippingCost, setShippingCost] = useState(0);
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
    items: lines.map(({ productId, quantity, unitPrice, discountKind, discountValue }) => ({
      productId,
      quantity,
      unitPrice,
      ...(discountKind === 'PERCENT'
        ? { discountPercent: discountValue }
        : { discountAmount: discountValue }),
    })),
    manualShippingCost: shippingCost,
    shippingMethod: method,
    pickup,
  };
  const validQuote = manualQuoteInputSchema.safeParse(quoteInput);
  const quote = useAdminQuery(
    AdminManualQuoteDocument,
    { input: quoteInput },
    lines.length > 0 && validQuote.success,
  );
  const price = quote.data?.adminManualQuote;
  useEffect(() => {
    const customer = selected.data?.adminOrderCustomer;
    if (!customer || pickup) return;
    form.setFieldsValue(
      customer.defaultAddress ?? {
        recipientName: [customer.firstName, customer.lastName].filter(Boolean).join(' '),
        recipientPhone: customer.phone,
        province: '',
        city: '',
        postalCode: '',
        postalAddress: '',
      },
    );
  }, [selected.data, pickup, form]);
  function updateLine(id: string, patch: Partial<(typeof lines)[number]>) {
    setLines((value) =>
      value.map((line) => (line.productId === id ? { ...line, ...patch } : line)),
    );
  }
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
          <Form.Item label="محل خرید" htmlFor="manual-channel">
            <Select
              id="manual-channel"
              value={channel}
              onChange={(value) => {
                setChannel(value);
                setPickup(value === 'IN_PERSON');
              }}
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
                setLines([
                  ...lines,
                  {
                    productId: id,
                    title: p.title,
                    quantity: 1,
                    unitPrice: p.price,
                    discountKind: 'FIXED',
                    discountValue: 0,
                  },
                ]);
            }}
          />
        </Form.Item>
        <ul className="mb-4 space-y-3">
          {lines.map((l) => (
            <li key={l.productId} className="rounded-2xl border border-[#e8ded1] bg-[#fcf9f3] p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <b className="min-w-0 break-words text-sm">{l.title}</b>
                <Button
                  type="text"
                  danger
                  aria-label={`حذف ${l.title}`}
                  icon={<AdminIcon name="trash" width={18} />}
                  onClick={() => setLines(lines.filter((x) => x.productId !== l.productId))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs" htmlFor={`qty-${l.productId}`}>
                    تعداد
                  </label>
                  <InputNumber
                    id={`qty-${l.productId}`}
                    aria-label={`تعداد ${l.title}`}
                    className="!w-full"
                    min={1}
                    max={99}
                    precision={0}
                    value={l.quantity}
                    onChange={(v) => {
                      if (v) updateLine(l.productId, { quantity: v });
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs" htmlFor={`unit-${l.productId}`}>
                    قیمت واحد (ریال)
                  </label>
                  <MoneyInput
                    id={`unit-${l.productId}`}
                    value={l.unitPrice}
                    onChange={(v) => updateLine(l.productId, { unitPrice: v ?? 0 })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs" htmlFor={`total-${l.productId}`}>
                    قیمت کل (ریال)
                  </label>
                  <MoneyInput
                    id={`total-${l.productId}`}
                    value={l.unitPrice * l.quantity}
                    onChange={(v) => updateLine(l.productId, { unitPrice: (v ?? 0) / l.quantity })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs">نوع تخفیف ردیف</label>
                  <Select
                    aria-label={`نوع تخفیف ${l.title}`}
                    className="w-full"
                    value={l.discountKind}
                    options={[
                      { value: 'FIXED', label: 'مبلغی (ریال)' },
                      { value: 'PERCENT', label: 'درصدی' },
                    ]}
                    onChange={(discountKind) =>
                      updateLine(l.productId, { discountKind, discountValue: 0 })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs" htmlFor={`discount-${l.productId}`}>
                    مقدار تخفیف
                  </label>
                  {l.discountKind === 'FIXED' ? (
                    <MoneyInput
                      id={`discount-${l.productId}`}
                      value={l.discountValue}
                      onChange={(v) => updateLine(l.productId, { discountValue: v ?? 0 })}
                    />
                  ) : (
                    <InputNumber
                      id={`discount-${l.productId}`}
                      aria-label={`درصد تخفیف ${l.title}`}
                      className="!w-full"
                      min={0}
                      max={100}
                      precision={2}
                      value={l.discountValue}
                      onChange={(v) => updateLine(l.productId, { discountValue: v ?? 0 })}
                    />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {lines.length > 0 && !validQuote.success && (
          <Alert
            className="!mb-3"
            type="error"
            title="قیمت کل باید با تعداد و قیمت واحد سازگار باشد؛ مبالغ را با دقت ده ریال وارد کنید."
            role="alert"
          />
        )}
        {!pickup && (
          <>
            <Form.Item label="هزینهٔ ارسال بسته (ریال)" htmlFor="manual-shipping-cost">
              <MoneyInput
                id="manual-shipping-cost"
                value={shippingCost}
                onChange={(v) => setShippingCost(v ?? 0)}
              />
            </Form.Item>
            <Form.Item label="شیوه ارسال" htmlFor="manual-carrier">
              <Select
                id="manual-carrier"
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
          <Form.Item label="مبلغ دریافت‌شده (ریال)" htmlFor="manual-received">
            <MoneyInput
              id="manual-received"
              value={received}
              onChange={(v) => setReceived(v ?? 0)}
            />
          </Form.Item>
          <Form.Item label="نوع پرداخت خارج از سایت" htmlFor="manual-payment-method">
            <Select
              id="manual-payment-method"
              disabled={!received || pending || !!submission}
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={offlinePaymentMethods
                .filter((value) => value !== 'CHECK')
                .map((value) => ({
                  value,
                  label: offlinePaymentMethodLabels[value],
                }))}
            />
          </Form.Item>
        </div>
        <p className="mb-3 text-xs leading-6 text-[#76685d]">
          این دریافت توسط مدیر ثبت می‌شود. دریافت‌های بعدی و چک را در بخش «دریافت و پرداخت» ثبت
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
          defaultChannel={channel === 'INSTAGRAM' ? 'INSTAGRAM' : 'IN_PERSON'}
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
