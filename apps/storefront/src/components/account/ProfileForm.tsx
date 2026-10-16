'use client';
import { useState, type FormEvent } from 'react';
import { profileInputSchema } from '@behjati/shared';
import { useAuth } from '@/components/auth/AuthProvider';
import { UpdateAccountProfileDocument } from '@/generated/graphql';
import { authRequest } from '@/lib/auth/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
export default function ProfileForm() {
  const { user, setUser } = useAuth();
  const [values, setValues] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError('');
    setSaved(false);
    const parsed = profileInputSchema.safeParse(values);
    if (!parsed.success) {
      setError('نام و نام خانوادگی را کامل کنید و ایمیل معتبر وارد کنید یا خالی بگذارید.');
      return;
    }
    setPending(true);
    try {
      const result = await authRequest(UpdateAccountProfileDocument, { input: parsed.data });
      setUser(result.updateProfile);
      setValues({ ...parsed.data });
      setSaved(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'پروفایل ذخیره نشد.');
    } finally {
      setPending(false);
    }
  }
  return (
    <Card className="rounded-[22px] bg-card p-4 shadow-none sm:p-7">
      <form onSubmit={submit} aria-busy={pending} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {(
            [
              ['firstName', 'نام', 'given-name'],
              ['lastName', 'نام خانوادگی', 'family-name'],
              ['email', 'ایمیل (اختیاری)', 'email'],
            ] as const
          ).map(([key, label, autoComplete]) => (
            <div key={key} className={key === 'email' ? 'sm:col-span-2' : ''}>
              <label htmlFor={`profile-${key}`} className="mb-2 block text-sm font-bold">
                {label}
              </label>
              <Input
                id={`profile-${key}`}
                name={key}
                autoComplete={autoComplete}
                type={key === 'email' ? 'email' : 'text'}
                dir={key === 'email' ? 'ltr' : undefined}
                required={key !== 'email'}
                maxLength={key === 'email' ? 254 : 80}
                value={values[key]}
                onChange={(event) => {
                  setValues({ ...values, [key]: event.target.value });
                  setSaved(false);
                }}
              />
            </div>
          ))}
        </div>
        <div>
          <label htmlFor="profile-phone" className="mb-2 block text-sm font-bold">
            شماره موبایل تأییدشده
          </label>
          <Input
            id="profile-phone"
            value={user?.phone ?? ''}
            readOnly
            dir="ltr"
            aria-describedby="profile-phone-help"
          />
          <p id="profile-phone-help" className="mt-2 text-xs leading-7 text-muted-foreground">
            شمارهٔ ورود فقط پس از تأیید پیامکی قابل تغییر است؛ تغییر شماره در این بخش فعال نیست.
          </p>
        </div>
        {error && (
          <p role="alert" className="text-sm text-primary">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="text-sm text-heritage-green">
            پروفایل ذخیره شد.
          </p>
        )}
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? 'در حال ذخیره...' : 'ذخیره پروفایل'}
        </Button>
      </form>
    </Card>
  );
}
