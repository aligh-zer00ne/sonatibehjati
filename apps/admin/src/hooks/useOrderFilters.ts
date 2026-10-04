import { useSearchParams } from 'react-router-dom';
import { adminOrdersFilterSchema } from '@behjati/shared/admin';
import type { AdminOrdersInput } from '../generated/graphql';
export function useOrderFilters(pageSize = 20) {
  const [params, setParams] = useSearchParams();
  const raw = Object.fromEntries(params.entries());
  const parsed = adminOrdersFilterSchema.safeParse({
    ...raw,
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
          .filter(([key, value]) => key !== 'pageSize' && value != null && value !== '')
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
