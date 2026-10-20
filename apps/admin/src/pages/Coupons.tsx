import AdminIcon from '../components/AdminIcon';
import RecordCards from '../components/RecordCards';
import { useState } from 'react';
import {
  Alert,
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Tag,
  Typography,
} from 'antd';
import { formatDate, formatNumber } from '@behjati/shared';
import { couponInput } from '@behjati/shared/operations';
import {
  AdminCouponsDocument,
  SaveAdminCouponDocument,
  type AdminCouponFieldsFragment,
} from '../generated/graphql';
import { adminRequest } from '../lib/client';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { Money, MoneyInput } from '../components/Money';
import CalendarPicker from '../components/CalendarPicker';
import DataState from '../components/DataState';
export default function Coupons() {
  const query = useAdminQuery(AdminCouponsDocument, {});
  const [editing, setEditing] = useState<AdminCouponFieldsFragment | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const type = Form.useWatch('type', form);
  function edit(coupon: AdminCouponFieldsFragment | null) {
    setEditing(coupon);
    setError('');
    form.resetFields();
    form.setFieldsValue(
      coupon ?? {
        type: 'PERCENT',
        value: 10,
        minOrderAmount: 0,
        isActive: true,
        startsAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    );
    setOpen(true);
  }
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography.Title level={2}>کدهای تخفیف سفارش</Typography.Title>
        <Button type="primary" onClick={() => edit(null)}>
          کد تخفیف جدید
        </Button>
      </div>
      <Alert
        type="info"
        title="کد روی مبلغ کالاهای سفارش، پس از تخفیف محصول، اعمال می‌شود و هزینهٔ ارسال را تغییر نمی‌دهد. سقف استفاده هنگام ثبت سفارش کنترل می‌شود."
      />
      {!query.data ? (
        <DataState error={query.error} retry={query.refresh} />
      ) : (
        <RecordCards
          rowKey="id"
          icon="discount"
          label="فهرست کدهای تخفیف"
          featuredField="تخفیف"
          dataSource={query.data.adminCoupons}
          columns={[
            { title: 'کد', render: (_, row) => <bdi className="font-bold">{row.code}</bdi> },
            {
              title: 'تخفیف',
              render: (_, row) =>
                row.type === 'PERCENT' ? (
                  `${formatNumber(row.value)}٪`
                ) : (
                  <Money amount={row.value} />
                ),
            },
            { title: 'حداقل خرید', render: (_, row) => <Money amount={row.minOrderAmount} /> },
            {
              title: 'شروع / پایان',
              render: (_, row) => (
                <span>
                  {formatDate(row.startsAt)}
                  <br />
                  {formatDate(row.expiresAt)}
                </span>
              ),
            },
            {
              title: 'استفاده',
              render: (_, row) =>
                `${formatNumber(row.usageCount)} / ${row.usageLimit ? formatNumber(row.usageLimit) : 'نامحدود'}`,
            },
            {
              title: 'وضعیت',
              render: (_, row) => (
                <Tag
                  color={
                    !row.isActive
                      ? 'default'
                      : Date.parse(row.expiresAt) <= Date.now()
                        ? 'orange'
                        : 'green'
                  }
                >
                  {!row.isActive
                    ? 'غیرفعال'
                    : Date.parse(row.expiresAt) <= Date.now()
                      ? 'منقضی'
                      : Date.parse(row.startsAt) > Date.now()
                        ? 'زمان‌بندی‌شده'
                        : 'فعال'}
                </Tag>
              ),
            },
            {
              title: 'عملیات',
              render: (_, row) => (
                <Button
                  icon={<AdminIcon name="edit" width={17} height={17} />}
                  onClick={() => edit(row)}
                >
                  ویرایش
                </Button>
              ),
            },
          ]}
        />
      )}
      <Modal
        title={editing ? 'ویرایش کد تخفیف' : 'کد تخفیف جدید'}
        open={open}
        onCancel={() => {
          if (!pending) setOpen(false);
        }}
        footer={null}
        width={680}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (raw) => {
            const parsed = couponInput.safeParse(raw);
            setError('');
            if (!parsed.success) {
              setError(parsed.error.issues[0]?.message ?? 'اطلاعات را بررسی کنید.');
              return;
            }
            setPending(true);
            try {
              await adminRequest(SaveAdminCouponDocument, {
                id: editing?.id,
                expectedUpdatedAt: editing?.updatedAt,
                input: parsed.data,
              });
              setOpen(false);
              query.refresh();
              void message.success('کد تخفیف ذخیره شد.');
            } catch (e) {
              setError(e instanceof Error ? e.message : 'ذخیره نشد.');
            } finally {
              setPending(false);
            }
          }}
        >
          <div className="grid gap-x-5 sm:grid-cols-2">
            <Form.Item name="code" label="کد (حروف انگلیسی و عدد)" rules={[{ required: true }]}>
              <Input dir="ltr" maxLength={40} disabled={Boolean(editing?.usageCount)} />
            </Form.Item>
            <Form.Item name="type" label="نوع تخفیف">
              <Select
                options={[
                  { value: 'PERCENT', label: 'درصدی' },
                  { value: 'FIXED', label: 'مبلغ ثابت' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="value"
              label={type === 'FIXED' ? 'مبلغ تخفیف (تومان)' : 'درصد تخفیف'}
              rules={[{ required: true }]}
            >
              {type === 'FIXED' ? (
                <MoneyInput />
              ) : (
                <InputNumber className="!w-full" min={1} max={100} precision={0} />
              )}
            </Form.Item>
            <Form.Item name="minOrderAmount" label="حداقل خرید (تومان)">
              <MoneyInput />
            </Form.Item>
            <Form.Item name="maxDiscountAmount" label="حداکثر مبلغ تخفیف (اختیاری)">
              <MoneyInput />
            </Form.Item>
            <Form.Item name="usageLimit" label="سقف دفعات استفاده (اختیاری)">
              <InputNumber min={1} max={1000000} precision={0} className="!w-full" />
            </Form.Item>
            <Form.Item name="startsAt" label="شروع" rules={[{ required: true }]}>
              <CalendarPicker withTime />
            </Form.Item>
            <Form.Item name="expiresAt" label="پایان" rules={[{ required: true }]}>
              <CalendarPicker withTime />
            </Form.Item>
          </div>
          <Form.Item name="isActive" label="فعال" valuePropName="checked">
            <Switch />
          </Form.Item>
          {error && <Alert type="error" role="alert" className="!mb-4" title={error} />}
          <Button type="primary" htmlType="submit" loading={pending}>
            ذخیره کد
          </Button>
        </Form>
      </Modal>
    </>
  );
}
