import { lazy, Suspense, useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import { AdminOrderDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import DataState from './DataState';
const Invoice = lazy(() => import('../pages/Invoice'));
const ShippingLabel = lazy(() => import('../pages/ShippingLabel'));
export default function QuickOrderPrint({
  id,
  view,
  onClose,
}: {
  id: string;
  view: 'invoice' | 'label';
  onClose: () => void;
}) {
  const [trigger] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  useEffect(
    () => () => {
      requestAnimationFrame(() => {
        if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      });
    },
    [trigger],
  );
  const query = useAdminQuery(AdminOrderDocument, { id });
  const order = query.data?.adminOrder;
  const loading = (
    <Modal
      open
      title={view === 'invoice' ? 'آماده‌سازی فاکتور' : 'آماده‌سازی لیبل'}
      onCancel={onClose}
      footer={<Button onClick={onClose}>بستن</Button>}
    >
      <DataState error={query.error} retry={query.refresh} />
    </Modal>
  );
  if (!order) return loading;
  return (
    <Suspense fallback={loading}>
      {view === 'invoice' ? (
        <Invoice order={order} onClose={onClose} />
      ) : (
        <ShippingLabel order={order} onClose={onClose} />
      )}
    </Suspense>
  );
}
