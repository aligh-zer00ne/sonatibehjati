export const persianDigits = (value: string) =>
  value.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.charAt(Number(digit)));
export const customerName = (customer: {
  firstName?: string | null;
  lastName?: string | null;
  phone: string;
}) =>
  [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
  persianDigits(customer.phone);
export const chartDate = (value: string) =>
  new Intl.DateTimeFormat('fa-IR', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Tehran',
  }).format(new Date(`${value}T12:00:00Z`));

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Tehran',
  }).format(new Date(value));
