import { InputNumber } from 'antd';
import { formatPrice } from '@behjati/shared';
import { AmountInWords } from './AmountInWords';
import { formatNumericInput, normalizeDigits } from '../lib/numbers';

export function Money({ amount }: { amount: number }) {
  return (
    <span className="block" data-amount={amount}>
      <span className="tabular-nums">{formatPrice(amount)}</span>
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
  return (
    <div>
      <InputNumber<number>
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="!w-full"
        min={0}
        max={2147483647}
        precision={0}
        formatter={(value) => formatNumericInput(String(value ?? ''))}
        parser={(value) => Number(normalizeDigits(value ?? '').replace(/[,٬\s]/g, ''))}
      />
      <AmountInWords amount={value ?? null} />
    </div>
  );
}
