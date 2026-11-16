import { useSearchParams } from 'react-router-dom';
import { adminOrdersFilterSchema } from '@behjati/shared/admin';
import type { AdminOrdersInput, OrderStatus } from '../generated/graphql';
export type OrderScope = 'all' | 'website' | 'manual';
/** Hidden unless chosen: abandoned checkouts and canceled orders clutter daily work. */
export const inactiveOrderStatuses: OrderStatus[] = ['CANCELED', 'PENDING_PAYMENT'];
/** '' = current orders (default), 'ALL' = every status, otherwise one status. */
export type OrderStatusView = '' | 'ALL' | OrderStatus;
export function useOrderFilters(pageSize = 20, scope: OrderScope = 'all') {
  const [params, setParams] = useSearchParams();
  const raw = Object.fromEntries(params.entries());
  const statusFilter = scope !== 'manual';
  const showAll = statusFilter && raw.status === 'ALL';
  const parsed = adminOrdersFilterSchema.safeParse({
    ...raw,
    manualOnly: scope === 'manual' ? true : undefined,
    status: !statusFilter || showAll ? undefined : raw.status,
    excludeStatuses: statusFilter && !showAll && !raw.status ? inactiveOrderStatuses : undefined,
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
  const update = (patch: Partial<AdminOrdersInput>, reset = true, statusView?: OrderStatusView) => {
    const next = { ...input, ...patch, ...(reset ? { page: 1 } : {}) };
    const values: Record<string, string> = Object.fromEntries(
      Object.entries(next)
        .filter(
          ([key, value]) =>
            key !== 'pageSize' &&
            key !== 'manualOnly' &&
            key !== 'excludeStatuses' &&
            !(scope === 'manual' && key === 'status') &&
            !(scope === 'website' && key === 'salesChannel') &&
            value != null &&
            value !== '',
        )
        .map(([key, value]) => [key, String(value)]),
    );
    const view = statusView ?? (showAll && !('status' in patch) ? 'ALL' : undefined);
    if (statusFilter && view !== undefined) {
      if (view) values.status = view;
      else delete values.status;
    }
    setParams(values);
  };
  return {
    input,
    update,
    statusView: (showAll ? 'ALL' : (input.status ?? '')) as OrderStatusView,
    setStatusView: (view: OrderStatusView) => update({ status: null }, true, view),
    error: parsed.success ? '' : 'فیلترهای سفارش معتبر نیستند؛ فیلترها را پاک کنید.',
    reset: () => setParams({}),
  };
}
