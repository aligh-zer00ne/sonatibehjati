import type { ReactNode } from 'react';
import { BRAND_NAME, formatDate, formatNumber } from '@behjati/shared';
import type { ShippingLabelValues } from '@behjati/shared/admin';
import type { AdminOrderFieldsFragment } from '../generated/graphql';
import { formatAdminPrice } from '../lib/money';
import { persianDigits } from '../lib/format';
import AdminIcon, { type AdminIconName } from './AdminIcon';
import BrandQr from './BrandQr';
import TrackingBarcode from './TrackingBarcode';
import DesignCredit from './DesignCredit';
import { LabelWindcatcher, LabelFlourish, LabelSkyline } from './LabelOrnament';

function Block({
  title,
  icon,
  children,
  className = '',
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 rounded-[2mm] border-[0.4mm] border-black ${className}`}>
      <h2 className="flex items-center gap-[1.5mm] rounded-t-[1.5mm] bg-black px-[2mm] py-[0.65mm] text-[1.2em] font-black text-white">
        {icon}
        {title}
      </h2>
      <div className="px-[2mm] py-[0.8mm]">{children}</div>
    </section>
  );
}
function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-[1.5mm] border-b border-dashed border-black/30 py-[0.3mm] last:border-0">
      <dt className="shrink-0 text-[0.9em] font-medium">{label}</dt>
      <dd className="min-w-0 text-end font-bold [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}
export default function ShippingLabelSheet({
  order,
  values,
}: {
  order: AdminOrderFieldsFragment;
  values: ShippingLabelValues;
}) {
  const large = values.paperSize === 'A5';
  const icon = (name: AdminIconName) => <AdminIcon name={name} size={large ? 20 : 14} />;
  const party = (recipient: boolean) => (
    <Block title={recipient ? 'گیرنده' : 'فرستنده'} icon={icon(recipient ? 'person' : 'home')}>
      <dl>
        <Detail label="نام">{recipient ? values.recipientName : values.senderName}</Detail>
        <Detail label="شماره تماس">
          <bdi dir="ltr">
            {persianDigits((recipient ? values.recipientPhone : values.senderPhone) || '—')}
          </bdi>
        </Detail>
        <div className="border-b border-dashed border-black/30 py-[0.4mm]">
          <dt className="inline text-[0.9em] font-medium">نشانی: </dt>
          <dd className="inline whitespace-pre-wrap font-bold [overflow-wrap:anywhere]">
            {(recipient ? values.recipientAddress : values.senderAddress) || 'ثبت نشده'}
          </dd>
        </div>
        <Detail label="کد پستی">
          <bdi dir="ltr">
            {persianDigits(
              (recipient ? values.recipientPostalCode : values.senderPostalCode) || '—',
            )}
          </bdi>
        </Detail>
      </dl>
    </Block>
  );
  return (
    <article
      data-label-sheet
      dir="rtl"
      className={`relative isolate mx-auto w-full rounded-[4mm] border-[0.65mm] border-black bg-white p-[1mm] leading-[1.3] text-black [print-color-adjust:exact] print:w-auto ${large ? 'text-[12px]' : 'text-[8.5px]'}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[0.65mm] -z-10 rounded-[3mm] border-[0.2mm] border-black"
      />
      <LabelFlourish className="pointer-events-none absolute top-0 left-0 -z-10 size-[9mm] bg-white" />
      <LabelFlourish className="pointer-events-none absolute right-0 bottom-0 -z-10 size-[9mm] rotate-180 bg-white" />
      <header className="mb-[1.5mm] grid grid-cols-[0.95fr_1.45fr_0.55fr] items-center gap-[2mm] border-b-[0.45mm] border-black px-[1mm] pb-[1.5mm]">
        <div className="grid grid-cols-4 items-stretch text-center text-[0.75em] font-bold">
          {(
            [
              ['heart', 'با عشق', 'از اردکان'],
              ['truck', 'ارسال', 'به سراسر ایران'],
              ['shield', 'بسته‌بندی', 'با دقت'],
              ['sprout', 'طعم اصیل', 'سنتی'],
            ] as const
          ).map(([name, a, b]) => (
            <div
              key={name}
              className="flex flex-col items-center justify-center gap-[1mm] border-s border-black px-[0.8mm]"
            >
              {icon(name)}
              <span>
                {a}
                <br />
                {b}
              </span>
            </div>
          ))}
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-[1mm]">
            <img
              src="/images/logo-brand.png"
              alt="لوگوی سنتی بهجتی"
              className={
                large
                  ? 'size-[12mm] shrink-0 object-contain grayscale'
                  : 'size-[6mm] shrink-0 object-contain grayscale'
              }
            />
            <p className="text-[1.5em] leading-[1.5] font-black">{BRAND_NAME}</p>
          </div>
          <p className="text-[0.9em] font-bold">فرآورده‌های کنجدی سنتی اردکان</p>
          <p
            dir="ltr"
            className="mt-[0.5mm] flex items-center justify-center gap-[1mm] text-[1.05em] font-extrabold"
          >
            {icon('globe')} sonatibehjati.ir
          </p>
        </div>
        <LabelWindcatcher
          className={large ? 'mx-auto h-[25mm] w-full' : 'mx-auto h-[12mm] w-full'}
        />
      </header>
      <div className="grid grid-cols-2 items-stretch gap-[2mm]">
        {party(true)}
        {party(false)}
      </div>
      <div className="mt-[1.5mm] grid grid-cols-2 items-stretch gap-[2mm]">
        <div className="grid min-w-0 grid-cols-[1fr_0.65fr] gap-[1.5mm]">
          <section className="min-w-0 rounded-[2mm] border-[0.4mm] border-black px-[1.5mm] py-[1mm]">
            <dl>
              <Detail label="تاریخ سفارش">
                <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
              </Detail>
              <Detail label="وزن ثبت‌شده">{values.packageWeight || 'ثبت نشده'}</Detail>
              <Detail label="نوع ارسال">{values.carrier}</Detail>
              <Detail label="هزینه ارسال">{formatAdminPrice(order.shipping)}</Detail>
            </dl>
          </section>
          <section className="flex min-w-0 flex-col items-center justify-center gap-[1mm] rounded-[2mm] border-[0.4mm] border-black p-[1mm] text-center text-[0.8em] font-bold">
            <BrandQr className={large ? 'w-[26mm] grayscale' : 'w-[22mm] grayscale'} />
          </section>
        </div>
        <Block title="محتویات مرسوله" icon={icon('products')}>
          <table className="w-full table-fixed border-collapse text-start">
            <colgroup>
              <col />
              <col className="w-[17%]" />
            </colgroup>
            <thead className="sr-only">
              <tr>
                <th>نام کالا</th>
                <th>تعداد</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr
                  key={item.id}
                  data-label-item
                  className="break-inside-avoid border-b border-dashed border-black/30 last:border-0"
                >
                  <td className="py-[0.8mm] pe-[1mm] font-bold [overflow-wrap:anywhere]">
                    {item.productTitle}
                    <small className="ms-[1mm] text-[0.85em] font-medium">
                      {item.productWeight}
                    </small>
                  </td>
                  <td className="py-[0.8mm] text-end align-top font-extrabold">
                    {formatNumber(item.quantity)} عدد
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-[0.8mm] text-[0.85em] font-bold">
            سفارش شماره {formatNumber(order.number)}
          </p>
          {values.trackingNumber && (
            <div className="mt-[1mm] border-t border-dashed border-black/30 pt-[0.5mm]">
              <p className="text-[0.8em] font-bold">کد رهگیری مرسوله</p>
              <TrackingBarcode value={values.trackingNumber} compact />
            </div>
          )}
        </Block>
      </div>
      {values.note && (
        <p className="mt-[1mm] break-inside-avoid rounded-[1mm] border border-dashed border-black/40 px-[2mm] py-[0.7mm] whitespace-pre-wrap font-bold [overflow-wrap:anywhere]">
          {values.note}
        </p>
      )}
      <footer className="relative mt-[1.5mm] grid break-inside-avoid grid-cols-[1fr_0.8fr_1fr] items-end gap-[1mm] rounded-[2mm] border-[0.35mm] border-black px-[2mm] py-[1mm] text-[0.85em] font-bold">
        <div className="flex items-center gap-[1mm]">
          {icon('products')}
          <p>
            لطفاً هنگام تحویل،
            <br />
            محتویات بسته را بررسی کنید.
          </p>
        </div>
        <div className="relative h-[6mm] overflow-hidden">
          <LabelSkyline className="h-full w-full" />
        </div>
        <div className="flex items-center justify-end gap-[1mm] text-end">
          <div>
            <p>با تشکر از اعتماد شما</p>
            <DesignCredit className="text-[0.75em] [&_a]:!text-black" />
          </div>
          {icon('sprout')}
        </div>
      </footer>
    </article>
  );
}
