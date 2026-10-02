'use client';
import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoaderCircle, ArrowLeft } from 'lucide-react';
import { phoneSchema, safeReturnPath } from '@behjati/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequestOtpDocument } from '@/generated/graphql';
import { authRequest, AuthRequestError } from '@/lib/auth/client';
import { saveChallenge } from '@/lib/auth/challenge';
import { useAuth } from './AuthProvider';
export default function LoginForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const next = safeReturnPath(returnTo);
  const { user, loading } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const remaining = Math.max(0, Math.ceil((blockedUntil - now) / 1000));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || remaining) return;
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      setError('شماره موبایل معتبر وارد کنید.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const data = await authRequest(RequestOtpDocument, { input: { phone: parsed.data } });
      saveChallenge(data.requestOtp);
      router.push(
        `/verify?challenge=${data.requestOtp.challengeId}&next=${encodeURIComponent(next)}`,
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ارسال کد انجام نشد.');
      if (error instanceof AuthRequestError && error.retryAfter)
        setBlockedUntil(Date.now() + error.retryAfter * 1000);
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5" aria-busy={pending}>
      <div>
        <label htmlFor="login-phone" className="mb-2 block text-sm font-bold">
          شماره موبایل
        </label>
        <Input
          id="login-phone"
          name="phone"
          type="tel"
          dir="ltr"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="09123456789"
          maxLength={30}
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setError('');
          }}
          aria-invalid={!!error}
          aria-describedby={error ? 'login-error' : 'phone-help'}
          className="text-center text-lg tracking-wider"
          autoFocus
        />
        <p id="phone-help" className="mt-2 text-xs text-muted-foreground">
          کد ورود به این شماره ارسال می‌شود.
        </p>
      </div>
      {error && (
        <p
          id="login-error"
          role="alert"
          className="rounded-xl bg-primary/5 p-3 text-sm text-primary"
        >
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending || remaining > 0}>
        {pending ? (
          <LoaderCircle className="animate-spin motion-reduce:animate-none" size={19} />
        ) : (
          <ArrowLeft size={19} />
        )}
        {pending
          ? 'در حال ارسال کد...'
          : remaining
            ? `تلاش دوباره تا ${new Intl.NumberFormat('fa-IR').format(remaining)} ثانیه`
            : 'دریافت کد ورود'}
      </Button>
      <p className="text-center text-xs leading-7 text-muted-foreground">
        با تأیید شماره موبایل، حساب شما ساخته می‌شود یا وارد حساب قبلی می‌شوید.
      </p>
      <Link href="/shop" className="flex min-h-11 items-center justify-center text-sm text-earth">
        ادامهٔ مشاهده محصولات
      </Link>
    </form>
  );
}
