'use client';
import { useState, type FormEvent } from 'react';
import { addressInputSchema, type Coordinates } from '@behjati/shared';
import type { CheckoutAddressFragment } from '@/generated/graphql';
import { SaveCheckoutAddressDocument, ReverseCheckoutLocationDocument } from '@/generated/graphql';
import { authRequest } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AddressMap from './AddressMap';
const fields = [
  ['title', 'عنوان نشانی', 'مثلاً خانه', 80],
  ['recipientName', 'نام گیرنده', 'نام و نام خانوادگی', 100],
  ['recipientPhone', 'موبایل گیرنده', '09123456789', 30],
  ['province', 'استان', 'مثلاً یزد', 80],
  ['city', 'شهر', 'مثلاً اردکان', 80],
  ['postalCode', 'کد پستی', 'کد ده‌رقمی', 20],
  ['postalAddress', 'نشانی کامل', 'خیابان، کوچه، پلاک و واحد', 1000],
] as const;
export default function AddressForm({
  address,
  phone,
  onSaved,
  onCancel,
}: {
  address?: CheckoutAddressFragment;
  phone: string;
  onSaved: (address: CheckoutAddressFragment) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState({
    title: address?.title ?? '',
    recipientName: address?.recipientName ?? '',
    recipientPhone: address?.recipientPhone ?? phone,
    province: address?.province ?? '',
    city: address?.city ?? '',
    postalCode: address?.postalCode ?? '',
    postalAddress: address?.postalAddress ?? '',
    isDefault: address?.isDefault ?? false,
  });
  const [location, setLocation] = useState<Coordinates | null>(
    address?.latitude != null && address.longitude != null
      ? { latitude: address.latitude, longitude: address.longitude }
      : null,
  );
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [finding, setFinding] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const parsed = addressInputSchema.safeParse({
      ...value,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
    });
    if (!parsed.success) {
      setError('همهٔ بخش‌های نشانی را کامل کنید؛ موبایل یازده‌رقمی و کد پستی ده‌رقمی لازم است.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const result = await authRequest(SaveCheckoutAddressDocument, {
        id: address?.id,
        input: parsed.data,
      });
      onSaved(result.saveAddress);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'نشانی ذخیره نشد.');
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} aria-busy={pending} className="space-y-5">
      <h3 className="text-lg font-bold">{address ? 'ویرایش نشانی' : 'نشانی جدید'}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([key, label, placeholder, maxLength]) => (
          <div key={key} className={key === 'postalAddress' ? 'sm:col-span-2' : ''}>
            <label htmlFor={`address-${key}`} className="mb-2 block text-sm font-bold">
              {label}
            </label>
            <Input
              id={`address-${key}`}
              name={key}
              required
              placeholder={placeholder}
              maxLength={maxLength}
              value={value[key]}
              dir={['recipientPhone', 'postalCode'].includes(key) ? 'ltr' : undefined}
              inputMode={['recipientPhone', 'postalCode'].includes(key) ? 'numeric' : 'text'}
              onChange={(event) => setValue({ ...value, [key]: event.target.value })}
            />
          </div>
        ))}
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={value.isDefault}
          onChange={(event) => setValue({ ...value, isDefault: event.target.checked })}
          className="size-5 accent-primary"
        />
        نشانی پیش‌فرض
      </label>
      <AddressMap value={location} onChange={setLocation} />
      {location && (
        <Button
          type="button"
          variant="outline"
          disabled={finding || pending}
          onClick={async () => {
            setFinding(true);
            setError('');
            try {
              const result = await authRequest(ReverseCheckoutLocationDocument, location);
              if (result.reverseLocation)
                setValue((value) => ({ ...value, postalAddress: result.reverseLocation! }));
              else setError('نشانی پیشنهادی پیدا نشد؛ نشانی را دستی وارد کنید.');
            } catch (error) {
              setError(error instanceof Error ? error.message : 'نشانی دریافت نشد.');
            } finally {
              setFinding(false);
            }
          }}
        >
          {finding ? 'در حال دریافت نشانی...' : 'دریافت نشانی پیشنهادی'}
        </Button>
      )}
      {location && (
        <p className="text-xs text-muted-foreground">
          نشانی پیشنهادی را بررسی و پلاک و واحد را تکمیل کنید. نقشه: OpenStreetMap، نشانی پیشنهادی:
          Nominatim.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-primary/5 p-3 text-sm text-primary">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button disabled={pending} type="submit">
          {pending ? 'در حال ذخیره...' : 'ذخیره نشانی'}
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
          انصراف
        </Button>
      </div>
    </form>
  );
}
