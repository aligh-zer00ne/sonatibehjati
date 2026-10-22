import { amountToPersianWords } from '../lib/numbers';
import { toRials } from '../lib/money';

export function AmountInWords({
  amount,
  currency = 'ریال',
}: {
  amount: number | null;
  currency?: string;
}) {
  const words = amount === null ? '' : amountToPersianWords(toRials(amount), currency);
  return (
    <span
      className="mt-1 block min-h-5 text-[12px] font-normal leading-5 text-[#7d746a]"
      aria-live="polite"
    >
      {words || '\u00a0'}
    </span>
  );
}
