'use client';
import { useEffect, useState } from 'react';
import { StartOrderPaymentDocument } from '@/generated/graphql';
import { authRequest } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
export default function PayOrderButton({ orderId }: { orderId: string }) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void fetch('/payment/sep/availability', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (active) setAvailable(data.available === true);
      })
      .catch(() => {
        if (active) setError('وضعیت درگاه دریافت نشد؛ صفحه را تازه کنید.');
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="space-y-3">
      {available === false ? (
        <p className="text-sm leading-7 text-muted-foreground">
          پرداخت آنلاین هنوز فعال نشده است؛ سفارش شما محفوظ است.
        </p>
      ) : (
        <Button
          className="w-full"
          disabled={!available || pending}
          onClick={async () => {
            if (pending) return;
            setPending(true);
            setError('');
            try {
              const result = await authRequest(StartOrderPaymentDocument, { orderId });
              const url = result.startOrderPayment.redirectUrl;
              if (!/^\/payment\/sep\/redirect\/[a-f0-9-]{36}\/[a-f0-9]{64}$/.test(url))
                throw new Error('نشانی درگاه معتبر نیست.');
              window.location.assign(url);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'اتصال به درگاه انجام نشد.');
              setPending(false);
            }
          }}
        >
          {pending ? 'در حال اتصال به درگاه…' : 'پرداخت امن با درگاه سامان'}
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm leading-7 text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
