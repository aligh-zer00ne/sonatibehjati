import { useSearchParams } from 'react-router-dom';
import { adminOrdersFilterSchema } from '@behjati/shared/admin';
import type { AdminOrdersInput } from '../generated/graphql';
export type OrderScope = 'all' | 'website' | 'manual';
export function useOrderFilters(pageSize = 20, scope: OrderScope = 'all') {
  const [params, setParams] = useSearchParams();
  const raw = Object.fromEntries(params.entries());
  const parsed = adminOrdersFilterSchema.safeParse({
    ...raw,
    manualOnly: scope === 'manual' ? true : undefined,
    status: scope === 'manual' ? undefined : raw.status,
    salesChannel:
      scope === 'website'
        ? 'WEBSITE'
        : scope === 'manual' && raw.salesChannel === 'WEBSITE'
          ? undefined
          : raw.salesChannel,
    page: raw.page ? Number(raw.page) : 1,
    pageSize,
    number: raw.number ? Number(raw.number) : undefined,
  });
  const input: AdminOrdersInput = parsed.success ? parsed.data : { page: 1, pageSize };
  const update = (patch: Partial<AdminOrdersInput>, reset = true) => {
    const next = { ...input, ...patch, ...(reset ? { page: 1 } : {}) };
    setParams(
      Object.fromEntries(
        Object.entries(next)
          .filter(
            ([key, value]) =>
              key !== 'pageSize' &&
              key !== 'manualOnly' &&
              !(scope === 'manual' && key === 'status') &&
              !(scope === 'website' && key === 'salesChannel') &&
              value != null &&
              value !== '',
          )
          .map(([key, value]) => [key, String(value)]),
      ),
    );
  };
  return {
    input,
    update,
    error: parsed.success ? '' : 'فیلترهای سفارش معتبر نیستند؛ فیلترها را پاک کنید.',
    reset: () => setParams({}),
  };
}
