import { useEffect, useState } from 'react';
import { AdminOrderDocument } from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import RecordDialog from './RecordDialog';
import DataState from './DataState';
import ManualOrderModal from './ManualOrderModal';
export default function ManualOrderEditDialog({
  id,
  onClose,
  onSaved,
}: {
  id: string;
  onClose: () => void;
  onSaved: () => void;
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
  return query.data ? (
    <ManualOrderModal editingOrder={query.data.adminOrder} onClose={onClose} onSaved={onSaved} />
  ) : (
    <RecordDialog title="ویرایش فاکتور" icon="edit" onClose={onClose}>
      <DataState error={query.error} retry={query.refresh} />
    </RecordDialog>
  );
}
