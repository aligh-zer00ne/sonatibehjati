import { InputNumber } from 'antd';
import { formatAdminPrice, toRials, fromRials } from '../lib/money';
import { AmountInWords } from './AmountInWords';
import { formatNumericInput, normalizeDigits } from '../lib/numbers';

export function Money({ amount, compact = false }: { amount: number; compact?: boolean }) {
  return (
    <span className="block" data-amount={amount}>
      <span className="tabular-nums">{formatAdminPrice(amount)}</span>
      {!compact && <AmountInWords amount={amount} />}
    </span>
  );
}

export function MoneyInput({
  value,
  onChange,
  id,
  disabled,
  compact = false,
}: {
  value?: number | null;
  onChange?: (value: number | null) => void;
  id?: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const invalidPrecision = value != null && !Number.isInteger(value);
  return (
    <div className={compact ? 'group relative min-w-0' : undefined}>
      <InputNumber<number>
        id={id}
        value={value == null ? value : toRials(value)}
        onChange={(next) => onChange?.(next === null ? null : fromRials(next))}
        disabled={disabled}
        status={invalidPrecision ? 'error' : undefined}
        aria-invalid={invalidPrecision || undefined}
        aria-describedby={invalidPrecision && id ? `${id}-precision` : undefined}
        className="!w-full"
        min={0}
        max={21474836470}
        step={10}
        precision={0}
        formatter={(value) => formatNumericInput(String(value ?? ''))}
        parser={(value) => Number(normalizeDigits(value ?? '').replace(/[,٬\s]/g, ''))}
      />
      {invalidPrecision && (
        <p id={id ? `${id}-precision` : undefined} className="mt-1 text-xs text-red-700">
          مبلغ را مضرب ۱۰ ریال وارد کنید.
        </p>
      )}
      <div
        className={
          compact
            ? 'pointer-events-none absolute end-0 top-full z-10 hidden min-w-36 max-w-64 rounded-lg border border-[#e8ded1] bg-white px-2 py-1 shadow-lg group-focus-within:block'
            : undefined
        }
      >
        <AmountInWords amount={value ?? null} />
      </div>
    </div>
  );
}
