import { Button, InputNumber, Select } from 'antd';
import { MoneyInput } from './Money';
import AdminIcon from './AdminIcon';

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
    'grid grid-cols-[60px_minmax(0,1fr)_minmax(0,1fr)] items-start gap-2 lg:grid-cols-[minmax(140px,1.4fr)_64px_minmax(125px,1fr)_minmax(125px,1fr)_minmax(200px,1.5fr)_36px] lg:items-center lg:gap-3';
  return (
    <>
      <div
        aria-hidden="true"
        className={`${grid} mb-2 !hidden px-3 text-xs text-[#76685d] lg:!grid`}
      >
        <span>کالا</span>
        <span>تعداد</span>
        <span>قیمت واحد (ریال)</span>
        <span>قیمت کل (ریال)</span>
        <span>تخفیف ردیف</span>
        <span />
      </div>
      <ul className="space-y-2" aria-label="ردیف‌های فاکتور دستی">
        {lines.map((l) => (
          <li
            key={l.productId}
            data-manual-line={l.productId}
            className={`${grid} rounded-xl border border-[#e8ded1] bg-white p-3 transition-colors focus-within:border-[#c99a71]`}
          >
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
            <div className="col-span-3 flex min-w-0 items-end gap-2 lg:col-span-1">
              <div className="w-24 shrink-0">
                <label className="mb-1 block text-xs lg:sr-only">نوع تخفیف ردیف</label>
                <Select
                  aria-label={`نوع تخفیف ${l.title}`}
                  className="w-full"
                  value={l.discountKind}
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
        <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-[#dacbb7] px-3 py-6 text-sm text-[#76685d]">
          <AdminIcon name="products" />
          اولین کالا را از جستجوی بالا اضافه کنید.
        </div>
      )}
    </>
  );
}
