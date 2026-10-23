import 'server-only';
import type { PaymentResultData } from '@behjati/shared/payments';
export async function paymentApi<T>(
  action: 'callback' | 'status' | 'redirect' | 'request-status' | 'request-start',
  id: string,
  key: string,
  fields?: Record<string, string>,
): Promise<T> {
  if (!/^[a-f0-9-]{36}$/.test(id) || !/^[a-f0-9]{64}$/.test(key) || !process.env.AUTH_PROXY_SECRET)
    throw new Error('Invalid payment link');
  const endpoint = new URL(
    `/payments/sep/${action}`,
    process.env.API_URL ?? 'http://localhost:4000/graphql',
  );
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Proxy-Key': process.env.AUTH_PROXY_SECRET,
    },
    body: JSON.stringify({ id, key, ...(fields ? { fields } : {}) }),
    cache: 'no-store',
    signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) throw new Error('Payment unavailable');
  return response.json() as Promise<T>;
}
export const paymentResult = (id: string, key: string) =>
  paymentApi<PaymentResultData>('status', id, key);
