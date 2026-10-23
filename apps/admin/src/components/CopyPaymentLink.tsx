import { useState } from 'react';
import { Button } from 'antd';
import AdminIcon from './AdminIcon';
import CustomerMessage from './CustomerMessage';
import { formatAdminPrice } from '../lib/money';
export default function CopyPaymentLink({
  url,
  amount,
  name,
  phone,
}: {
  url: string;
  amount: number;
  name?: string | null;
  phone?: string | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <input
        aria-label="آدرس لینک پرداخت"
        value={url}
        readOnly
        dir="ltr"
        className="min-h-11 w-full min-w-0 rounded-xl border border-[#e8ded1] bg-[#faf6ee] px-3 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setOpen(true)}
          type="primary"
          icon={<AdminIcon name="share" width={19} />}
        >
          ارسال لینک
        </Button>
        <Button onClick={() => setOpen(true)} icon={<AdminIcon name="copy" width={19} />}>
          کپی لینک
        </Button>
      </div>
      {open && (
        <CustomerMessage
          kind="PAYMENT"
          phone={phone ?? ''}
          values={{ نام_مشتری: name || 'مشتری', مبلغ: formatAdminPrice(amount), لینک_پرداخت: url }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
