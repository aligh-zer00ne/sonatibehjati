import { InputNumber } from 'antd';
import { formatAdminPrice, toRials, fromRials } from '../lib/money';
import { AmountInWords } from './AmountInWords';
import { formatNumericInput, normalizeDigits } from '../lib/numbers';

export function Money({ amount }: { amount: number }) {
  return (
    <span className="block" data-amount={amount}>
      <span className="tabular-nums">{formatAdminPrice(amount)}</span>
      <AmountInWords amount={amount} />
    </span>
  );
}

export function MoneyInput({
  value,
  onChange,
  id,
  disabled,
}: {
  value?: number | null;
  onChange?: (value: number | null) => void;
  id?: string;
  disabled?: boolean;
}) {
  const invalidPrecision = value != null && !Number.isInteger(value);
  return (
    <div>
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
      <AmountInWords amount={value ?? null} />
    </div>
  );
}
