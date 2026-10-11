import { describe, it, expect } from 'vitest';
import {
  amountToPersianWords,
  numberToPersianWords,
  formatNumericInput,
  parseLocalizedInteger,
} from './numbers';
describe('Localized amounts supplied by the client', () => {
  it('formats and parses Persian and Arabic digits without changing the amount', () => {
    expect(formatNumericInput('۱۲۳۴۵۶۷')).toBe('1٬234٬567');
    expect(parseLocalizedInteger('١٬٢٣٤٬٥٦٧')).toBe(1234567);
    expect(parseLocalizedInteger('')).toBeNull();
    expect(parseLocalizedInteger('9007199254740992')).toBeNull();
  });
  it('spells zero, groups, negative numbers and currency correctly', () => {
    expect(amountToPersianWords(0)).toBe('صفر تومان');
    expect(amountToPersianWords(125000)).toBe('صد و بیست و پنج هزار تومان');
    expect(numberToPersianWords(1001001)).toBe('یک میلیون و یک هزار و یک');
    expect(numberToPersianWords(-210)).toBe('منفی دویست و ده');
    expect(numberToPersianWords(1.5)).toBe('');
  });
});
