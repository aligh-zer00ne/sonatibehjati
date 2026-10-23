import { normalizeDigits } from '@behjati/shared';
export function smsHref(phone: string, text: string, userAgent = navigator.userAgent) {
  const normalized = normalizeDigits(phone).replace(/[\s-]/g, '');
  if (!/^(?:09\d{9}|\+?989\d{9})$/.test(normalized)) return undefined;
  const number = normalized.startsWith('98') ? `+${normalized}` : normalized;
  const separator = /iPhone|iPad|iPod/.test(userAgent) ? '&' : '?';
  return `sms:${number}${separator}body=${encodeURIComponent(text)}`;
}
