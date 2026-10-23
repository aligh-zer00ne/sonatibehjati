import { BRAND_NAME, formatDate, formatNumber, orderStatusLabels } from '@behjati/shared';
import type { AdminOrderFieldsFragment } from '../generated/graphql';
import { customerName, persianDigits } from '../lib/format';
import { formatAdminPrice, toRials } from '../lib/money';
import { amountToPersianWords } from '../lib/numbers';
import AdminIcon from './AdminIcon';
import BrandQr from './BrandQr';
import DesignCredit from './DesignCredit';

export const invoiceFormats = {
  A5: { label: 'فاکتور A5', description: '۱۴۸ × ۲۱۰ میلی‌متر · جمع‌وجور', width: 148 },
  A4: { label: 'فاکتور A4', description: '۲۱۰ × ۲۹۷ میلی‌متر · کامل', width: 210 },
  THERMAL: { label: 'رسید ۸ سانتی', description: 'عرض ۸۰ میلی‌متر · چاپ حرارتی', width: 80 },
} as const;
export type InvoiceFormat = keyof typeof invoiceFormats;

export default function InvoiceSheet({
  order,
  format,
}: {
  order: AdminOrderFieldsFragment;
  format: InvoiceFormat;
}) {
  const store = order.storeInformation;
  const compact = format === 'A5';
  const thermal = format === 'THERMAL',
    large = format === 'A4',
    address = order.address;
  const manual = order.salesChannel !== 'WEBSITE',
    balance = order.total - order.offlinePaidAmount;
  const amount = (value: number) => formatNumber(toRials(value));
  const addressText = [address.province, address.city, address.postalAddress]
    .filter(Boolean)
    .join('، ');
  const hour = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tehran',
  }).format(new Date(order.createdAt));
  const box = 'overflow-hidden rounded-lg border border-[#c9d9e6]';
  const heading = `flex items-center gap-2 border-b border-[#dce6ef] bg-[#eff5fa] font-extrabold ${compact ? 'px-2 py-1' : 'px-3 py-2'}`;
  const payment = (
    <>
      <h2 className={heading}>
        <AdminIcon name="receipt" width={thermal ? 14 : 19} />
        وضعیت پرداخت
      </h2>
      <div className={compact ? 'space-y-1 p-2' : 'space-y-1.5 p-3'}>
        <p className="flex items-start gap-1.5 font-bold">
          <AdminIcon
            name={manual ? 'wallet' : order.paidAt ? 'checkCircle' : 'history'}
            width={thermal ? 12 : 15}
            className="mt-0.5 shrink-0"
          />
          {manual
            ? `وضعیت حساب فاکتور: ${balance > 0 ? 'بدهکار' : balance < 0 ? 'بستانکار' : 'تسویه شده'}`
            : `وضعیت سفارش: ${orderStatusLabels[order.status]}`}
        </p>
        <p>
          {manual
            ? `دریافت ثبت‌شده در فروشگاه: ${formatAdminPrice(order.offlinePaidAmount)}`
            : order.paidAt
              ? 'پرداخت این سفارش توسط بانک تأیید شده است.'
              : 'پرداخت این سفارش تأیید نشده است؛ این برگه رسید پرداخت نیست.'}
        </p>
        {manual && <p>ماندهٔ این فاکتور: {formatAdminPrice(balance)}</p>}
      </div>
    </>
  );
  return (
    <article
      data-invoice-sheet={format}
      dir="rtl"
      className={`box-border bg-white font-sans leading-[1.8] text-[#12365a] [overflow-wrap:anywhere] [&_dd]:m-0 [&_p]:m-0 print:!min-h-0 print:!w-auto print:!p-0 ${thermal ? 'w-[80mm] p-[4mm] text-[10px]' : large ? 'min-h-[297mm] w-[210mm] p-[12mm] text-[12px]' : 'min-h-[210mm] w-[148mm] p-[8mm] text-[10px]'}`}
    >
      <header className="break-inside-avoid">
        <div
          className={`relative flex items-center justify-between gap-3 ${thermal || compact ? 'pb-3' : 'pb-5'}`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <img
              src="/images/logo-brand.png"
              alt={BRAND_NAME}
              className={`${thermal ? 'h-[17mm]' : large ? 'h-[24mm]' : 'h-[16mm]'} w-auto shrink-0 object-contain`}
            />
            <div data-invoice-seller aria-label="مشخصات فروشنده" className="min-w-0">
              <h1
                className={`${thermal ? 'text-[13px]' : large ? 'text-[21px]' : 'text-[15px]'} font-black leading-[1.6]`}
              >
                {store.name || BRAND_NAME}
              </h1>
              <p className="mt-1 text-[0.8em] leading-[1.5]">
                تلفن: <bdi dir="ltr">{persianDigits(store.phone)}</bdi>
                {store.postalCode && (
                  <>
                    {' '}
                    · کد پستی: <bdi dir="ltr">{persianDigits(store.postalCode)}</bdi>
                  </>
                )}
              </p>
              <p className="mt-0.5 text-[0.8em] leading-[1.5] whitespace-pre-wrap">
                نشانی فروشنده: {store.address}
              </p>
            </div>
          </div>
          {!thermal && (
            <div className="relative shrink-0 overflow-hidden rounded-ee-[24px] rounded-ss-lg bg-[linear-gradient(130deg,#234f7e,#10335b)] px-3 py-4 text-[0.85em] text-white">
              <p className="flex items-center gap-2">
                <AdminIcon name="globe" width={15} />
                <span dir="ltr">sonatibehjati.ir</span>
              </p>
              <p className="mt-2 flex items-center gap-2">
                <AdminIcon name="instagram" width={15} />
                <span dir="ltr">@sonatibehjati.ir</span>
              </p>
            </div>
          )}
        </div>
        <div
          className={`${thermal ? 'mb-3 border-y border-[#234f7e] py-2 text-center' : compact ? 'mb-3 grid grid-cols-[1fr_auto] items-center gap-3 border-b-2 border-[#8eafc8] pb-3' : 'mb-4 grid grid-cols-[1fr_auto] items-center gap-3 border-b-2 border-[#8eafc8] pb-4'}`}
        >
          <div className="text-center">
            <h2
              className={`${thermal ? 'text-[18px]' : large ? 'text-[28px]' : 'text-[20px] leading-[1.4]'} flex items-center justify-center gap-2 font-black`}
            >
              <AdminIcon name="receipt" width={thermal ? 22 : large ? 31 : 26} />
              فاکتور فروش
            </h2>
            <p className="mt-1.5">
              فاکتور سفارش شماره <b>{formatNumber(order.number)}</b>
            </p>
            {thermal && (
              <p className="mt-1">
                <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
                <span className="mx-2">|</span>ساعت {hour}
              </p>
            )}
          </div>
          {!thermal && (
            <dl className="min-w-[33mm] rounded-lg border border-[#c9d9e6] bg-[#f4f8fc] p-2.5 text-[0.9em]">
              <div className="flex items-center justify-between gap-4 border-b border-[#dce6ef] pb-1.5">
                <dt className="flex items-center gap-1">
                  <AdminIcon name="calendar" width={13} />
                  تاریخ صدور
                </dt>
                <dd>
                  <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
                </dd>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-4">
                <dt>شماره فاکتور</dt>
                <dd className="font-bold">{formatNumber(order.number)}</dd>
              </div>
            </dl>
          )}
        </div>
      </header>

      <section
        aria-label="مشخصات مشتری"
        className={`${box} ${compact ? 'mb-3' : 'mb-4'} break-inside-avoid`}
      >
        <h2 className={heading}>
          <span className="grid size-[1.8em] shrink-0 place-items-center rounded-full bg-[#173f6a] text-white">
            <AdminIcon name="person" width={thermal ? 13 : 17} />
          </span>
          مشخصات مشتری
        </h2>
        <div
          className={`grid gap-x-3 gap-y-1.5 p-2.5 ${thermal ? 'grid-cols-[1fr_auto] text-[9px]' : 'grid-cols-2'}`}
        >
          <p>
            نام مشتری: <b>{customerName(order.user)}</b>
          </p>
          <p>
            شماره تماس: <bdi>{persianDigits(order.user.phone)}</bdi>
          </p>
          {large && (addressText || address.postalCode) && (
            <p className="col-span-2 whitespace-pre-wrap text-[0.9em]">
              {addressText && <>نشانی: {addressText}</>}
              {address.postalCode && (
                <>
                  {' '}
                  · کد پستی: <bdi>{persianDigits(address.postalCode)}</bdi>
                </>
              )}
            </p>
          )}
        </div>
      </section>

      <div className={`${box} ${compact ? 'mb-3' : 'mb-4'}`}>
        <table
          aria-label="اقلام فاکتور"
          className={`w-full table-fixed border-collapse ${thermal ? 'text-[9px] leading-[1.65]' : 'text-[0.95em]'} [&_th]:border-e [&_th]:border-white/25 [&_th]:px-1 [&_th]:py-1.5 [&_td]:border-e [&_td]:border-b [&_td]:border-[#dce6ef] [&_td]:px-1 [&_td]:py-1.5 [&_td]:align-top [&_tr:last-child_td]:border-b-0 [&_td:last-child]:border-e-0 [&_th:last-child]:border-e-0`}
        >
          <colgroup>
            {!thermal && <col className="w-[6%]" />}
            <col className={thermal ? 'w-[39%]' : 'w-[34%]'} />
            <col className="w-[9%]" />
            <col className={thermal ? 'w-[25%]' : 'w-[24%]'} />
            <col className={thermal ? 'w-[27%]' : 'w-[27%]'} />
          </colgroup>
          <thead className="table-header-group bg-[#173f6a] text-center font-bold text-white">
            <tr>
              {!thermal && <th>#</th>}
              <th>نام کالا</th>
              <th>تعداد</th>
              <th>
                {thermal ? (
                  'فی واحد'
                ) : (
                  <>
                    قیمت واحد
                    <br />
                    (ریال)
                  </>
                )}
              </th>
              <th>
                مبلغ کل
                {!thermal && (
                  <>
                    <br />
                    (ریال)
                  </>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr
                key={item.id}
                data-invoice-line
                className="break-inside-avoid bg-[#f5f9fc] text-center even:bg-white"
              >
                {!thermal && <td>{formatNumber(index + 1)}</td>}
                <td className="text-right">
                  <b>{item.productTitle}</b>
                  <span className="mt-0.5 block text-[0.9em] text-[#476783]">
                    {item.productWeight}
                  </span>
                  {!!item.discountAmount && (
                    <span className="mt-1 block text-[0.9em]">
                      تخفیف ردیف: {amount(item.discountAmount)} ریال
                    </span>
                  )}
                </td>
                <td>{formatNumber(item.quantity)}</td>
                <td className="tabular-nums">{amount(item.unitPrice)}</td>
                <td className="font-bold tabular-nums">{amount(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="break-inside-avoid">
        <div className={`grid gap-3 ${thermal ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <section className={`${box} bg-[#f8fbfd]`}>
            {!thermal && (
              <h2 className={heading}>
                <AdminIcon name="coins" width={19} />
                جمع فاکتور
              </h2>
            )}
            <dl data-invoice-totals className={compact ? 'space-y-1 p-1.5' : 'space-y-1 p-2.5'}>
              {(
                [
                  ['جمع محصولات', order.subtotal],
                  ['تخفیف', order.discount],
                  ['هزینه ارسال', order.shipping],
                  ['مبلغ سفارش', order.total],
                ] as const
              ).map(([label, value], index) => (
                <div
                  key={label}
                  className={`flex items-baseline justify-between gap-2 ${index === 3 ? 'mt-2 rounded-md bg-[#173f6a] px-2.5 py-2 text-[1.1em] font-black text-white' : compact ? 'border-b border-[#dce6ef] px-1 py-0.5' : 'border-b border-[#dce6ef] px-1 py-1.5'}`}
                >
                  <dt>{label}</dt>
                  <dd data-amount={value} className="tabular-nums">
                    {thermal && index !== 3 ? amount(value) : formatAdminPrice(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          {!thermal && <section className={box}>{payment}</section>}
        </div>
        <p
          className={`flex items-start gap-2 rounded-lg border border-[#c9d9e6] bg-[#f1f7fc] font-semibold ${compact ? 'mt-2 px-2 py-1' : 'mt-3 px-3 py-2'}`}
        >
          <AdminIcon name="wallet" width={thermal ? 13 : 17} className="mt-0.5 shrink-0" />
          <span>مبلغ به حروف: {amountToPersianWords(toRials(order.total), 'ریال')}</span>
        </p>
        {thermal && (
          <div className="mt-2 border-y border-dashed border-[#a8bfd2] py-1.5 text-[8px]">
            <p>
              {manual
                ? `دریافت ثبت‌شده در فروشگاه: ${formatAdminPrice(order.offlinePaidAmount)} · مانده: ${formatAdminPrice(balance)}`
                : order.paidAt
                  ? 'پرداخت این سفارش توسط بانک تأیید شده است.'
                  : 'پرداخت این سفارش تأیید نشده است؛ این برگه رسید پرداخت نیست.'}
            </p>
          </div>
        )}
        <footer className={compact ? 'mt-2' : 'mt-3'}>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#c9d9e6] bg-[#f1f7fc] p-2.5">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[1.1em] font-extrabold">
                <AdminIcon name="qrcode" width={thermal ? 14 : 20} />
                {compact ? 'با تشکر از خرید شما' : 'با عشق از اردکان، برای شما'}
              </p>
              <p className="mt-1 text-[0.85em]">برای مشاهدهٔ راه‌های ارتباطی، QR را اسکن کنید.</p>
              <p dir="ltr" className="mt-1 text-right text-[0.9em] font-bold text-[#23659a]">
                sonatibehjati.ir/QR
              </p>
            </div>
            <BrandQr
              className={`${thermal ? 'w-[20mm]' : compact ? 'w-[21mm]' : 'w-[25mm]'} rounded-md border border-[#94afc5] bg-white p-1 grayscale`}
            />
          </div>
          {!compact && (
            <>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#c9d9e6]" />
                <AdminIcon name="sprout" width={thermal ? 16 : 22} />
                <span className="h-px flex-1 bg-[#c9d9e6]" />
              </div>
              <p className="mt-1 text-center text-[1.1em] font-extrabold">با تشکر از خرید شما</p>
              <p className="text-center text-[0.85em]">فرآورده‌های کنجدی سنتی بهجتی اردکان</p>
            </>
          )}
          <DesignCredit className="mt-2 text-center text-[8px] text-[#476783]" />
          {large && (
            <div
              aria-hidden="true"
              className={`relative mt-3 ${compact ? 'h-[3mm]' : 'h-[5mm]'} overflow-hidden`}
            >
              <span className="absolute inset-x-0 bottom-0 h-[4mm] rounded-t-[65%] bg-[#6995c0]" />
              <span className="absolute -right-4 bottom-0 left-0 h-[3mm] rounded-t-[80%] bg-[#173f6a]" />
            </div>
          )}
        </footer>
      </div>
    </article>
  );
}
