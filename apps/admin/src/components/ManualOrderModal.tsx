import { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Modal, Select } from 'antd';
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
import ManualOrderLines from './ManualOrderLines';
import DashboardProductImage from './DashboardProductImage';
import { formatAdminPrice } from '../lib/money';
import { formatNumber } from '@behjati/shared';
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
      width={1200}
      style={{ top: 24 }}
      footer={null}
      maskClosable={false}
      onCancel={() => {
        if (!pending) onClose();
      }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={submit} disabled={pending || !!submission}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_200px_auto]">
          <Form.Item label="مشتری" className="!col-span-2 !mb-3 sm:!col-span-1">
            <Select
              aria-label="مشتری سفارش دستی"
              placeholder="نام یا شماره موبایل مشتری"
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
          <Form.Item label="محل خرید" htmlFor="manual-channel" className="!mb-3">
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
          {hasPermission(admin, 'CUSTOMERS') && (
            <Button
              className="!mb-3 self-end"
              disabled={pending || !!submission}
              onClick={() => setAddCustomer(true)}
            >
              افزودن مشتری جدید
            </Button>
          )}
        </div>
        <section
          className="mb-5 rounded-xl border border-[#ddd3c5] bg-[#faf8f4]"
          aria-label="انتخاب کالا و اقلام فاکتور"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8ded1] px-4 py-3">
            <h3 className="flex items-center gap-2 font-bold">
              <AdminIcon name="products" className="text-[#701e2a]" />
              اقلام فاکتور
            </h3>
            <span className="rounded-full bg-[#f4e8d3] px-3 py-1 text-xs text-[#62452f]">
              {formatNumber(lines.length)} نوع کالا ·{' '}
              {formatNumber(lines.reduce((sum, l) => sum + l.quantity, 0))} عدد
            </span>
          </div>
          <div className="px-3 pt-3 pb-4 sm:px-4">
            <label
              className="mb-2 block text-xs font-semibold text-[#76685d]"
              htmlFor="invoice-product-search"
            >
              جستجو و افزودن کالا
            </label>
            <Select<string>
              id="invoice-product-search"
              aria-label="محصول سفارش دستی"
              className="w-full"
              size="large"
              virtual={false}
              showSearch
              allowClear
              filterOption={false}
              placeholder="نام کالا را بنویسید و به فاکتور اضافه کنید…"
              prefix={<AdminIcon name="search" width={20} className="text-[#701e2a]" />}
              value={null}
              searchValue={productTerm}
              onSearch={setProductTerm}
              loading={!products.data && !products.error}
              notFoundContent={
                products.error ? (
                  <span role="alert">
                    {products.error}
                    <Button size="small" onClick={products.refresh}>
                      تلاش مجدد
                    </Button>
                  </span>
                ) : products.data ? (
                  'کالایی با این نام پیدا نشد.'
                ) : (
                  'در حال جستجوی کالا…'
                )
              }
              options={(products.data?.catalog.items ?? []).map((p) => ({
                value: p.id,
                label: `${p.title} · ${p.weight}`,
              }))}
              optionRender={(option) => {
                const p = products.data?.catalog.items.find((p) => p.id === option.value);
                if (!p) return option.label;
                const line = lines.find((l) => l.productId === p.id);
                return (
                  <div className="flex items-center gap-3 py-1" data-product-result={p.id}>
                    <DashboardProductImage src={p.images[0]?.url} title={p.title} />
                    <div className="min-w-0 flex-1">
                      <b className="block whitespace-normal text-sm">{p.title}</b>
                      <span className="text-xs text-[#76685d]">
                        {p.weight} · {formatAdminPrice(p.price)}
                      </span>
                    </div>
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f4e8d3] text-[#701e2a]">
                      {line ? formatNumber(line.quantity) : <AdminIcon name="plus" width={17} />}
                    </span>
                  </div>
                );
              }}
              onSelect={(id) => {
                const p = products.data?.catalog.items.find((p) => p.id === id);
                if (!p) return;
                setLines((value) => {
                  const line = value.find((l) => l.productId === id);
                  return line
                    ? value.map((l) =>
                        l.productId === id ? { ...l, quantity: Math.min(99, l.quantity + 1) } : l,
                      )
                    : [
                        ...value,
                        {
                          productId: id,
                          title: p.title,
                          quantity: 1,
                          unitPrice: p.price,
                          discountKind: 'FIXED',
                          discountValue: 0,
                        },
                      ];
                });
                setProductTerm('');
              }}
            />
          </div>
          <div className="px-3 pb-3 sm:px-4">
            <p className="mb-2 text-xs text-[#857467]">همهٔ مبالغ به ریال است</p>
            <ManualOrderLines
              lines={lines}
              updateLine={updateLine}
              removeLine={(id) => setLines((value) => value.filter((l) => l.productId !== id))}
            />
          </div>
        </section>
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
          <dl className="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-[#e3d4bd] bg-[#f8f0e1] p-3 text-sm lg:grid-cols-4">
            {[
              ['جمع کالاها', price.subtotal],
              ['تخفیف', price.discount],
              ['ارسال', price.shipping],
              ['مبلغ سفارش', price.total],
            ].map(([label, amount]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd className="mt-2 font-bold">
                  <Money compact amount={Number(amount)} />
                </dd>
              </div>
            ))}
          </dl>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Form.Item label="مبلغ دریافت‌شده (ریال)" htmlFor="manual-received">
            <MoneyInput
              id="manual-received"
              compact
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
