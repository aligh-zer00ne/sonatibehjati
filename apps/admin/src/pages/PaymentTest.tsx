import { useEffect, useState } from 'react';
import { Alert, Button, Card, Typography } from 'antd';
import { formatPrice } from '@behjati/shared';
import { paymentStatusLabels, pendingPaymentStates } from '@behjati/shared/payments';
import {
  AdminGatewayTestDocument,
  StartAdminGatewayTestDocument,
  RetryAdminPaymentDocument,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { adminRequest } from '../lib/client';
import DataState from '../components/DataState';
import { formatDateTime } from '../lib/format';

export default function PaymentTest() {
  const query = useAdminQuery(AdminGatewayTestDocument, {});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const rows = query.data?.adminGatewayTest.payments;
  useEffect(() => {
    if (!rows?.some((row) => pendingPaymentStates.includes(row.payment.status))) return;
    const timer = setInterval(query.refresh, 10000);
    return () => clearInterval(timer);
  }, [rows, query.refresh]);
  if (!query.data) return <DataState error={query.error} retry={query.refresh} />;
  const state = query.data.adminGatewayTest;
  const active = state.payments.some((row) => pendingPaymentStates.includes(row.payment.status));
  return (
    <>
      <Typography.Title level={2}>تست درگاه پرداخت</Typography.Title>
      <Card title="آزمون واقعی درگاه سامان">
        <Alert
          type="info"
          showIcon
          title="این تست از حساب مدیر انجام می‌شود و به پیامک یا ورود مشتری نیاز ندارد."
        />
        <p className="my-4 text-sm leading-8">
          مبلغ تست <b>{formatPrice(state.amount)}</b> است و واقعاً از کارت کسر می‌شود. پس از تأیید
          پرداخت توسط بانک، برگشت خودکار وجه درخواست می‌شود. زمان نمایش وجه در حساب به بانک
          صادرکننده کارت بستگی دارد.
        </p>
        <p className="mb-4 text-sm">
          شماره ترمینال: <bdi>{state.terminalId ?? 'تنظیم نشده'}</bdi>
        </p>
        {!state.enabled && (
          <Alert
            className="!mb-4"
            type="warning"
            title="تست درگاه در تنظیمات سرور فعال نشده است."
          />
        )}
        {active && (
          <Alert
            className="!mb-4"
            type="info"
            title="نتیجهٔ تست قبلی در حال بررسی است؛ تا روشن شدن وضعیت دوباره پرداخت نکنید."
          />
        )}
        {error && <Alert role="alert" className="!mb-4" type="error" title={error} />}
        <div className="flex flex-wrap gap-3">
          <Button
            type="primary"
            loading={pending}
            disabled={!state.enabled || active}
            onClick={async () => {
              if (pending) return;
              setPending(true);
              setError('');
              try {
                const result = await adminRequest(StartAdminGatewayTestDocument, {});
                const target = new URL(result.startAdminGatewayTest.redirectUrl);
                if (
                  !['http:', 'https:'].includes(target.protocol) ||
                  !/^\/payment\/sep\/redirect\/[a-f0-9-]{36}\/[a-f0-9]{64}$/.test(target.pathname)
                )
                  throw new Error('نشانی درگاه معتبر نیست.');
                window.location.assign(target.href);
              } catch (e) {
                setError(e instanceof Error ? e.message : 'اتصال انجام نشد.');
                setPending(false);
                query.refresh();
              }
            }}
          >
            شروع تست واقعی درگاه سامان
          </Button>
          <Button onClick={query.refresh}>به‌روزرسانی نتیجه‌ها</Button>
        </div>
      </Card>
      <Card title="تاریخچه تست‌ها">
        {!state.payments.length && <p className="text-sm">هنوز تستی انجام نشده است.</p>}
        <div className="space-y-4">
          {state.payments.map((row) => {
            const p = row.payment;
            const verified = p.reason === 'ADMIN_GATEWAY_TEST' && !!p.verifiedAt;
            return (
              <div key={p.id} className="space-y-3 rounded-xl border border-[#e8ded1] p-4">
                <p className="font-bold">{paymentStatusLabels[p.status]}</p>
                {verified && (
                  <p className="text-sm font-bold text-[#31724d]">بانک پرداخت تست را تأیید کرد.</p>
                )}
                <p className="break-all text-xs">
                  شناسه تست: <bdi>{p.id}</bdi>
                </p>
                <p className="text-xs">
                  {formatDateTime(p.createdAt)} · {formatPrice(p.amount)}
                </p>
                <p className="break-all text-sm">
                  رسید بانک: <bdi>{p.reference ?? '—'}</bdi> · شماره پیگیری:{' '}
                  <bdi>{p.rrn ?? p.traceNumber ?? '—'}</bdi>
                </p>
                {p.bankCode !== null && p.bankCode !== undefined && (
                  <p className="text-sm">
                    کد پاسخ بانک: <bdi>{p.bankCode}</bdi>
                    {p.status === 'TOKEN_FAILED' && p.bankCode === 8
                      ? ' — آدرس سرور پذیرنده نامعتبر است؛ تنظیم مبدأ درخواست را نزد سامان بررسی کنید.'
                      : ''}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {row.redirectUrl && <Button href={row.redirectUrl}>ادامه تست در بانک</Button>}
                  <Button href={row.resultUrl}>نمایش نتیجه تست</Button>
                  {pendingPaymentStates.includes(p.status) && (
                    <Button
                      disabled={pending}
                      onClick={async () => {
                        setPending(true);
                        setError('');
                        try {
                          await adminRequest(RetryAdminPaymentDocument, { paymentId: p.id });
                        } catch (e) {
                          setError(e instanceof Error ? e.message : 'بررسی انجام نشد.');
                        } finally {
                          setPending(false);
                          query.refresh();
                        }
                      }}
                    >
                      پیگیری بانک
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
