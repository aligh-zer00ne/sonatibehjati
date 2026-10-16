'use client';
import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { formatNumber } from '@behjati/shared';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  MyAddressesDocument,
  DeleteCheckoutAddressDocument,
  SaveCheckoutAddressDocument,
  type CheckoutAddressFragment,
} from '@/generated/graphql';
import { useAccountQuery } from '@/hooks/useAccountQuery';
import { authRequest } from '@/lib/auth/client';
import AddressForm from '@/components/checkout/AddressForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import AccountDataState from './AccountDataState';
export default function Addresses() {
  const { user } = useAuth();
  const query = useAccountQuery(MyAddressesDocument, {});
  const [form, setForm] = useState<CheckoutAddressFragment | 'new' | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function change(address: CheckoutAddressFragment, remove: boolean) {
    setPending(true);
    setError('');
    try {
      if (remove) await authRequest(DeleteCheckoutAddressDocument, { id: address.id });
      else {
        const {
          id,
          title,
          recipientName,
          recipientPhone,
          province,
          city,
          postalAddress,
          postalCode,
          latitude,
          longitude,
        } = address;
        await authRequest(SaveCheckoutAddressDocument, {
          id,
          input: {
            title,
            recipientName,
            recipientPhone,
            province,
            city,
            postalAddress,
            postalCode,
            latitude,
            longitude,
            isDefault: true,
          },
        });
      }
      setDeleting(null);
      query.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'نشانی تغییر نکرد.');
    } finally {
      setPending(false);
    }
  }
  if (!query.data) return <AccountDataState error={query.error} retry={query.refresh} />;
  if (form)
    return (
      <Card className="rounded-[22px] bg-card p-4 shadow-none sm:p-7">
        <AddressForm
          key={form === 'new' ? 'new' : form.id}
          phone={user?.phone ?? ''}
          address={form === 'new' ? undefined : form}
          onSaved={() => {
            setForm(null);
            query.refresh();
          }}
          onCancel={() => setForm(null)}
        />
      </Card>
    );
  const addresses = query.data.myAddresses;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {formatNumber(addresses.length)} نشانی ذخیره‌شده
        </p>
        <Button
          disabled={pending}
          onClick={() => {
            setForm('new');
            setError('');
            setDeleting(null);
          }}
        >
          <Plus size={18} />
          افزودن نشانی
        </Button>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-primary/5 p-3 text-sm text-primary">
          {error}
        </p>
      )}
      {!addresses.length && (
        <Card className="rounded-3xl bg-card/85">
          <EmptyState
            title="هنوز نشانی ندارید"
            description="نشانی خود را برای ثبت سفارش ذخیره کنید."
            icon={<MapPin size={36} />}
          />
        </Card>
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        {addresses.map((address) => (
          <Card key={address.id} className="rounded-[22px] bg-card p-4 shadow-none sm:p-5">
            <h2 className="mb-3 flex flex-wrap items-center gap-2 font-extrabold">
              <MapPin size={18} className="text-clay" />
              {address.title}
              {address.isDefault && (
                <span className="rounded-full bg-surface px-3 py-1 text-xs text-earth">
                  پیش‌فرض
                </span>
              )}
            </h2>
            <p className="text-sm leading-8 break-words">
              {address.province}، {address.city}، {address.postalAddress}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              گیرنده: {address.recipientName} ·{' '}
              <bdi>
                {address.recipientPhone.replace(/\d/g, (digit) =>
                  '۰۱۲۳۴۵۶۷۸۹'.charAt(Number(digit)),
                )}
              </bdi>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              کد پستی:{' '}
              <bdi>
                {address.postalCode.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.charAt(Number(digit)))}
              </bdi>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={pending}
                aria-label={`ویرایش ${address.title}`}
                onClick={() => {
                  setForm(address);
                  setError('');
                  setDeleting(null);
                }}
              >
                ویرایش
              </Button>
              <Button
                variant="ghost"
                disabled={pending}
                aria-label={`حذف ${address.title}`}
                onClick={() => {
                  setDeleting(address.id);
                  setError('');
                }}
              >
                حذف
              </Button>
              {!address.isDefault && (
                <Button
                  variant="ghost"
                  disabled={pending}
                  aria-label={`پیش‌فرض کردن ${address.title}`}
                  onClick={() => void change(address, false)}
                >
                  پیش‌فرض کردن
                </Button>
              )}
            </div>
            {deleting === address.id && (
              <div className="mt-4 rounded-xl border border-border bg-surface/60 p-3">
                <p className="mb-3 text-sm">نشانی «{address.title}» حذف شود؟</p>
                <div className="flex gap-2">
                  <Button disabled={pending} onClick={() => void change(address, true)}>
                    {pending ? 'در حال حذف...' : 'تأیید حذف'}
                  </Button>
                  <Button variant="outline" disabled={pending} onClick={() => setDeleting(null)}>
                    انصراف
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
