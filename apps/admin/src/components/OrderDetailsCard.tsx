import ShipmentEditor from './ShipmentEditor';
import { useAdmin } from '../auth/AdminProvider';
import { hasPermission } from '@behjati/shared/permissions';
import AccountStatus from './AccountStatus';
import { formatAdminPrice as formatPrice } from '../lib/money';
import OfflineReceipts from './OfflineReceipts';
import { salesChannelLabels, shippingMethodLabels } from '@behjati/shared/sales';
import {
  lazy,
  Suspense,
  useId,
  useState,
  useEffect,
  useImperativeHandle,
  type Ref,
  type ReactNode,
} from 'react';
import { Alert, App, Button, Popconfirm, Select } from 'antd';
import { formatNumber, orderStatusLabels } from '@behjati/shared';
import { orderStatusTransitions } from '@behjati/shared/admin';
import { paymentStatusLabels, pendingPaymentStates } from '@behjati/shared/payments';
import {
  AdminOrderDocument,
  RetryAdminPaymentDocument,
  UpdateAdminOrderStatusDocument,
  type OrderStatus as Status,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest } from '../lib/client';
import { customerName, persianDigits, formatDateTime } from '../lib/format';
import AdminIcon, { type AdminIconName } from './AdminIcon';
import DataState from './DataState';
import OrderStatus from './OrderStatus';
import { Money } from './Money';

const Invoice = lazy(() => import('../pages/Invoice'));
const ShippingLabel = lazy(() => import('../pages/ShippingLabel'));

function OrderDetailTabs({
  activeKey,
  onChange,
  items,
}: {
  activeKey: string;
  onChange: (key: string) => void;
  items: Array<{ key: string; label: string; icon: ReactNode; children: ReactNode }>;
}) {
  const id = useId();
  return (
    <>
      <div
        role="tablist"
        aria-label="بخش‌های جزئیات سفارش"
        className={`mb-3 grid ${items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-2' : 'grid-cols-4'} gap-1 border-b border-[#e8ded1] pb-3 sm:gap-2`}
      >
        {items.map((item, index) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            id={`${id}-tab-${item.key}`}
            aria-selected={activeKey === item.key}
            aria-controls={`${id}-panel`}
            tabIndex={activeKey === item.key ? 0 : -1}
            onClick={() => onChange(item.key)}
            onKeyDown={(event) => {
              let next: number;
              if (event.key === 'ArrowLeft') next = (index + 1) % items.length;
              else if (event.key === 'ArrowRight') next = (index - 1 + items.length) % items.length;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = items.length - 1;
              else return;
              event.preventDefault();
              const target = items[next];
              if (!target) return;
              onChange(target.key);
              document.getElementById(`${id}-tab-${target.key}`)?.focus();
            }}
            className={`flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-xl border px-1 py-2 text-center text-[13px] leading-5 transition-colors sm:text-xs ${activeKey === item.key ? 'border-[#e5d1aa] bg-[#f4e8d3] font-bold text-[#701e2a]' : 'border-transparent text-[#76685d] hover:bg-[#fbf7ee]'}`}
          >
            <span className="hidden shrink-0 sm:inline-flex">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${activeKey}`}
        tabIndex={0}
        className="min-w-0"
      >
        {items.find((item) => item.key === activeKey)?.children}
      </div>
    </>
  );
}

function Field({
  label,
  icon,
  children,
  wide = false,
}: {
  label: string;
  icon: AdminIconName;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`min-w-0 rounded-xl bg-[#f4e8d3] p-3 ${wide ? 'sm:col-span-2' : ''}`}>
      <dt className="mb-1.5 flex items-center gap-1.5 text-[13px] text-[#76685d]">
        <AdminIcon name={icon} width={15} height={15} />
        {label}
      </dt>
      <dd className="break-words text-xs leading-6 font-medium text-[#62452f]">{children}</dd>
    </div>
  );
}

export type OrderDetailsHandle = { requestClose: () => void };
export default function OrderDetailsCard({
  id,
  onClose,
  onUpdated,
  inDialog = false,
  closeRef,
  onBusyChange,
}: {
  id: string;
  onClose?: () => void;
  onUpdated?: () => void;
  inDialog?: boolean;
  closeRef?: Ref<OrderDetailsHandle>;
  onBusyChange?: (busy: boolean) => void;
}) {
  const query = useAdminQuery(AdminOrderDocument, { id }, true, { keepPreviousData: true });
  const { admin } = useAdmin();
  const [shipmentBusy, setShipmentBusy] = useState(false);
  const [shipmentDirty, setShipmentDirty] = useState(false);
  const [printView, setPrintView] = useState<'invoice' | 'label' | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [pending, setPending] = useState(false);
  const [paymentPending, setPaymentPending] = useState<string | null>(null);
  const [tab, setTab] = useState('products');
  const { message, modal } = App.useApp();
  const order = query.data?.adminOrder;
  const busy = pending || shipmentBusy || Boolean(paymentPending) || Boolean(printView);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  const requestClose = () => {
    if (busy) return;
    if (shipmentDirty || (status && status !== order?.status)) {
      modal.confirm({
        title: shipmentDirty
          ? 'اطلاعات ارسال هنوز ذخیره نشده است'
          : 'وضعیت انتخاب‌شده ثبت نشده است',
        content: 'با بستن پنجره، تغییرهای ثبت‌نشده کنار گذاشته می‌شوند.',
        okText: 'بستن جزئیات',
        cancelText: 'ادامه بررسی',
        onOk: onClose,
      });
    } else onClose?.();
  };
  useImperativeHandle(closeRef, () => ({ requestClose }));
  return (
    <section
      aria-label="جزئیات سفارش"
      className={inDialog ? 'min-w-0' : 'min-w-0 border-t border-[#e8ded1] bg-[#fcf9f3] p-3 sm:p-5'}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-[#701e2a]">
            جزئیات سفارش {order && formatNumber(order.number)}
          </h3>
          <p className="mt-1 text-[13px] leading-6 text-[#76685d]">
            {order
              ? `${customerName(order.user)} · ${salesChannelLabels[order.salesChannel]} · ${formatDateTime(order.createdAt)}`
              : 'در حال دریافت اطلاعات سفارش'}
          </p>
        </div>
        {order && (!onClose || inDialog) && (
          <div className="ms-auto shrink-0">
            {order.salesChannel === 'WEBSITE' ? (
              <OrderStatus status={order.status} />
            ) : (
              <AccountStatus balance={order.total - order.offlinePaidAmount} amount={false} />
            )}
          </div>
        )}
        {onClose && !inDialog && (
          <Button
            type="text"
            aria-label="بستن جزئیات سفارش"
            onClick={requestClose}
            icon={<AdminIcon name="close" width={18} height={18} />}
            className="!min-h-11 !min-w-11 !text-[#76685d]"
          />
        )}
      </header>
      {!order ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <>
          {order.salesChannel === 'WEBSITE' && (
            <div className="mb-4 rounded-2xl border border-[#e8ded1] bg-[#faf6ee] p-3">
              <h4 className="mb-2 flex items-center gap-2 text-xs font-bold text-[#4e141c]">
                <AdminIcon name="edit" width={17} height={17} />
                تغییر وضعیت سفارش
              </h4>
              <p className="mb-3 text-[13px] leading-6 text-[#76685d]">
                تغییر وضعیت فقط عملیات سفارش را ثبت می‌کند و تأیید یا ثبت پرداخت نیست.
              </p>
              {orderStatusTransitions[order.status].length ? (
                <div className="flex flex-wrap gap-2">
                  <Select<Status>
                    aria-label="وضعیت جدید سفارش"
                    className="min-w-0 flex-1 sm:max-w-64"
                    placeholder="وضعیت جدید"
                    value={status}
                    disabled={pending}
                    onChange={setStatus}
                    options={orderStatusTransitions[order.status].map((value) => ({
                      value,
                      label: orderStatusLabels[value],
                    }))}
                  />
                  <Popconfirm
                    title="تغییر وضعیت سفارش تأیید شود؟"
                    okText="تأیید"
                    cancelText="انصراف"
                    disabled={!status || pending}
                    onConfirm={async () => {
                      if (!status || pending) return;
                      setPending(true);
                      try {
                        await adminRequest(UpdateAdminOrderStatusDocument, {
                          input: { id, status, expectedStatus: order.status },
                        });
                        setStatus(null);
                        query.refresh();
                        onUpdated?.();
                        void message.success('وضعیت سفارش ثبت شد.');
                      } catch (error) {
                        void message.error(
                          error instanceof Error ? error.message : 'وضعیت تغییر نکرد.',
                        );
                        setStatus(null);
                        query.refresh();
                        onUpdated?.();
                      } finally {
                        setPending(false);
                      }
                    }}
                  >
                    <Button
                      type="primary"
                      icon={<AdminIcon name="edit" width={16} height={16} />}
                      disabled={!status}
                      loading={pending}
                    >
                      ثبت وضعیت
                    </Button>
                  </Popconfirm>
                </div>
              ) : (
                <p className="text-xs text-[#76685d]">این سفارش به وضعیت نهایی رسیده است.</p>
              )}
            </div>
          )}
          {order.salesChannel !== 'IN_PERSON' && hasPermission(admin, 'ORDERS') && (
            <ShipmentEditor
              key={order.updatedAt}
              order={order}
              onBusyChange={setShipmentBusy}
              onDirtyChange={setShipmentDirty}
              onSaved={() => {
                query.refresh();
                onUpdated?.();
              }}
            />
          )}
          <OrderDetailTabs
            activeKey={order.salesChannel !== 'IN_PERSON' ? tab : 'products'}
            onChange={setTab}
            items={[
              {
                key: 'products',
                label: 'محصولات',
                icon: <AdminIcon name="products" width={16} height={16} />,
                children: (
                  <div className="grid items-start gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                    <ul
                      aria-label="محصولات هنگام ثبت سفارش"
                      className="min-w-0 divide-y divide-[#eee5d9] rounded-2xl border border-[#e8ded1] px-3"
                    >
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-start gap-3 py-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f4e8d3] text-[#b7825b]">
                            <AdminIcon name="products" width={20} height={20} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-xs leading-6 font-bold text-[#62452f]">
                              {item.productTitle}
                            </p>
                            <p className="text-[13px] leading-6 text-[#76685d]">
                              {item.productWeight} · {formatNumber(item.quantity)} عدد
                            </p>
                            <div className="mt-1 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[13px] leading-6">
                              <span className="text-[#76685d]">
                                قیمت واحد: {formatPrice(item.unitPrice)}
                              </span>
                              <span className="font-bold text-[#4e141c]">
                                {formatPrice(item.lineTotal)}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="rounded-2xl bg-[#fbf7ee] p-4">
                      <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-[#4e141c]">
                        <AdminIcon name="receipt" width={17} height={17} />
                        خلاصه هزینه‌ها
                      </h4>
                      <dl className="space-y-2 text-xs leading-6 text-[#76685d]">
                        {(
                          [
                            ['جمع محصولات', order.subtotal],
                            ['تخفیف', order.discount],
                            ['هزینه ارسال', order.shipping],
                          ] as const
                        ).map(([label, amount]) => (
                          <div key={label} className="flex flex-wrap justify-between gap-x-3">
                            <dt>{label}</dt>
                            <dd className="font-medium text-[#62452f]">{formatPrice(amount)}</dd>
                          </div>
                        ))}
                        <div className="border-t border-dashed border-[#e5d7c2] pt-3">
                          <dt className="mb-1">مبلغ سفارش</dt>
                          <dd className="text-base font-bold text-[#701e2a]">
                            <Money amount={order.total} />
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                ),
              },
              {
                key: 'shipping',
                label: 'مشتری و ارسال',
                icon: <AdminIcon name="truck" width={16} height={16} />,
                children: (
                  <dl className="grid gap-2 sm:grid-cols-2">
                    <Field label="محل خرید" icon="orders">
                      {salesChannelLabels[order.salesChannel ?? 'WEBSITE']}
                    </Field>
                    <Field label="روش تحویل" icon="truck">
                      {order.shippingMethod
                        ? shippingMethodLabels[order.shippingMethod]
                        : 'تحویل حضوری'}
                    </Field>
                    <Field label="مشتری" icon="person">
                      {customerName(order.user)}
                    </Field>
                    <Field label="موبایل مشتری" icon="phone">
                      <a href={`tel:${order.user.phone}`}>
                        <bdi>{persianDigits(order.user.phone)}</bdi>
                      </a>
                    </Field>
                    <Field label="گیرنده هنگام ثبت" icon="person">
                      {order.address.recipientName || 'ثبت نشده'}
                    </Field>
                    <Field label="موبایل گیرنده" icon="phone">
                      {order.address.recipientPhone ? (
                        <a href={`tel:${order.address.recipientPhone}`}>
                          <bdi>{persianDigits(order.address.recipientPhone)}</bdi>
                        </a>
                      ) : (
                        'ثبت نشده'
                      )}
                    </Field>
                    <Field label="نشانی هنگام ثبت" icon="pin" wide>
                      {[order.address.province, order.address.city, order.address.postalAddress]
                        .filter(Boolean)
                        .join('، ') || 'ثبت نشده'}
                    </Field>
                    <Field label="کد پستی" icon="receipt">
                      {order.address.postalCode ? (
                        <bdi>{persianDigits(order.address.postalCode)}</bdi>
                      ) : (
                        'ثبت نشده'
                      )}
                    </Field>
                    <Field label="تاریخ ثبت سفارش" icon="calendar">
                      {formatDateTime(order.createdAt)}
                    </Field>
                    {order.shippingLabel && (
                      <>
                        <Field label="روش ارسال / شرکت حمل" icon="truck">
                          {order.shippingLabel.carrier || 'ثبت نشده'}
                        </Field>
                        <Field label="کد رهگیری" icon="receipt">
                          {order.shippingLabel.trackingNumber ? (
                            <bdi>{persianDigits(order.shippingLabel.trackingNumber)}</bdi>
                          ) : (
                            'ثبت نشده'
                          )}
                        </Field>
                      </>
                    )}
                  </dl>
                ),
              },
              {
                key: 'payments',
                label: 'پرداخت‌ها',
                icon: <AdminIcon name="wallet" width={16} height={16} />,
                children: (
                  <div className="space-y-3">
                    <OfflineReceipts
                      order={order}
                      onUpdated={() => {
                        query.refresh();
                        onUpdated?.();
                      }}
                    />
                    <div
                      className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${order.paidAt ? 'bg-[#f4e8d3] text-[#701e2a]' : 'bg-[#faf2df] text-[#816422]'}`}
                    >
                      <AdminIcon name="shield" width={18} height={18} />
                      {order.paidAt ? 'پرداخت بانک تأیید شده است' : 'پرداخت بانک تأیید نشده است'}
                    </div>
                    {order.payments.length ? (
                      order.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e8ded1] p-3 text-xs leading-6"
                        >
                          <div className="min-w-0 break-words">
                            <p className="font-bold text-[#4e141c]">
                              {paymentStatusLabels[payment.status]}
                              {payment.bankCode != null && payment.status === 'TOKEN_FAILED'
                                ? ` · کد بانک: ${payment.bankCode}`
                                : ''}
                            </p>
                            <p className="text-[#76685d]">
                              رسید بانک: <bdi>{payment.reference ?? '—'}</bdi>
                            </p>
                            <p className="text-[#76685d]">
                              پیگیری: <bdi>{payment.rrn ?? payment.traceNumber ?? '—'}</bdi>
                            </p>
                          </div>
                          {pendingPaymentStates.includes(payment.status) &&
                            (payment.status !== 'REVIEW_REQUIRED' ||
                              [
                                'VERIFICATION_UNRESOLVED',
                                'REFUND_UNCONFIRMED',
                                'BANK_DETAILS_MISMATCH',
                              ].includes(payment.reason ?? '')) && (
                              <Button
                                icon={<AdminIcon name="history" width={16} height={16} />}
                                loading={paymentPending === payment.id}
                                disabled={paymentPending !== null}
                                onClick={async () => {
                                  setPaymentPending(payment.id);
                                  try {
                                    await adminRequest(RetryAdminPaymentDocument, {
                                      paymentId: payment.id,
                                    });
                                    query.refresh();
                                    onUpdated?.();
                                  } catch (error) {
                                    void message.error(
                                      error instanceof Error ? error.message : 'بررسی انجام نشد.',
                                    );
                                  } finally {
                                    setPaymentPending(null);
                                  }
                                }}
                              >
                                پیگیری بانک
                              </Button>
                            )}
                        </div>
                      ))
                    ) : (
                      <p className="py-3 text-xs text-[#76685d]">
                        تراکنشی برای این سفارش ثبت نشده است.
                      </p>
                    )}
                  </div>
                ),
              },
              {
                key: 'history',
                label: 'تاریخچه',
                icon: <AdminIcon name="history" width={16} height={16} />,
                children: order.statusEvents.length ? (
                  <ol aria-label="تاریخچه وضعیت سفارش" className="space-y-3">
                    {order.statusEvents.map((event) => (
                      <li
                        key={event.id}
                        className="flex items-start gap-3 rounded-xl bg-[#fbf7ee] p-3"
                      >
                        <AdminIcon
                          name="history"
                          className="mt-1 shrink-0 text-[#b7825b]"
                          width={18}
                          height={18}
                        />
                        <div className="min-w-0 text-xs leading-6">
                          <p className="font-medium text-[#4e141c]">
                            {orderStatusLabels[event.fromStatus]} ←{' '}
                            {orderStatusLabels[event.toStatus]}
                          </p>
                          <p className="break-words text-[13px] text-[#76685d]">
                            {formatDateTime(event.createdAt)} · <bdi>{event.admin.email}</bdi>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="py-3 text-xs text-[#76685d]">هنوز تغییری توسط مدیر ثبت نشده است.</p>
                ),
              },
            ].filter(
              (item) =>
                order.salesChannel === 'WEBSITE' ||
                item.key === 'products' ||
                (order.salesChannel === 'INSTAGRAM' && item.key === 'shipping'),
            )}
          />
          <div
            className={`mt-4 grid grid-cols-2 gap-2 border-t border-dashed border-[#e8ded1] pt-3 ${inDialog ? 'sticky -bottom-3 z-10 rounded-xl bg-white/95 pb-3 backdrop-blur-sm sm:-bottom-5 sm:pb-5' : ''}`}
          >
            <Button
              className="!h-auto !min-h-11 !whitespace-normal !border-[#e5d7c2] !bg-[#f4e8d3] !px-2 !py-2 !text-xs !text-[#4e141c]"
              icon={<AdminIcon name="truck" width={18} height={18} />}
              onClick={() => setPrintView('label')}
            >
              لیبل پستی / چاپ
            </Button>
            <Button
              className="!h-auto !min-h-11 !whitespace-normal !border-[#e5d7c2] !bg-[#f4e8d3] !px-2 !py-2 !text-xs !text-[#4e141c]"
              icon={<AdminIcon name="print" width={18} height={18} />}
              onClick={() => setPrintView('invoice')}
            >
              چاپ فاکتور / PDF
            </Button>
          </div>
          <Suspense
            fallback={<Alert className="!mt-3" type="info" title="در حال آماده‌سازی چاپ…" />}
          >
            {printView === 'invoice' && (
              <Invoice order={order} onClose={() => setPrintView(null)} />
            )}
            {printView === 'label' && (
              <ShippingLabel order={order} onClose={() => setPrintView(null)} />
            )}
          </Suspense>
        </>
      )}
    </section>
  );
}
