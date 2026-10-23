import Settlements from '../pages/Settlements';
import RecordDialog from './RecordDialog';

export default function CustomerAccountDialog({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  return (
    <RecordDialog title="حساب و فاکتورهای مشتری" icon="ledger" onClose={onClose} width={1120}>
      <Settlements fixedCustomerId={id} inDialog />
    </RecordDialog>
  );
}
