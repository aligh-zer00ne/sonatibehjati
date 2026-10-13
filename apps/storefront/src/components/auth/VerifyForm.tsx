'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import {
  otpVerifySchema,
  normalizeDigits,
  safeReturnPath,
  formatNumber,
  OTP_LENGTH,
} from '@behjati/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequestOtpDocument, VerifyOtpDocument } from '@/generated/graphql';
import { authRequest, AuthRequestError } from '@/lib/auth/client';
import { loadChallenge, saveChallenge, clearChallenge, type Challenge } from '@/lib/auth/challenge';
import { useAuth } from './AuthProvider';
export default function VerifyForm({
  challengeId,
  returnTo,
}: {
  challengeId: string;
  returnTo: string;
}) {
  const router = useRouter();
  const next = safeReturnPath(returnTo);
  const { user, loading, setUser } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState<'verify' | 'resend' | null>(null);
  const [now, setNow] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState(0);
  useEffect(() => {
    setChallenge(loadChallenge(challengeId));
    setReady(true);
    setCode('');
    setNow(Date.now());
  }, [challengeId]);
  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [user, loading, router, next]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!ready)
    return (
      <p role="status" className="py-8 text-center text-sm text-earth">
        در حال آماده‌سازی...
      </p>
    );
  if (!challenge)
    return (
      <div className="text-center">
        <p className="mb-5 text-sm">ابتدا شماره موبایل خود را وارد کنید.</p>
        <Button asChild>
          <Link href={`/login?next=${encodeURIComponent(next)}`}>ورود با شماره موبایل</Link>
        </Button>
      </div>
    );
  const phone = challenge.phone;
  const expiry = Math.max(0, Math.ceil((Date.parse(challenge.expiresAt) - now) / 1000));
  const resendIn = Math.max(
    0,
    Math.ceil((Math.max(Date.parse(challenge.resendAt), blockedUntil) - now) / 1000),
  );
  function failed(error: unknown) {
    setError(error instanceof Error ? error.message : 'درخواست انجام نشد.');
    if (error instanceof AuthRequestError && error.retryAfter)
      setBlockedUntil(Date.now() + error.retryAfter * 1000);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge || pending || !expiry) return;
    const parsed = otpVerifySchema.safeParse({ challengeId: challenge.challengeId, phone, code });
    if (!parsed.success) {
      setError('کد پنج‌رقمی را وارد کنید.');
      return;
    }
    setPending('verify');
    setError('');
    try {
      const data = await authRequest(VerifyOtpDocument, { input: parsed.data });
      clearChallenge();
      setUser(data.verifyOtp.user);
      router.replace(next);
      router.refresh();
    } catch (error) {
      failed(error);
    } finally {
      setPending(null);
    }
  }
  async function resend() {
    if (pending || resendIn) return;
    setPending('resend');
    setError('');
    try {
      const data = await authRequest(RequestOtpDocument, { input: { phone } });
      saveChallenge(data.requestOtp);
      setChallenge(data.requestOtp);
      setCode('');
      router.replace(
        `/verify?challenge=${data.requestOtp.challengeId}&next=${encodeURIComponent(next)}`,
      );
    } catch (error) {
      failed(error);
    } finally {
      setPending(null);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5" aria-busy={pending !== null}>
      <p className="text-center text-sm text-earth">
        کد ارسال‌شده به <b dir="ltr">{phone}</b> را وارد کنید.
      </p>
      <div>
        <label htmlFor="otp-code" className="mb-2 block text-sm font-bold">
          کد ورود
        </label>
        <Input
          id="otp-code"
          name="code"
          dir="ltr"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern={`[0-9]{${OTP_LENGTH}}`}
          maxLength={OTP_LENGTH}
          value={code}
          onChange={(event) => {
            setCode(normalizeDigits(event.target.value).replace(/\D/g, '').slice(0, OTP_LENGTH));
            setError('');
          }}
          className="text-center text-2xl tracking-[0.5em]"
          aria-invalid={!!error}
          aria-describedby={error ? 'otp-help otp-error' : 'otp-help'}
          autoFocus
        />
        <p id="otp-help" className="mt-2 text-center text-xs text-muted-foreground">
          {expiry ? (
            <>
              اعتبار کد:{' '}
              <bdi dir="ltr">
                {formatNumber(Math.floor(expiry / 60)).padStart(2, '۰')}:
                {formatNumber(expiry % 60).padStart(2, '۰')}
              </bdi>
            </>
          ) : (
            'مهلت کد پایان یافته؛ کد تازه درخواست کنید.'
          )}
        </p>
      </div>
      {error && (
        <p id="otp-error" role="alert" className="rounded-xl bg-primary/5 p-3 text-sm text-primary">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending !== null || !expiry}>
        {pending === 'verify' && (
          <LoaderCircle size={19} className="animate-spin motion-reduce:animate-none" />
        )}
        {pending === 'verify' ? 'در حال تأیید...' : 'تأیید و ورود'}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={resend}
        disabled={pending !== null || resendIn > 0}
      >
        <RefreshCw size={17} />
        {pending === 'resend'
          ? 'در حال ارسال...'
          : resendIn
            ? `ارسال مجدد تا ${formatNumber(resendIn)} ثانیه`
            : 'ارسال مجدد کد'}
      </Button>
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className="flex min-h-11 items-center justify-center text-sm text-earth"
      >
        تغییر شماره موبایل
      </Link>
    </form>
  );
}
