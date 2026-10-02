import { createHmac, timingSafeEqual } from 'node:crypto';
export const hashOtp = (secret: string, id: string, phone: string, code: string) =>
  createHmac('sha256', secret).update(`${id}:${phone}:${code}`).digest('hex');
export function matchesOtp(
  secret: string,
  id: string,
  phone: string,
  code: string,
  expected: string,
) {
  const hash = hashOtp(secret, id, phone, code);
  return (
    expected.length === hash.length && timingSafeEqual(Buffer.from(hash), Buffer.from(expected))
  );
}
