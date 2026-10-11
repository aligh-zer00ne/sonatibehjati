import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persianFa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorianEn from 'react-date-object/locales/gregorian_en';

// Calendar UI uses Tehran wall time; API dates and instants remain canonical.
export function calendarValue(value?: string | null, withTime = false) {
  if (!value) return null;
  let text = value;
  if (withTime) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(value));
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value;
    text = `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')}`;
  }
  return new DateObject({
    date: text,
    format: withTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD',
    calendar: gregorian,
    locale: gregorianEn,
  }).convert(persian, persianFa);
}

export function calendarInput(value: DateObject | null, withTime = false) {
  if (!value?.isValid) return null;
  const date = new DateObject(value).convert(gregorian, gregorianEn);
  if (!withTime) return date.format('YYYY-MM-DD');
  return new Date(`${date.format('YYYY-MM-DD')}T${date.format('HH:mm')}:00+03:30`).toISOString();
}
