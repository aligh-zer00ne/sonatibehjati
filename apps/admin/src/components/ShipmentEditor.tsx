import { useEffect, useRef, useState } from 'react';
import { Alert, App, Button, Input, Select } from 'antd';
import { formatNumber } from '@behjati/shared';
import { shipmentInputSchema } from '@behjati/shared/message-templates';
import { shippingMethodLabels, shippingMethods, type ShippingMethod } from '@behjati/shared/sales';
import { SaveAdminShipmentDocument, type AdminOrderFieldsFragment } from '../generated/graphql';
import { adminRequest } from '../lib/client';
import { customerName } from '../lib/format';
import CustomerMessage from './CustomerMessage';
import AdminIcon from './AdminIcon';

export default function ShipmentEditor({
  order,
  onSaved,
  onBusyChange,
  onDirtyChange,
}: {
  order: AdminOrderFieldsFragment;
  onSaved: () => void;
  onBusyChange: (busy: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [method, setMethod] = useState<ShippingMethod | undefined>(
    order.shippingMethod ?? undefined,
  );
  const [tracking, setTracking] = useState(order.shippingLabel?.trackingNumber ?? '');
  const [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [compose, setCompose] = useState(false);
  const lock = useRef(false);
  const { message } = App.useApp();
  const dirty =
    (method ?? null) !== (order.shippingMethod ?? null) ||
    tracking !== (order.shippingLabel?.trackingNumber ?? '');
  useEffect(() => {
    onBusyChange(pending || compose);
    return () => onBusyChange(false);
  }, [pending, compose, onBusyChange]);
  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);
  const terminal = ['CANCELED', 'DELIVERED'].includes(order.status);
  return (
    <section
      aria-label="ارسال و رهگیری سفارش"
      className="mb-4 space-y-3 rounded-2xl border border-[#e2d1af] bg-[#faf6ee] p-3"
    >
      <h4 className="flex items-center gap-2 text-base font-extrabold text-[#4e141c]">
        <AdminIcon name="truck" width={21} /> ارسال و رهگیری
      </h4>
      <div className="grid gap-3 sm:grid-cols-[1fr_1.5fr]">
        <label className="space-y-1.5 text-sm">
          روش ارسال
          <Select
            aria-label="روش ارسال مرسوله"
            className="!w-full"
            value={method}
            disabled={pending || terminal}
            placeholder="روش ارسال"
            options={shippingMethods.map((v) => ({ value: v, label: shippingMethodLabels[v] }))}
            onChange={setMethod}
          />
        </label>
        <label className="space-y-1.5 text-sm">
          کد رهگیری
          <Input
            aria-label="کد رهگیری مرسوله"
            value={tracking}
            maxLength={100}
            disabled={pending || terminal}
            dir="ltr"
            onChange={(e) => setTracking(e.target.value)}
            placeholder="کد ثبت‌شده در رسید شرکت حمل"
          />
        </label>
      </div>
      {error && <Alert role="alert" type="error" title={error} />}
      <div className="flex flex-wrap items-center gap-2">
        {!terminal && (
          <Button
            type="primary"
            loading={pending}
            disabled={(!dirty && (!tracking.trim() || order.status === 'SHIPPED')) || !method}
            icon={<AdminIcon name="check" />}
            onClick={async () => {
              if (lock.current) return;
              const input = shipmentInputSchema.safeParse({
                orderId: order.id,
                shippingMethod: method,
                trackingNumber: tracking,
                expectedUpdatedAt: order.updatedAt,
                expectedLabelUpdatedAt: order.shippingLabel?.updatedAt ?? null,
              });
              if (!input.success) {
                setError('روش ارسال و کد رهگیری معتبر را وارد کنید.');
                return;
              }
              lock.current = true;
              setPending(true);
              setError('');
              try {
                await adminRequest(SaveAdminShipmentDocument, { input: input.data });
                onSaved();
                void message.success(
                  input.data.trackingNumber
                    ? 'رهگیری ثبت شد؛ وضعیت سفارش ارسال‌شده است.'
                    : 'روش ارسال ثبت شد.',
                );
              } catch (e) {
                setError(e instanceof Error ? e.message : 'ثبت انجام نشد.');
              } finally {
                lock.current = false;
                setPending(false);
              }
            }}
          >
            ذخیره اطلاعات ارسال
          </Button>
        )}
        <Button
          disabled={
            pending ||
            dirty ||
            !order.shippingLabel?.trackingNumber ||
            !['SHIPPED', 'DELIVERED'].includes(order.status)
          }
          icon={<AdminIcon name="message" />}
          onClick={() => setCompose(true)}
        >
          ارسال پیام سفارش
        </Button>
      </div>
      <p className="text-[13px] leading-6 text-[#796653]">
        {terminal
          ? 'روش حمل و رهگیری این سفارش نهایی قابل ویرایش نیست.'
          : 'با ثبت کد رهگیری، وضعیت به «ارسال‌شده» تغییر می‌کند. روش حمل روی لیبل و متن پیام می‌آید.'}
      </p>
      {compose && (
        <CustomerMessage
          kind="SHIPPING"
          phone={order.address.recipientPhone || order.user.phone}
          values={{
            نام_مشتری: order.address.recipientName || customerName(order.user),
            شماره_سفارش: formatNumber(order.number),
            روش_ارسال: order.shippingMethod ? shippingMethodLabels[order.shippingMethod] : '',
            کد_رهگیری: order.shippingLabel?.trackingNumber ?? '',
          }}
          onClose={() => setCompose(false)}
        />
      )}
    </section>
  );
}
