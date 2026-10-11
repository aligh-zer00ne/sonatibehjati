import { Money } from '../components/Money';
import { lazy, Suspense, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Card,
  Descriptions,
  Table,
  Select,
  Button,
  Alert,
  Timeline,
  App,
  Popconfirm,
} from 'antd';
import { formatNumber, orderStatusLabels } from '@behjati/shared';
import { orderStatusTransitions } from '@behjati/shared/admin';
import {
  AdminOrderDocument,
  UpdateAdminOrderStatusDocument,
  type OrderStatus as Status,
  type AdminOrderFieldsFragment,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest } from '../lib/client';
import { customerName, persianDigits, formatDateTime } from '../lib/format';
import DataState from '../components/DataState';
import OrderStatus from '../components/OrderStatus';
const Invoice = lazy(() => import('./Invoice'));
const ShippingLabel = lazy(() => import('./ShippingLabel'));
export default function OrderDetails() {
  const { id = '' } = useParams();
  const query = useAdminQuery(AdminOrderDocument, { id });
  const [printView, setPrintView] = useState<'invoice' | 'label' | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [pending, setPending] = useState(false);
  const { message } = App.useApp();
  if (!query.data) return <DataState error={query.error} retry={query.refresh} />;
  const order = query.data.adminOrder;
  const address = order.address;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography.Title level={2}>سفارش {formatNumber(order.number)}</Typography.Title>
        <div className="flex flex-wrap gap-2">
          <Button type="primary" onClick={() => setPrintView('label')}>
            لیبل پستی / چاپ
          </Button>
          <Button onClick={() => setPrintView('invoice')}>چاپ فاکتور / PDF</Button>
        </div>
      </div>
      <Card>
        <Descriptions
          title="اطلاعات سفارش"
          bordered
          column={{ xs: 1, sm: 2 }}
          items={[
            { key: 'status', label: 'وضعیت', children: <OrderStatus status={order.status} /> },
            { key: 'date', label: 'تاریخ ثبت', children: formatDateTime(order.createdAt) },
            { key: 'customer', label: 'مشتری', children: customerName(order.user) },
            {
              key: 'phone',
              label: 'موبایل مشتری',
              children: <bdi>{persianDigits(order.user.phone)}</bdi>,
            },
            {
              key: 'recipient',
              label: 'گیرنده هنگام ثبت',
              children: address.recipientName || 'ثبت نشده',
            },
            {
              key: 'recipient-phone',
              label: 'موبایل گیرنده',
              children: address.recipientPhone ? (
                <bdi>{persianDigits(address.recipientPhone)}</bdi>
              ) : (
                'ثبت نشده'
              ),
            },
            {
              key: 'address',
              label: 'نشانی هنگام ثبت',
              children:
                [address.province, address.city, address.postalAddress]
                  .filter(Boolean)
                  .join('، ') || 'ثبت نشده',
              span: 2,
            },
            {
              key: 'postal',
              label: 'کد پستی',
              children: address.postalCode ? persianDigits(address.postalCode) : 'ثبت نشده',
            },
          ]}
        />
      </Card>
      <Card title="محصولات هنگام ثبت سفارش">
        <Table<AdminOrderFieldsFragment['items'][number]>
          rowKey="id"
          dataSource={order.items}
          scroll={{ x: 650 }}
          pagination={false}
          columns={[
            { title: 'محصول', dataIndex: 'productTitle' },
            { title: 'وزن', dataIndex: 'productWeight' },
            { title: 'تعداد', render: (_, item) => formatNumber(item.quantity) },
            { title: 'قیمت واحد', render: (_, item) => <Money amount={item.unitPrice} /> },
            { title: 'مبلغ ردیف', render: (_, item) => <Money amount={item.lineTotal} /> },
          ]}
        />
      </Card>
      <Card>
        <Descriptions
          bordered
          column={{ xs: 1, sm: 2 }}
          items={[
            { key: 'subtotal', label: 'جمع محصولات', children: <Money amount={order.subtotal} /> },
            { key: 'discount', label: 'تخفیف', children: <Money amount={order.discount} /> },
            { key: 'shipping', label: 'ارسال', children: <Money amount={order.shipping} /> },
            {
              key: 'total',
              label: 'مبلغ سفارش',
              children: <b>{<Money amount={order.total} />}</b>,
            },
          ]}
        />
      </Card>
      <Card title="تغییر وضعیت">
        <Alert
          type="info"
          showIcon
          title="تغییر وضعیت فقط عملیات سفارش را ثبت می‌کند و تأیید یا ثبت پرداخت نیست."
          className="mb-4"
        />
        {orderStatusTransitions[order.status].length ? (
          <div className="flex flex-wrap gap-3">
            <Select<Status>
              aria-label="وضعیت جدید سفارش"
              className="min-w-52"
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
                  void message.success('وضعیت سفارش ثبت شد.');
                } catch (error) {
                  void message.error(error instanceof Error ? error.message : 'وضعیت تغییر نکرد.');
                  setStatus(null);
                  query.refresh();
                } finally {
                  setPending(false);
                }
              }}
            >
              <Button type="primary" disabled={!status} loading={pending}>
                ثبت وضعیت
              </Button>
            </Popconfirm>
          </div>
        ) : (
          <Typography.Text type="secondary">این سفارش به وضعیت نهایی رسیده است.</Typography.Text>
        )}
      </Card>
      <Card title="تاریخچه وضعیت">
        {order.statusEvents.length ? (
          <Timeline
            items={order.statusEvents.map((event) => ({
              key: event.id,
              content: (
                <div>
                  {orderStatusLabels[event.fromStatus]} ← {orderStatusLabels[event.toStatus]}
                  <div className="mt-1 text-xs text-slate-500">
                    {formatDateTime(event.createdAt)} · <bdi>{event.admin.email}</bdi>
                  </div>
                </div>
              ),
            }))}
          />
        ) : (
          <Typography.Text type="secondary">هنوز تغییری توسط مدیر ثبت نشده است.</Typography.Text>
        )}
      </Card>
      <Suspense fallback={null}>
        {printView === 'invoice' && <Invoice order={order} onClose={() => setPrintView(null)} />}
        {printView === 'label' && (
          <ShippingLabel
            order={order}
            onClose={() => {
              setPrintView(null);
              query.refresh();
            }}
          />
        )}
      </Suspense>
      <Link to="/admin/orders">
        <Button>بازگشت به سفارش‌ها</Button>
      </Link>
    </>
  );
}
