import { Tag } from 'antd';
import { Money } from './Money';
export default function AccountStatus({
  balance,
  amount = true,
}: {
  balance: number;
  amount?: boolean;
}) {
  return (
    <span
      className="inline-flex flex-wrap items-center gap-2"
      data-account-status={balance > 0 ? 'debtor' : balance < 0 ? 'creditor' : 'settled'}
    >
      <Tag color={balance > 0 ? 'red' : balance < 0 ? 'gold' : 'green'}>
        {balance > 0 ? 'بدهکار' : balance < 0 ? 'بستانکار' : 'تسویه شده'}
      </Tag>
      {amount && <Money amount={Math.abs(balance)} />}
    </span>
  );
}
