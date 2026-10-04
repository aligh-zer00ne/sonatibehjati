import { tehranDate } from '@behjati/shared/admin';
export const tehranDay = tehranDate;
export const dayStart = (date: string) => new Date(`${date}T00:00:00+03:30`);
export const dayAfter = (date: string) => new Date(dayStart(date).getTime() + 86400000);
export function dateDays(from: string, to: string) {
  const days: string[] = [];
  for (let value = Date.parse(from); value <= Date.parse(to); value += 86400000)
    days.push(new Date(value).toISOString().slice(0, 10));
  return days;
}
export function calendarBounds(now = new Date()) {
  const today = tehranDay(now);
  const day = Number(
    new Intl.DateTimeFormat('en-US-u-ca-persian', {
      day: 'numeric',
      timeZone: 'Asia/Tehran',
    }).format(now),
  );
  const monthDate = new Date(`${today}T00:00:00Z`);
  monthDate.setUTCDate(monthDate.getUTCDate() - day + 1);
  return {
    today,
    month: monthDate.toISOString().slice(0, 10),
    from: new Date(Date.parse(today) - 29 * 86400000).toISOString().slice(0, 10),
  };
}
