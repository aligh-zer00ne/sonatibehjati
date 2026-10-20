import DesignCredit from './DesignCredit';
import type { ShippingLabelValues } from '@behjati/shared/admin';
import type { AdminOrderFieldsFragment } from '../generated/graphql';
import { formatNumber } from '@behjati/shared';
import { persianDigits } from '../lib/format';
import BrandQr from './BrandQr';
import TrackingBarcode from './TrackingBarcode';

function Symbol({ kind }: { kind: 'truck' | 'up' | 'glass' | 'umbrella' }) {
  const paths = {
    truck:
      'M2 5h12v11H2V5Zm12 4h4l4 5v2h-8M5 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm13 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6M1 9h6M1 12h4',
    up: 'M6 21V3m-4 4 4-4 4 4M18 21V3m-4 4 4-4 4 4',
    glass: 'M6 3h12l-1 8-5 4-5-4-1-8ZM12 15v6M7 21h10',
    umbrella: 'M2 12a10 10 0 0 1 20 0c-3-2-5-2-10 0-5-2-7-2-10 0ZM12 12v8a2 2 0 0 0 4 0M12 2V1',
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[kind]} />
    </svg>
  );
}

export default function ShippingLabelSheet({
  order,
  values,
}: {
  order: AdminOrderFieldsFragment;
  values: ShippingLabelValues;
}) {
  const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <article
      data-label-sheet
      dir="rtl"
      className="mx-auto max-w-[210mm] break-inside-avoid rounded-xl border border-black bg-white p-3 text-[10px] leading-[1.8] text-black shadow-sm [print-color-adjust:exact] print:w-full print:max-w-none print:p-[2mm] print:text-[7pt] print:leading-[1.4] print:shadow-none"
    >
      <header className="mb-3 grid grid-cols-[1fr_1fr_1fr] items-center gap-3 print:mb-[1.5mm]">
        <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-black p-2 text-center font-bold print:p-[1mm]">
          <Symbol kind="truck" />
          <p>
            ارسال با
            <br />
            {values.carrier || 'پست'}
          </p>
        </div>
        <div className="text-center text-[1.15em] font-bold">
          <p>
            با عشق از اردکان
            <br />
            برای شما ♥
          </p>
          <div className="mx-auto mt-1 w-3/4 -rotate-3 border-b-2 border-black" />
        </div>
        <div className="flex flex-col items-center border-s border-black px-2 text-center">
          <img
            src="/images/logo-footer.svg"
            alt="لوگوی سنتی بهجتی"
            className="h-16 w-auto object-contain print:h-[13mm]"
          />
          <p className="mt-1 text-[0.85em] font-bold">فرآورده‌های کنجدی سنتی بهجتی اردکان</p>
        </div>
      </header>
      <div className="grid grid-cols-[1.15fr_0.85fr] gap-2">
        <section className="min-w-0 overflow-hidden rounded-lg border-2 border-black">
          <h2 className="ms-auto w-2/3 rounded-es-xl bg-black px-3 py-1 print:py-[0.5mm] text-[1.2em] font-bold text-white">
            گیرنده
          </h2>
          <dl className="space-y-1 print:space-y-0 px-3 pb-2 print:px-[2mm] print:pb-[1mm] print:[&>div]:py-[0.5mm] [&>div]:border-b [&>div]:border-black/20 [&>div]:py-1 [&>div:last-child]:border-0">
            <div>
              <dt className="inline">نام و نام خانوادگی: </dt>
              <dd className="inline font-bold">{values.recipientName}</dd>
            </div>
            <div>
              <dt>آدرس:</dt>
              <dd className="break-words whitespace-pre-wrap font-medium">
                {values.recipientAddress}
              </dd>
            </div>
            <div>
              <dt className="inline">کد پستی: </dt>
              <dd className="inline font-bold">
                <bdi>{persianDigits(values.recipientPostalCode || '—')}</bdi>
              </dd>
            </div>
            <div>
              <dt className="inline">تلفن: </dt>
              <dd className="inline font-bold">
                <bdi>{persianDigits(values.recipientPhone || '—')}</bdi>
              </dd>
            </div>
          </dl>
        </section>
        <div className="flex min-w-0 flex-col gap-2">
          <section className="flex-1 rounded-lg border border-black/50 p-2 print:p-[1mm]">
            <h2 className="mb-1 text-[1.1em] font-bold">فرستنده</h2>
            <p className="break-words font-bold">{values.senderName}</p>
            <p className="break-words whitespace-pre-wrap">
              {values.senderAddress || 'اردکان، یزد، ایران'}
            </p>
            {values.senderPhone && (
              <p>
                تلفن: <bdi>{persianDigits(values.senderPhone)}</bdi>
              </p>
            )}
            {values.senderPostalCode && (
              <p>
                کد پستی: <bdi>{persianDigits(values.senderPostalCode)}</bdi>
              </p>
            )}
          </section>
          <section className="grid grid-cols-[1fr_auto] gap-2 rounded-lg border border-black/50 p-2 print:p-[1mm]">
            <div className="min-w-0">
              <h2 className="font-bold">محتویات</h2>
              <p className="break-words">{values.packageContent || 'محصولات کنجدی'}</p>
              {values.packageWeight && <p>وزن: {values.packageWeight}</p>}
            </div>
            <div className="border-s border-black ps-2 text-center">
              <p>تعداد اقلام</p>
              <b className="text-[1.6em]">{formatNumber(quantity)}</b>
            </div>
          </section>
        </div>
      </div>
      <footer className="mt-2 flex items-center gap-2 rounded-lg border border-black/50 p-2 print:p-[1mm]">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {(
            [
              ['up', 'بالا باشد'],
              ['umbrella', 'دور از رطوبت'],
              ['glass', 'شکننده'],
            ] as const
          ).map(([kind, label]) => (
            <div
              key={kind}
              className="flex min-w-0 flex-1 flex-col items-center rounded-md border border-black p-1 text-center text-[0.8em] font-bold"
            >
              <Symbol kind={kind} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <p className="max-w-[22%] rounded-lg bg-black p-2 text-center text-[0.9em] text-white">
          لطفاً در تحویل کالا
          <br />
          ملاحظه شود.
        </p>
        <BrandQr className="w-[23%] max-w-[30mm] print:max-w-[22mm]" />
        <div className="min-w-0 flex-1">
          {values.trackingNumber ? (
            <TrackingBarcode value={values.trackingNumber} />
          ) : (
            <p className="text-center">
              سفارش شماره <b>{formatNumber(order.number)}</b>
            </p>
          )}
        </div>
      </footer>
      {values.note && (
        <p className="mt-2 print:mt-[1mm] break-words whitespace-pre-wrap text-[0.95em] font-bold">
          {values.note}
        </p>
      )}
      <DesignCredit className="mt-2 border-t border-black/20 pt-1 text-center text-[10px] print:mt-[1mm] print:text-[8px]" />
    </article>
  );
}
