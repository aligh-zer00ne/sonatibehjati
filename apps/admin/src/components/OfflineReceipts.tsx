import { useState } from 'react';
import { Alert, Button, Modal, Select } from 'antd';
import { formatPrice } from '@behjati/shared';
import { offlinePaymentMethods, offlinePaymentMethodLabels } from '@behjati/shared/sales';
import {
  RecordAdminOfflinePaymentDocument,
  type AdminOrderFieldsFragment,
  type OfflinePaymentMethod,
  type AdminOfflinePaymentInput,
} from '../generated/graphql';
import { adminRequest } from '../lib/client';
import { Money, MoneyInput } from './Money';
import { formatDateTime } from '../lib/format';
export default function OfflineReceipts({
  order,
  onUpdated,
}: {
  order: AdminOrderFieldsFragment;
  onUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<OfflinePaymentMethod>('POS');
  const [submission, setSubmission] = useState<AdminOfflinePaymentInput | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  if (order.salesChannel === 'WEBSITE') return null;
  const remaining = order.total - order.offlinePaidAmount;
  return (
    <section
      className="mb-4 rounded-xl border border-[#e5d7c2] bg-[#fcf9f3] p-3"
      aria-label="دریافت‌های خارج از سایت"
    >
      <h4 className="mb-2 font-bold text-[#76100b]">دریافت خارج از سایت</h4>
      <p className="mb-2 text-sm">
        دریافتی: <Money amount={order.offlinePaidAmount} /> · مانده: <Money amount={remaining} />
      </p>
      <p className="mb-3 text-xs text-[#76685d]">
        ثبت مدیر فروشگاه؛ این مبالغ تأیید بانکی درگاه سامان نیستند.
      </p>
      <ul className="space-y-2">
        {order.offlinePayments.map((p) => (
          <li key={p.id} className="rounded-lg bg-white p-3 text-xs leading-6">
            <b>
              {formatPrice(p.amount)} · {offlinePaymentMethodLabels[p.method]}
            </b>
            <p>
              {formatDateTime(p.createdAt)} · <bdi className="break-all">{p.adminEmail}</bdi>
            </p>
          </li>
        ))}
      </ul>
      {remaining > 0 && order.status !== 'CANCELED' && (
        <Button
          className="!mt-3"
          onClick={() => {
            setAmount(remaining);
            setRequestId(crypto.randomUUID());
            setSubmission(null);
            setError('');
            setOpen(true);
          }}
        >
          ثبت دریافت مانده
        </Button>
      )}
      <Modal
        open={open}
        title="ثبت دریافت خارج از سایت"
        onCancel={() => {
          if (!pending) {
            setOpen(false);
            onUpdated();
          }
        }}
        confirmLoading={pending}
        okText="ثبت دریافت"
        onOk={async () => {
          if (!Number.isInteger(amount) || amount <= 0 || amount > remaining) {
            setError('مبلغ معتبر و حداکثر برابر مانده وارد کنید.');
            return;
          }
          const input = submission ?? {
            orderId: order.id,
            amount,
            method,
            requestId,
            expectedUpdatedAt: order.updatedAt,
          };
          setSubmission(input);
          setPending(true);
          setError('');
          try {
            await adminRequest(RecordAdminOfflinePaymentDocument, { input });
            setOpen(false);
            onUpdated();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'ثبت نشد.');
          } finally {
            setPending(false);
          }
        }}
      >
        <label htmlFor="offline-received" className="mb-2 block">
          مبلغ (تومان)
        </label>
        <MoneyInput
          id="offline-received"
          disabled={pending || !!submission}
          value={amount}
          onChange={(v) => setAmount(v ?? 0)}
        />
        <label className="mb-2 mt-4 block">نوع پرداخت</label>
        <Select
          className="!mb-4 w-full"
          disabled={pending || !!submission}
          value={method}
          onChange={setMethod}
          options={offlinePaymentMethods.map((value) => ({
            value,
            label: offlinePaymentMethodLabels[value],
          }))}
        />
        {error && <Alert type="error" title={error} role="alert" />}
      </Modal>
    </section>
  );
}
