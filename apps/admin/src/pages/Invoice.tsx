import { Money } from '../components/Money';
import { useState } from 'react';
import { Button, Alert, Modal } from 'antd';
import { BRAND_NAME, formatNumber, formatDate, orderStatusLabels } from '@behjati/shared';
import type { AdminOrderFieldsFragment } from '../generated/graphql';
import PrintSheet from '../components/PrintSheet';
import { persianDigits, customerName } from '../lib/format';
export default function Invoice({
  order,
  onClose,
}: {
  order: AdminOrderFieldsFragment;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const address = order.address;
  const sheet = (
    <article
      dir="rtl"
      className="mx-auto max-w-[148mm] rounded-lg bg-white p-5 font-sans text-[11px] leading-6 text-black shadow-sm print:max-w-none print:rounded-none print:p-0 print:shadow-none"
    >
      <header className="mb-4 flex items-center justify-between gap-3 border-b border-slate-300 pb-3">
        <div>
          <h1 className="text-sm font-bold">{BRAND_NAME}</h1>
          <p>فاکتور سفارش شماره {formatNumber(order.number)}</p>
          <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
        </div>
        <img src="/images/logo-brand.png" alt={BRAND_NAME} className="h-20 w-auto" />
      </header>
      <section className="mb-4 break-inside-avoid">
        <h2 className="font-bold">مشخصات مشتری و گیرنده</h2>
        <p>
          مشتری: {customerName(order.user)} · موبایل: <bdi>{persianDigits(order.user.phone)}</bdi>
        </p>
        <p>
          گیرنده: {address.recipientName || 'ثبت نشده'} · موبایل گیرنده:{' '}
          <bdi>{address.recipientPhone ? persianDigits(address.recipientPhone) : 'ثبت نشده'}</bdi>
        </p>
        <p>
          نشانی:{' '}
          {[address.province, address.city, address.postalAddress].filter(Boolean).join('، ') ||
            'ثبت نشده'}
        </p>
        <p>
          کد پستی: <bdi>{address.postalCode ? persianDigits(address.postalCode) : 'ثبت نشده'}</bdi>
        </p>
      </section>
      <table className="mb-4 w-full table-fixed border-collapse text-[10px] [&_th]:border [&_th]:border-slate-300 [&_th]:p-1 [&_td]:border [&_td]:border-slate-300 [&_td]:p-1">
        <thead className="table-header-group bg-slate-100">
          <tr>
            <th className="w-[35%]">محصول / وزن</th>
            <th className="w-[12%]">تعداد</th>
            <th>قیمت واحد</th>
            <th>مبلغ ردیف</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="break-inside-avoid">
              <td className="break-words">
                {item.productTitle}
                <span className="block">{item.productWeight}</span>
              </td>
              <td className="text-center">{formatNumber(item.quantity)}</td>
              <td>{<Money amount={item.unitPrice} />}</td>
              <td>{<Money amount={item.lineTotal} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <section className="break-inside-avoid">
        <dl className="ms-auto max-w-[80mm] space-y-1">
          {(
            [
              ['جمع محصولات', order.subtotal],
              ['تخفیف', order.discount],
              ['هزینه ارسال', order.shipping],
              ['مبلغ سفارش', order.total],
            ] as const
          ).map(([label, amount]) => (
            <div
              key={label}
              className="flex justify-between gap-3 last:border-t last:border-slate-300 last:pt-2 last:font-bold"
            >
              <dt>{label}</dt>
              <dd>{<Money amount={amount} />}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 border-t border-slate-300 pt-2">
          وضعیت سفارش: <b>{orderStatusLabels[order.status]}</b>
        </p>
        <p className="text-[10px]">
          این فاکتور، رسید پرداخت نیست. پرداخت آنلاین در این نسخه فعال نیست.
        </p>
      </section>
    </article>
  );
  return (
    <Modal
      open
      title={`فاکتور سفارش ${formatNumber(order.number)}`}
      footer={null}
      width={760}
      onCancel={onClose}
      closable={!pending}
      keyboard={!pending}
      maskClosable={false}
      destroyOnHidden
    >
      <div className="flex flex-wrap gap-3 print:!hidden">
        <Button
          type="primary"
          loading={pending}
          onClick={async () => {
            setPending(true);
            try {
              await document.fonts.ready;
              await Promise.all(
                Array.from(
                  document.querySelectorAll<HTMLImageElement>('[data-invoice] img'),
                  (image) => image.decode().catch(() => {}),
                ),
              );
              window.print();
            } finally {
              setPending(false);
            }
          }}
        >
          چاپ / ذخیره PDF
        </Button>
      </div>
      <Alert
        className="!my-4 print:!hidden"
        type="info"
        title="فاکتور در اندازه A5 عمودی چاپ می‌شود. برای فایل PDF، گزینه ذخیره PDF را در پنجره چاپ مرورگر انتخاب کنید."
      />
      <div data-invoice>{sheet}</div>
      <PrintSheet>{sheet}</PrintSheet>
    </Modal>
  );
}
