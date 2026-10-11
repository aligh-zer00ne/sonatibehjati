import { describe, it, expect } from 'vitest';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persianFa from 'react-date-object/locales/persian_fa';
import { calendarInput, calendarValue } from './calendar';
describe('Calendar and Tehran time conversion', () => {
  it('round trips a day without interpreting it as a local or UTC instant', () => {
    const date = calendarValue('2026-03-21');
    expect(date?.format('YYYY/MM/DD')).toBe('۱۴۰۵/۰۱/۰۱');
    expect(calendarInput(date)).toBe('2026-03-21');
    expect(calendarInput(calendarValue('2026-10-11'))).toBe('2026-10-11');
    expect(calendarValue(null)).toBeNull();
  });
  it('displays Tehran midnight across UTC date boundaries and preserves selected minutes', () => {
    const date = calendarValue('2026-10-10T20:45:00.000Z', true);
    expect(date?.format('HH:mm')).toBe('۰۰:۱۵');
    expect(calendarInput(date, true)).toBe('2026-10-10T20:45:00.000Z');
    const selected = new DateObject({
      calendar: persian,
      locale: persianFa,
      date: '1405/01/01 13:40',
      format: 'YYYY/MM/DD HH:mm',
    });
    expect(calendarInput(selected, true)).toBe('2026-03-21T10:10:00.000Z');
  });
});
