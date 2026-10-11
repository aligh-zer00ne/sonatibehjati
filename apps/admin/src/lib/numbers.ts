const digitMap: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

export function normalizeDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => digitMap[digit] ?? digit);
}

export type NumericInputFormat = 'integer' | 'decimal';

/**
 * Formats a value while it is being typed, without changing its numeric value.
 * The Persian thousands and decimal separators are accepted by the parsers below.
 */
export function formatNumericInput(value: string, format: NumericInputFormat = 'integer') {
  const normalized = normalizeDigits(value)
    .replace(/[,٬\s]/g, '')
    .replace(/٫/g, '.');
  const hasDecimalSeparator = format === 'decimal' && normalized.includes('.');
  const [integerPart = '', ...fractionParts] = normalized.split('.');
  const integerDigits = integerPart.replace(/\D/g, '');
  const groupedInteger = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '٬');

  if (!hasDecimalSeparator) return groupedInteger;

  const fractionDigits = fractionParts.join('').replace(/\D/g, '').slice(0, 3);
  return `${groupedInteger}٫${fractionDigits}`;
}

export function parseLocalizedInteger(value: string) {
  const normalized = normalizeDigits(value).replace(/[,٬\s]/g, '');
  if (!/^\d+$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function parseLocalizedDecimal(value: string) {
  const normalized = normalizeDigits(value)
    .replace(/[,٬\s]/g, '')
    .replace('٫', '.');
  if (!/^\d+(?:\.\d{1,3})?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeIban(value: string) {
  return normalizeDigits(value).replace(/[\s-]/g, '').toUpperCase();
}

const ones = [
  '',
  'یک',
  'دو',
  'سه',
  'چهار',
  'پنج',
  'شش',
  'هفت',
  'هشت',
  'نه',
  'ده',
  'یازده',
  'دوازده',
  'سیزده',
  'چهارده',
  'پانزده',
  'شانزده',
  'هفده',
  'هجده',
  'نوزده',
] as const;

const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'] as const;
const hundreds = [
  '',
  'صد',
  'دویست',
  'سیصد',
  'چهارصد',
  'پانصد',
  'ششصد',
  'هفتصد',
  'هشتصد',
  'نهصد',
] as const;
const scales = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون', 'کوادریلیون'] as const;

function threeDigitsToPersianWords(value: number) {
  const parts: string[] = [];
  const hundred = Math.floor(value / 100);
  const remainder = value % 100;

  if (hundred) parts.push(hundreds[hundred]!);
  if (remainder < 20) {
    if (remainder) parts.push(ones[remainder]!);
  } else {
    const ten = Math.floor(remainder / 10);
    const one = remainder % 10;
    parts.push(tens[ten]!);
    if (one) parts.push(ones[one]!);
  }

  return parts.join(' و ');
}

/** Converts a safe integer to Persian words. */
export function numberToPersianWords(value: number) {
  if (!Number.isSafeInteger(value)) return '';
  if (value === 0) return 'صفر';

  const negative = value < 0;
  let remaining = Math.abs(value);
  const parts: string[] = [];
  let scaleIndex = 0;

  while (remaining > 0 && scaleIndex < scales.length) {
    const group = remaining % 1000;
    if (group) {
      const words = threeDigitsToPersianWords(group);
      parts.unshift(scales[scaleIndex] ? `${words} ${scales[scaleIndex]}` : words);
    }
    remaining = Math.floor(remaining / 1000);
    scaleIndex += 1;
  }

  if (remaining > 0) return '';
  return `${negative ? 'منفی ' : ''}${parts.join(' و ')}`;
}

export function amountToPersianWords(value: number, currency = 'تومان') {
  const words = numberToPersianWords(value);
  return words ? `${words} ${currency}` : '';
}
