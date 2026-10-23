import { BRAND_NAME, formatDate, formatNumber, orderStatusLabels } from '@behjati/shared';
import { salesChannelLabels, shippingMethodLabels } from '@behjati/shared/sales';
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
  const thermal = format === 'THERMAL';
  const address = order.address;
  const manual = order.salesChannel !== 'WEBSITE';
  const balance = order.total - order.offlinePaidAmount;
  const amount = (value: number) => formatNumber(toRials(value));
  const addressText = [address.province, address.city, address.postalAddress]
    .filter(Boolean)
    .join('، ');
  const sectionTitle = 'mb-2 flex items-center gap-2 border-b border-black/25 pb-1 font-extrabold';
  return (
    <article
      data-invoice-sheet={format}
      dir="rtl"
      className={`box-border bg-white font-sans leading-[1.9] text-black [overflow-wrap:anywhere] [&_dd]:m-0 [&_p]:m-0 print:!min-h-0 print:!w-auto print:!p-0 ${
        thermal
          ? 'w-[80mm] p-[4mm] text-[10px]'
          : format === 'A4'
            ? 'min-h-[297mm] w-[210mm] p-[12mm] text-[12px]'
            : 'min-h-[210mm] w-[148mm] p-[8mm] text-[10px]'
      }`}
    >
      <header
        className={`break-inside-avoid border-b-2 border-black pb-3 ${thermal ? 'text-center' : 'flex items-center justify-between gap-4'}`}
      >
        <div
          className={thermal ? 'flex items-center justify-center gap-3' : 'flex items-center gap-3'}
        >
          <img
            src="/images/logo-brand.png"
            alt={BRAND_NAME}
            className={
              thermal
                ? 'h-[15mm] w-auto object-contain grayscale'
                : 'h-[22mm] w-auto object-contain'
            }
          />
          <div>
            <h1 className={thermal ? 'text-[13px] font-black' : 'text-[17px] font-black'}>
              {BRAND_NAME}
            </h1>
            <p className="mt-1 text-[0.9em]">فرآورده‌های کنجدی سنتی اردکان</p>
            <p className="mt-1 font-semibold" dir="ltr">
              sonatibehjati.ir
            </p>
          </div>
        </div>
        <div className={thermal ? 'mt-3 border-t border-black pt-2' : 'text-left'}>
          <h2 className="text-[1.3em] font-extrabold">فاکتور فروش</h2>
          <p>
            فاکتور سفارش شماره <b>{formatNumber(order.number)}</b>
          </p>
          <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
        </div>
      </header>

      <section className="my-3 break-inside-avoid rounded-md border border-black/70 p-2.5">
        <h2 className={sectionTitle}>
          <AdminIcon name="person" width={15} height={15} />
          مشخصات مشتری و گیرنده
        </h2>
        <div className={thermal ? 'space-y-1' : 'grid grid-cols-[1.25fr_1fr] gap-x-3 gap-y-1'}>
          <p>
            مشتری: <b>{customerName(order.user)}</b>
          </p>
          <p>
            موبایل: <bdi>{persianDigits(order.user.phone)}</bdi>
          </p>
          <p>محل خرید: {salesChannelLabels[order.salesChannel ?? 'WEBSITE']}</p>
          <p>
            روش تحویل:{' '}
            {order.shippingMethod ? shippingMethodLabels[order.shippingMethod] : 'تحویل حضوری'}
          </p>
          {!!address.recipientName && (
            <p>
              گیرنده: <b>{address.recipientName}</b>
            </p>
          )}
          {!!address.recipientPhone && (
            <p>
              تلفن گیرنده: <bdi>{persianDigits(address.recipientPhone)}</bdi>
            </p>
          )}
          {!!addressText && <p className="col-span-2 whitespace-pre-wrap">نشانی: {addressText}</p>}
          {!!address.postalCode && (
            <p className="col-span-2">
              کد پستی: <bdi>{persianDigits(address.postalCode)}</bdi>
            </p>
          )}
        </div>
      </section>

      {thermal ? (
        <section aria-label="اقلام فاکتور" className="border-x border-t border-black/70">
          <h2 className="flex items-center gap-2 border-b border-black/70 px-2 py-1 font-extrabold">
            <AdminIcon name="products" width={15} height={15} />
            شرح خرید و مبلغ · ریال
          </h2>
          {order.items.map((item, index) => (
            <div
              key={item.id}
              data-invoice-line
              className="break-inside-avoid border-b border-black/70 px-2 py-2"
            >
              <h3 className="mb-1 font-extrabold">
                {formatNumber(index + 1)}. {item.productTitle}
              </h3>
              <p>{item.productWeight}</p>
              <dl className="mt-1 space-y-0.5 [&>div]:flex [&>div]:justify-between [&>div]:gap-2">
                <div>
                  <dt>تعداد × قیمت واحد</dt>
                  <dd>
                    {formatNumber(item.quantity)} × {amount(item.unitPrice)}
                  </dd>
                </div>
                <div>
                  <dt>تخفیف ردیف</dt>
                  <dd>{amount(item.discountAmount ?? 0)}</dd>
                </div>
                <div className="font-extrabold">
                  <dt>مبلغ ردیف</dt>
                  <dd>{amount(item.lineTotal)}</dd>
                </div>
              </dl>
            </div>
          ))}
        </section>
      ) : (
        <table
          aria-label="اقلام فاکتور"
          className="w-full table-fixed border-collapse text-[0.95em] [&_th]:border [&_th]:border-black/60 [&_th]:px-1 [&_th]:py-2 [&_td]:border [&_td]:border-black/40 [&_td]:px-1 [&_td]:py-2 [&_td]:align-top"
        >
          <colgroup>
            <col className="w-[6%]" />
            <col className="w-[29%]" />
            <col className="w-[9%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead className="table-header-group bg-[#f2f2f2] text-center font-bold">
            <tr>
              <th>ردیف</th>
              <th>شرح کالا / وزن</th>
              <th>تعداد</th>
              <th>
                قیمت واحد
                <br />
                (ریال)
              </th>
              <th>
                تخفیف ردیف
                <br />
                (ریال)
              </th>
              <th>
                مبلغ ردیف
                <br />
                (ریال)
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr
                key={item.id}
                data-invoice-line
                className="break-inside-avoid text-center even:bg-black/[0.02]"
              >
                <td>{formatNumber(index + 1)}</td>
                <td className="text-right">
                  <b>{item.productTitle}</b>
                  <span className="block text-[0.9em]">{item.productWeight}</span>
                </td>
                <td>{formatNumber(item.quantity)}</td>
                <td>{amount(item.unitPrice)}</td>
                <td>{amount(item.discountAmount ?? 0)}</td>
                <td className="font-bold">{amount(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="break-inside-avoid">
        <section
          className={`mt-3 break-inside-avoid ${thermal ? '' : 'grid grid-cols-2 items-start gap-4'}`}
        >
          <div className="rounded-md border border-black/70 p-2.5">
            <h2 className={sectionTitle}>
              <AdminIcon name="wallet" width={15} height={15} />
              وضعیت پرداخت
            </h2>
            <p className="font-bold">
              {manual
                ? `وضعیت حساب فاکتور: ${balance > 0 ? 'بدهکار' : balance < 0 ? 'بستانکار' : 'تسویه شده'}`
                : `وضعیت سفارش: ${orderStatusLabels[order.status]}`}
            </p>
            <p className="mt-1">
              {manual
                ? `دریافت ثبت‌شده در فروشگاه: ${formatAdminPrice(order.offlinePaidAmount)}`
                : order.paidAt
                  ? 'پرداخت این سفارش توسط بانک تأیید شده است.'
                  : 'پرداخت این سفارش تأیید نشده است؛ این برگه رسید پرداخت نیست.'}
            </p>
            {manual && <p>ماندهٔ این فاکتور: {formatAdminPrice(balance)}</p>}
          </div>
          <dl
            data-invoice-totals
            className={`${thermal ? 'mt-3' : ''} space-y-1 rounded-md border border-black/70 p-2.5`}
          >
            {(
              [
                ['جمع محصولات', order.subtotal],
                ['تخفیف', order.discount],
                ['هزینه ارسال', order.shipping],
                ['مبلغ سفارش', order.total],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-3 last:mt-2 last:border-t-2 last:border-black last:pt-2 last:text-[1.12em] last:font-black"
              >
                <dt>{label}</dt>
                <dd data-amount={value}>{formatAdminPrice(value)}</dd>
              </div>
            ))}
          </dl>
          <p className="col-span-2 mt-2 border-y border-dashed border-black/50 py-2 text-[0.95em] font-semibold">
            مبلغ به حروف: {amountToPersianWords(toRials(order.total), 'ریال')}
          </p>
        </section>

        <footer className="mt-4 break-inside-avoid border-t-2 border-black pt-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-extrabold">با عشق از اردکان، برای شما</p>
              <p className="mt-1 text-[0.85em]">برای مشاهدهٔ راه‌های ارتباطی، QR را اسکن کنید.</p>
              <p dir="ltr" className="mt-1 text-left text-[0.85em]">
                sonatibehjati.ir/QR
              </p>
            </div>
            <BrandQr className={thermal ? 'w-[22mm] grayscale' : 'w-[26mm]'} />
          </div>
          <DesignCredit className="mt-2 border-t border-dashed border-black/50 pt-2 text-center text-[9px]" />
        </footer>
      </div>
    </article>
  );
}
