import { Button, InputNumber, Select } from 'antd';
import { MoneyInput } from './Money';
import AdminIcon from './AdminIcon';
import { formatNumber } from '@behjati/shared';
import { formatAdminPrice } from '../lib/money';

type Line = {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  discountKind: 'PERCENT' | 'FIXED';
  discountValue: number;
};
export default function ManualOrderLines({
  lines,
  updateLine,
  removeLine,
}: {
  lines: Line[];
  updateLine: (id: string, patch: Partial<Line>) => void;
  removeLine: (id: string) => void;
}) {
  const grid =
    'grid grid-cols-[48px_minmax(0,1fr)_minmax(0,1fr)] items-start gap-2 lg:grid-cols-[24px_minmax(120px,1.3fr)_56px_minmax(100px,1fr)_minmax(100px,1fr)_minmax(176px,1.3fr)_minmax(108px,1fr)_28px] lg:items-center';
  return (
    <div className="overflow-visible rounded-xl border border-[#ddd3c5] bg-white" data-invoice-grid>
      {lines.length > 0 && (
        <div
          aria-hidden="true"
          className={`${grid} !hidden rounded-t-xl border-b border-[#ddd3c5] bg-[#eee6d9] px-3 py-3 text-xs font-bold text-[#59432c] lg:!grid`}
          data-invoice-header
        >
          <span>#</span>
          <span>شرح کالا</span>
          <span>تعداد</span>
          <span>قیمت واحد</span>
          <span>قیمت کل</span>
          <span>تخفیف</span>
          <span>خالص ردیف</span>
          <span />
        </div>
      )}
      <ul className="divide-y divide-[#e8ded1]" aria-label="ردیف‌های فاکتور دستی">
        {lines.map((l, index) => (
          <li
            key={l.productId}
            data-manual-line={l.productId}
            className={`${grid} relative px-3 py-2.5 transition-colors even:bg-[#faf8f4] focus-within:bg-[#fff7e7]`}
          >
            <span className="hidden text-center text-xs text-[#8b7761] lg:block">
              {formatNumber(index + 1)}
            </span>
            <b className="col-span-2 min-w-0 self-center break-words text-sm lg:col-span-1">
              {l.title}
            </b>
            <div className="col-start-1 row-start-2 min-w-0 lg:col-auto lg:row-auto">
              <label className="mb-1 block text-xs lg:sr-only" htmlFor={`qty-${l.productId}`}>
                تعداد
              </label>
              <InputNumber
                id={`qty-${l.productId}`}
                aria-label={`تعداد ${l.title}`}
                className="!w-full"
                min={1}
                max={99}
                precision={0}
                value={l.quantity}
                onChange={(v) => {
                  if (v) updateLine(l.productId, { quantity: v });
                }}
              />
            </div>
            <div className="row-start-2 min-w-0 lg:row-auto">
              <label className="mb-1 block text-xs lg:sr-only" htmlFor={`unit-${l.productId}`}>
                قیمت واحد (ریال)
              </label>
              <MoneyInput
                compact
                id={`unit-${l.productId}`}
                value={l.unitPrice}
                onChange={(v) => updateLine(l.productId, { unitPrice: v ?? 0 })}
              />
            </div>
            <div className="row-start-2 min-w-0 lg:row-auto">
              <label className="mb-1 block text-xs lg:sr-only" htmlFor={`total-${l.productId}`}>
                قیمت کل (ریال)
              </label>
              <MoneyInput
                compact
                id={`total-${l.productId}`}
                value={l.unitPrice * l.quantity}
                onChange={(v) => updateLine(l.productId, { unitPrice: (v ?? 0) / l.quantity })}
              />
            </div>
            <div className="col-span-2 col-start-1 row-start-3 flex min-w-0 items-end gap-1.5 lg:col-span-1 lg:col-auto lg:row-auto">
              <div className="w-[72px] shrink-0 lg:w-20">
                <label className="mb-1 block text-xs lg:sr-only">نوع تخفیف ردیف</label>
                <Select
                  aria-label={`نوع تخفیف ${l.title}`}
                  className="w-full"
                  value={l.discountKind}
                  labelRender={({ value }) => (value === 'PERCENT' ? '٪' : 'ریال')}
                  options={[
                    { value: 'FIXED', label: 'مبلغی' },
                    { value: 'PERCENT', label: 'درصدی' },
                  ]}
                  onChange={(discountKind) =>
                    updateLine(l.productId, { discountKind, discountValue: 0 })
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <label
                  className="mb-1 block text-xs lg:sr-only"
                  htmlFor={`discount-${l.productId}`}
                >
                  مقدار تخفیف
                </label>
                {l.discountKind === 'FIXED' ? (
                  <MoneyInput
                    compact
                    id={`discount-${l.productId}`}
                    value={l.discountValue}
                    onChange={(v) => updateLine(l.productId, { discountValue: v ?? 0 })}
                  />
                ) : (
                  <InputNumber
                    id={`discount-${l.productId}`}
                    aria-label={`درصد تخفیف ${l.title}`}
                    className="!w-full"
                    min={0}
                    max={100}
                    precision={2}
                    suffix="٪"
                    value={l.discountValue}
                    onChange={(v) => updateLine(l.productId, { discountValue: v ?? 0 })}
                  />
                )}
              </div>
            </div>
            <div className="col-start-3 row-start-3 min-w-0 self-center text-end lg:col-auto lg:row-auto">
              <span className="mb-1 block text-xs text-[#857467] lg:hidden">خالص ردیف</span>
              <b className="block break-words text-xs tabular-nums text-[#58132b] lg:text-sm">
                {(() => {
                  const gross = l.unitPrice * l.quantity;
                  const discount =
                    l.discountKind === 'PERCENT'
                      ? Math.floor((gross * l.discountValue) / 100)
                      : l.discountValue;
                  return discount > gross ? 'تخفیف نامعتبر' : formatAdminPrice(gross - discount);
                })()}
              </b>
            </div>
            <Button
              type="text"
              danger
              className="!col-start-3 !row-start-1 !justify-self-end lg:!col-auto lg:!row-auto"
              aria-label={`حذف ${l.title}`}
              icon={<AdminIcon name="trash" width={18} />}
              onClick={() => removeLine(l.productId)}
            />
          </li>
        ))}
      </ul>
      {!lines.length && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl px-3 py-9 text-sm text-[#76685d]">
          <AdminIcon name="products" />
          <b className="text-[#59432c]">فاکتور هنوز خالی است</b>
          <span className="text-xs">
            کالا را جستجو و انتخاب کنید؛ هر کالا یک ردیف در فاکتور دارد.
          </span>
        </div>
      )}
    </div>
  );
}
