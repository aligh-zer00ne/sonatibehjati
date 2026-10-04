import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Skeleton } from 'antd';
import type { AdminOrderSummaryFieldsFragment } from '../generated/graphql';
import { orderMapAdapter } from '../lib/order-map';
export default function OrdersMapView({ orders }: { orders: AdminOrderSummaryFieldsFragment[] }) {
  const container = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(orders);
  useEffect(() => {
    const controller = new AbortController();
    let destroy: (() => void) | undefined;
    setError('');
    setLoading(true);
    if (container.current)
      void orderMapAdapter
        .create(
          container.current,
          JSON.parse(key) as AdminOrderSummaryFieldsFragment[],
          (id) => navigate(`/admin/orders/${id}`),
          controller.signal,
        )
        .then((instance) => {
          if (controller.signal.aborted) instance.destroy();
          else {
            destroy = instance.destroy;
            setLoading(false);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setError('نقشه دریافت نشد. فهرست سفارش‌ها را استفاده کنید.');
            setLoading(false);
          }
        });
    return () => {
      controller.abort();
      destroy?.();
    };
  }, [key, navigate]);
  return (
    <>
      <div
        ref={container}
        dir="ltr"
        role="region"
        aria-label="نقشه سفارش‌ها"
        className="relative z-0 h-[440px] rounded-lg border border-slate-200"
      />
      {loading && <Skeleton active className="mt-3" />}
      {error && <Alert type="error" title={error} role="alert" className="mt-3" />}
    </>
  );
}
