import type { ReactNode } from 'react';
import { BRAND_NAME, formatNumber } from '@behjati/shared';
import type { ShippingLabelValues } from '@behjati/shared/admin';
import type { AdminOrderFieldsFragment } from '../generated/graphql';
import { formatAdminPrice } from '../lib/money';
import { persianDigits } from '../lib/format';
import AdminIcon from './AdminIcon';
import BrandQr from './BrandQr';
import TrackingBarcode from './TrackingBarcode';
import DesignCredit from './DesignCredit';

function Block({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[1.8mm] border-[0.35mm] border-black">
      <h2 className="flex items-center gap-[1.5mm] bg-black px-[2mm] py-[0.5mm] text-[1.12em] font-extrabold text-white">
        {icon}
        {title}
      </h2>
      <div className="px-[2mm] py-[0.6mm]">{children}</div>
    </section>
  );
}
function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-[1.5mm] border-b border-dashed border-black/25 py-[0.3mm] last:border-0">
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
  const icon = (name: Parameters<typeof AdminIcon>[0]['name']) => (
    <AdminIcon name={name} size={large ? 19 : 14} />
  );
  const party = (recipient: boolean) => {
    const name = recipient ? values.recipientName : values.senderName;
    const phone = recipient ? values.recipientPhone : values.senderPhone;
    const address = recipient ? values.recipientAddress : values.senderAddress;
    const postal = recipient ? values.recipientPostalCode : values.senderPostalCode;
    return (
      <Block title={recipient ? 'گیرنده' : 'فرستنده'} icon={icon(recipient ? 'person' : 'home')}>
        <dl>
          <Detail label="نام">{name}</Detail>
          <Detail label="تلفن">
            <bdi dir="ltr">{persianDigits(phone || '—')}</bdi>
          </Detail>
          <div className="border-b border-dashed border-black/25 py-[0.6mm]">
            <dt className="inline text-[0.9em] font-medium">نشانی: </dt>
            <dd className="inline whitespace-pre-wrap font-bold [overflow-wrap:anywhere]">
              {address || 'ثبت نشده'}
            </dd>
          </div>
          <Detail label="کد پستی">
            <bdi dir="ltr">{persianDigits(postal || '—')}</bdi>
          </Detail>
        </dl>
      </Block>
    );
  };
  return (
    <article
      data-label-sheet
      dir="rtl"
      className={`mx-auto w-full rounded-[2.5mm] border-[0.5mm] border-black bg-white p-[1.5mm] leading-[1.35] text-black [print-color-adjust:exact] print:w-auto print:rounded-[1.8mm] print:p-[1.5mm] ${large ? 'text-[12px]' : 'text-[8.5px]'}`}
    >
      <header className="mb-[1.5mm] flex items-center justify-between gap-[3mm] border-b-[0.35mm] border-black pb-[1mm]">
        <div className="flex min-w-0 flex-1 items-center gap-[1.5mm]">
          <img
            src="/images/logo-brand.png"
            alt="لوگوی سنتی بهجتی"
            className={
              large
                ? 'size-[21mm] shrink-0 object-contain grayscale'
                : 'size-[11mm] shrink-0 object-contain grayscale'
            }
          />
          <div className="min-w-0">
            <p className="text-[1.5em] leading-[1.5] font-black">{BRAND_NAME}</p>
            <p className="text-[0.95em] font-semibold">فرآورده‌های کنجدی سنتی اردکان</p>
            <p dir="ltr" className="mt-[0.5mm] flex items-center justify-end gap-1 font-bold">
              sonatibehjati.ir {icon('globe')}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-stretch text-center text-[0.8em] font-bold">
          <div className="flex flex-col items-center justify-center gap-[1mm] border-s border-black px-[2mm]">
            {icon('heart')}
            <span>
              با عشق
              <br />
              از اردکان
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-[1mm] border-s border-black px-[2mm]">
            {icon('truck')}
            <span>
              مرسولهٔ
              <br />
              سنتی بهجتی
            </span>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-[1.12fr_1fr] items-stretch gap-[1.5mm]">
        {party(true)}
        {party(false)}
      </div>
      <div className="mt-[1.5mm] grid grid-cols-[1.12fr_1fr] items-stretch gap-[1.5mm]">
        <Block title="اطلاعات مرسوله" icon={icon('truck')}>
          <dl>
            <Detail label="شماره سفارش">{formatNumber(order.number)}</Detail>
            <Detail label="روش ارسال">{values.carrier || 'ثبت نشده'}</Detail>
            <Detail label="وزن بسته">{values.packageWeight || 'ثبت نشده'}</Detail>
            <Detail label="هزینه ارسال">{formatAdminPrice(order.shipping)}</Detail>
          </dl>
        </Block>
        <Block title="محتویات بسته" icon={icon('products')}>
          <p className="whitespace-pre-wrap font-bold [overflow-wrap:anywhere]">
            {values.packageContent || 'محتویات ثبت نشده'}
          </p>
          <div className="mt-[1mm] flex items-end justify-between gap-[1.5mm] border-t border-dashed border-black/25 pt-[1mm]">
            <div className="min-w-0 flex-1">
              {values.trackingNumber ? (
                <>
                  <p className="text-[0.85em] font-bold">کد رهگیری مرسوله</p>
                  <TrackingBarcode value={values.trackingNumber} compact />
                </>
              ) : (
                <p className="font-bold">راه‌های ارتباطی</p>
              )}
              <p dir="ltr" className="mt-[0.5mm] text-[0.8em]">
                sonatibehjati.ir/QR
              </p>
            </div>
            <BrandQr className={large ? 'w-[20mm] grayscale' : 'w-[15mm] grayscale'} />
          </div>
        </Block>
      </div>
      {values.note && (
        <p className="mt-[1.5mm] rounded-[1mm] border border-dashed border-black/40 px-[2mm] py-[0.6mm] whitespace-pre-wrap font-bold [overflow-wrap:anywhere]">
          {values.note}
        </p>
      )}
      <footer className="mt-[1.5mm] flex items-center justify-between gap-[1.5mm] border-t-[0.35mm] border-black pt-[1mm] text-[0.85em] font-semibold">
        <span className="flex items-center gap-1">{icon('heart')} با تشکر از اعتماد شما</span>
        <span>لطفاً هنگام تحویل، محتویات بسته را بررسی کنید.</span>
      </footer>
      <DesignCredit className="mt-[0.5mm] text-center text-[0.75em] [&_a]:!text-black" />
    </article>
  );
}
