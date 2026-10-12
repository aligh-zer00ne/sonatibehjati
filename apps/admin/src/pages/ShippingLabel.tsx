import { useState } from 'react';
import { Alert, App, Button, Card, Form, Input, Select, Modal } from 'antd';
import { BRAND_NAME, formatNumber } from '@behjati/shared';
import { shippingLabelSchema, type ShippingLabelValues } from '@behjati/shared/admin';
import {
  SaveAdminShippingLabelDocument,
  type AdminOrderFieldsFragment,
} from '../generated/graphql';
import { adminRequest } from '../lib/client';
import PrintSheet from '../components/PrintSheet';
import AdminIcon from '../components/AdminIcon';
import ShippingLabelSheet from '../components/ShippingLabelSheet';

function defaults(order: AdminOrderFieldsFragment): ShippingLabelValues {
  const a = order.address;
  return {
    senderName: BRAND_NAME,
    senderPhone: '',
    senderAddress: '',
    senderPostalCode: '',
    recipientName: a.recipientName ?? '',
    recipientPhone: a.recipientPhone ?? order.user.phone,
    recipientAddress: [a.province, a.city, a.postalAddress].filter(Boolean).join('، '),
    recipientPostalCode: a.postalCode ?? '',
    carrier: 'پست',
    trackingNumber: '',
    packageWeight: '',
    packageContent: order.items
      .map((item) => `${item.productTitle} (${formatNumber(item.quantity)} عدد)`)
      .join('، ')
      .slice(0, 300),
    note: '',
    paperSize: 'THERMAL',
  };
}
export default function ShippingLabel({
  order,
  onClose,
}: {
  order: AdminOrderFieldsFragment;
  onClose: () => void;
}) {
  const [form] = Form.useForm<ShippingLabelValues>();
  const initial = order.shippingLabel
    ? (Object.fromEntries(
        Object.entries(order.shippingLabel).filter(
          ([key]) => key !== 'updatedAt' && key !== '__typename',
        ),
      ) as ShippingLabelValues)
    : defaults(order);
  const watched = Form.useWatch([], form);
  const values: ShippingLabelValues = { ...initial, ...watched };
  const [version, setVersion] = useState(order.shippingLabel?.updatedAt ?? null);
  const [pending, setPending] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const { message, modal } = App.useApp();
  const field = (
    name: keyof ShippingLabelValues,
    label: string,
    max: number,
    multiline = false,
  ) => (
    <Form.Item
      name={name}
      label={label}
      rules={[
        {
          required: ['senderName', 'recipientName', 'recipientAddress'].includes(name),
          message: `${label} را وارد کنید.`,
        },
      ]}
    >
      {multiline ? (
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} maxLength={max} />
      ) : (
        <Input
          maxLength={max}
          dir={
            name.includes('Phone') || name.includes('Postal') || name === 'trackingNumber'
              ? 'ltr'
              : undefined
          }
        />
      )}
    </Form.Item>
  );
  const sheet = <ShippingLabelSheet order={order} values={values} />;

  return (
    <Modal
      open
      title={`لیبل پستی سفارش ${formatNumber(order.number)}`}
      footer={null}
      width={1100}
      maskClosable={false}
      keyboard={false}
      closable={!pending && !printing}
      onCancel={() => {
        if (!dirty) return onClose();
        modal.confirm({
          title: 'تغییرات لیبل ذخیره نشده است. بستن پنجره؟',
          okText: 'بستن بدون ذخیره',
          cancelText: 'ادامه ویرایش',
          onOk: onClose,
        });
      }}
    >
      <Alert
        type="info"
        showIcon
        className="!mb-5 print:!hidden"
        title="اطلاعات از نشانی هنگام ثبت سفارش پر شده است. تغییر لیبل، نشانی سفارش را تغییر نمی‌دهد."
      />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(330px,0.8fr)_minmax(0,1.2fr)] print:block">
        <Card className="print:!hidden" title="شخصی‌سازی لیبل">
          <Form
            form={form}
            layout="vertical"
            initialValues={initial}
            onValuesChange={() => setDirty(true)}
            onFinish={async (raw) => {
              if (pending) return;
              const parsed = shippingLabelSchema.safeParse(raw);
              if (!parsed.success) {
                setError(parsed.error.issues[0]?.message ?? 'اطلاعات لیبل را بررسی کنید.');
                return;
              }
              setPending(true);
              setError('');
              try {
                const result = await adminRequest(SaveAdminShippingLabelDocument, {
                  orderId: order.id,
                  input: parsed.data,
                  expectedUpdatedAt: version,
                });
                setVersion(result.saveAdminShippingLabel.updatedAt);
                form.setFieldsValue(parsed.data);
                setDirty(false);
                void message.success('لیبل این سفارش ذخیره شد.');
              } catch (error) {
                setError(error instanceof Error ? error.message : 'لیبل ذخیره نشد.');
              } finally {
                setPending(false);
              }
            }}
          >
            <h2 className="mb-3 font-bold text-[#810c20]">فرستنده</h2>
            <div className="grid gap-x-4 sm:grid-cols-2">
              {field('senderName', 'نام فرستنده', 120)}
              {field('senderPhone', 'تلفن فرستنده', 30)}
              {field('senderPostalCode', 'کد پستی فرستنده', 10)}
            </div>
            {field('senderAddress', 'نشانی فرستنده', 600, true)}
            <h2 className="mt-2 mb-3 font-bold text-[#810c20]">گیرنده</h2>
            <div className="grid gap-x-4 sm:grid-cols-2">
              {field('recipientName', 'نام گیرنده', 120)}
              {field('recipientPhone', 'تلفن گیرنده', 30)}
              {field('recipientPostalCode', 'کد پستی گیرنده', 10)}
            </div>
            {field('recipientAddress', 'نشانی گیرنده', 600, true)}
            <h2 className="mt-2 mb-3 font-bold text-[#810c20]">اطلاعات بسته</h2>
            <div className="grid gap-x-4 sm:grid-cols-2">
              {field('carrier', 'روش ارسال / شرکت حمل', 80)}
              {field('trackingNumber', 'کد رهگیری (اختیاری)', 100)}
              {field('packageWeight', 'وزن بسته', 80)}
              <Form.Item name="paperSize" label="اندازه چاپ">
                <Select
                  options={[
                    { value: 'THERMAL', label: 'لیبل ۱۵ × ۱۰ سانتی‌متر (افقی)' },
                    { value: 'A5', label: 'کاغذ A5' },
                  ]}
                />
              </Form.Item>
            </div>
            {field('packageContent', 'محتویات بسته (اختیاری)', 300, true)}
            {field('note', 'یادداشت روی بسته (اختیاری)', 200, true)}
            {error && <Alert type="error" role="alert" title={error} className="!mb-4" />}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="primary" htmlType="submit" loading={pending}>
                ذخیره لیبل سفارش
              </Button>
              <span className="text-xs text-[#7d746a]">
                {dirty ? 'تغییرات ذخیره نشده' : version ? 'لیبل ذخیره شده' : 'لیبل هنوز ذخیره نشده'}
              </span>
            </div>
          </Form>
        </Card>
        <section className="min-w-0 print:m-0">
          <div className="mb-4 flex flex-wrap items-center gap-3 print:!hidden">
            <h2 className="font-bold">پیش‌نمایش چاپ</h2>
            <Button
              icon={<AdminIcon name="print" />}
              loading={printing}
              disabled={pending}
              onClick={async () => {
                const parsed = shippingLabelSchema.safeParse(form.getFieldsValue(true));
                if (!parsed.success) {
                  setError(parsed.error.issues[0]?.message ?? 'اطلاعات را بررسی کنید.');
                  return;
                }
                setPrinting(true);
                try {
                  await document.fonts.ready;
                  await Promise.all(
                    Array.from(
                      document.querySelectorAll<HTMLImageElement>('[data-shipping-label] img'),
                      (image) => image.decode().catch(() => {}),
                    ),
                  );
                  window.print();
                } finally {
                  setPrinting(false);
                }
              }}
            >
              چاپ لیبل / PDF
            </Button>
          </div>
          <div data-shipping-label>{sheet}</div>
          <PrintSheet
            size={values.paperSize === 'A5' ? 'A5 landscape' : '150mm 100mm'}
            margin="4mm"
          >
            {sheet}
          </PrintSheet>
          <p className="mt-3 text-xs text-[#7d746a] print:!hidden">
            چاپ شامل پیش‌نمایش فعلی است. برای نگهداری تغییرات، «ذخیره لیبل سفارش» را بزنید.
          </p>
        </section>
      </div>
    </Modal>
  );
}
