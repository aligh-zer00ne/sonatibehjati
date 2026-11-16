export const persianDigits = (value: string) =>
  value.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.charAt(Number(digit)));
/**
 * Customer's display name. Many website customers never fill in their profile, so the
 * recipient name from their order or default address is used before falling back.
 * `unnamed` avoids repeating the phone where the card already shows it separately.
 */
export const customerName = (
  customer: {
    firstName?: string | null;
    lastName?: string | null;
    phone: string;
    defaultAddress?: { recipientName?: string | null } | null;
  },
  options: { recipient?: string | null; unnamed?: boolean } = {},
) =>
  [customer.firstName, customer.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ') ||
  options.recipient?.trim() ||
  customer.defaultAddress?.recipientName?.trim() ||
  (options.unnamed ? 'مشتری بدون نام' : persianDigits(customer.phone));
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
