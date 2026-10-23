import { useRef, useState } from 'react';
import { formatNumber } from '@behjati/shared';
import RecordDialog from './RecordDialog';
import OrderDetailsCard, { type OrderDetailsHandle } from './OrderDetailsCard';

export default function OrderDetailsDialog({
  id,
  number,
  onClose,
  onUpdated,
}: {
  id: string;
  number?: number;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const detail = useRef<OrderDetailsHandle>(null);
  const [busy, setBusy] = useState(false);
  return (
    <RecordDialog
      title="جزئیات سفارش"
      subtitle={number ? `سفارش ${formatNumber(number)}` : 'اقلام، وضعیت و اسناد سفارش'}
      icon="orders"
      busy={busy}
      onClose={() => detail.current?.requestClose()}
    >
      <div id={`order-details-${id}`} data-order-detail-dialog={id}>
        <OrderDetailsCard
          id={id}
          inDialog
          closeRef={detail}
          onBusyChange={setBusy}
          onClose={onClose}
          onUpdated={onUpdated}
        />
      </div>
    </RecordDialog>
  );
}
