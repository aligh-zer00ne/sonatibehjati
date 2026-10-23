import { useState, type ReactNode } from 'react';
import { Form, Input, Button, Alert, Skeleton } from 'antd';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BRAND_NAME } from '@behjati/shared';
import { adminLoginSchema } from '@behjati/shared/admin';
import { useAdmin } from '../auth/AdminProvider';
import { adminRequest } from '../lib/client';
import { AdminLoginDocument } from '../generated/graphql';
import AdminIcon from '../components/AdminIcon';
import AdminSkyline from '../components/AdminSkyline';
import DesignCredit from '../components/DesignCredit';
import AmbientBackdrop from '../components/AmbientBackdrop';

function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_top_right,#f3e1c2,transparent_55%),radial-gradient(ellipse_at_bottom_left,#e9dfd1,#f6f1e9_65%)] px-3 py-6 sm:px-6 sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 -right-40 -z-10 size-[600px] rounded-full border border-[#b78d43]/15 p-10"
      >
        <div className="size-full rounded-full border border-[#b78d43]/10 p-10">
          <div className="size-full rounded-full border border-[#b78d43]/10" />
        </div>
      </div>
      <div className="w-full max-w-[1000px]">
        <div className="grid overflow-hidden rounded-[26px] border border-white/80 bg-[#fffdf9] shadow-[0_24px_80px_-24px_#59341f40,0_2px_8px_#59341f08] motion-safe:animate-surface-enter md:min-h-[600px] md:grid-cols-[0.95fr_1.05fr] md:rounded-[32px]">
          <section
            aria-label="سنتی بهجتی اردکان"
            className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_top_right,#ad3120,transparent_65%),linear-gradient(145deg,#83160e,#4b0c09)] px-5 py-6 text-[#fff5e1] sm:px-8 md:flex md:flex-col md:justify-between md:px-10 md:py-10"
          >
            <AmbientBackdrop />
            <div
              className="absolute -top-24 -left-24 -z-10 size-72 rounded-full border border-[#edc57d]/15"
              aria-hidden="true"
            />
            <div className="relative z-10 hidden items-center gap-2 text-xs font-semibold tracking-wide text-[#f2d6a2] md:flex">
              <span className="size-1.5 rounded-full bg-[#edc57d]" />
              مدیریت فروشگاه
            </div>
            <div className="relative z-10 flex items-center gap-4 md:block md:py-7">
              <div className="grid h-[86px] w-[74px] shrink-0 place-items-center rounded-2xl border border-[#edc57d]/70 bg-white shadow-[0_8px_24px_#28050233] md:mb-7 md:h-[132px] md:w-[116px] md:rounded-[24px]">
                <img
                  src="/images/logo-brand.png"
                  alt={BRAND_NAME}
                  className="h-[72px] w-auto object-contain md:h-[110px]"
                />
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold text-[#f2d6a2] md:hidden">
                  مدیریت فروشگاه
                </p>
                <p className="text-[23px] leading-normal font-extrabold sm:text-[28px] md:text-[34px]">
                  سنتی بهجتی اردکان
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#f2d6a2] sm:text-sm md:mt-3">
                  <span aria-hidden="true" className="h-px w-5 bg-[#edc57d]/70 md:w-8" />
                  طعم اصالت، از دل کویر
                </div>
              </div>
            </div>
            <div className="relative z-10 hidden space-y-4 pb-20 md:block">
              {[
                {
                  icon: 'orders',
                  title: 'فروش و سفارش‌ها',
                  text: 'از ثبت سفارش تا تحویل به مشتری',
                },
                { icon: 'wallet', title: 'حساب مشتریان', text: 'دریافت، پرداخت و مانده‌حساب‌ها' },
                { icon: 'reports', title: 'گزارش‌های فروش', text: 'نگاهی روشن به عملکرد فروشگاه' },
              ].map(({ icon, title, text }) => (
                <div key={icon} className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#edc57d]/20 bg-[#edc57d]/10 text-[#edc57d]">
                    <AdminIcon name={icon as 'orders' | 'wallet' | 'reports'} className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{title}</p>
                    <p className="mt-0.5 text-xs text-[#f2d6a2]/80">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-full opacity-40 md:h-44 md:opacity-80 md:[mask-image:linear-gradient(to_top,black,transparent)]"
              aria-hidden="true"
            >
              <AdminSkyline />
            </div>
          </section>
          <section
            aria-labelledby="admin-login-title"
            className="flex min-w-0 flex-col justify-center px-5 py-7 sm:px-10 sm:py-10 md:px-12"
          >
            {children}
          </section>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-2 text-xs text-[#796653] sm:px-4">
          <a
            href="https://sonatibehjati.ir"
            className="inline-flex min-h-9 items-center gap-2 rounded-md !text-[#796653] font-semibold transition-colors hover:!text-[#96140d]"
          >
            <AdminIcon name="home" className="size-4" />
            مشاهده فروشگاه
            <AdminIcon name="arrow" className="size-3.5" />
          </a>
          <DesignCredit className="[&_a]:!text-inherit [&_a:hover]:!text-[#96140d]" />
        </div>
      </div>
    </main>
  );
}

export default function Login() {
  const { admin, loading, error: sessionError, refresh, loggedIn } = useAdmin();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { from?: string } | null;
  const target = state?.from?.startsWith('/admin') ? state.from : '/admin';
  if (admin) return <Navigate to={target} replace />;
  if (loading)
    return (
      <LoginLayout>
        <div role="status" aria-label="در حال بررسی نشست" aria-busy="true">
          <h1 id="admin-login-title" className="sr-only">
            ورود مدیر
          </h1>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </LoginLayout>
    );
  return (
    <LoginLayout>
      <div className="mb-6 flex items-center gap-3 md:mb-8">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#ead8ba] bg-[#f8efdf] text-[#966b29]">
          <AdminIcon name="lock" className="size-6" />
        </span>
        <div>
          <p className="mb-1 text-xs font-semibold text-[#937c61]">به فضای مدیریت خوش آمدید</p>
          <h1
            id="admin-login-title"
            className="text-[26px] leading-tight font-extrabold text-[#34251e] md:text-[30px]"
          >
            ورود مدیر
          </h1>
        </div>
      </div>
      <p className="mb-6 text-sm leading-7 text-[#796653]">
        برای ورود به پنل، ایمیل و رمز عبور حساب مدیریتی خود را وارد کنید.
      </p>
      {sessionError && (
        <Alert
          className="!mb-4"
          title={sessionError}
          type="error"
          action={<Button onClick={() => void refresh()}>تلاش دوباره</Button>}
        />
      )}
      <Form
        layout="vertical"
        requiredMark={false}
        disabled={pending}
        className="[&_.ant-form-item-label>label]:font-semibold"
        onFinish={async (raw) => {
          if (pending) return;
          const parsed = adminLoginSchema.safeParse(raw);
          setError('');
          if (!parsed.success) {
            setError('ایمیل و رمز ورود را بررسی کنید.');
            return;
          }
          setPending(true);
          try {
            const result = await adminRequest(AdminLoginDocument, { input: parsed.data });
            loggedIn(result.adminLogin.admin);
            navigate(target, { replace: true });
          } catch (error) {
            setError(error instanceof Error ? error.message : 'ورود انجام نشد.');
          } finally {
            setPending(false);
          }
        }}
      >
        <Form.Item
          name="email"
          label="ایمیل مدیر"
          rules={[
            { required: true, message: 'ایمیل مدیر را وارد کنید.' },
            { type: 'email', message: 'ایمیل معتبر وارد کنید.' },
          ]}
        >
          <Input
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            dir="ltr"
            maxLength={254}
            placeholder="name@example.com"
            prefix={<AdminIcon name="mail" className="mr-2 size-5 text-[#a48d74]" />}
            className="!h-[52px] !rounded-xl !bg-white !px-3.5 !text-base ![direction:ltr] [&_input]:!text-left [&_input]:![direction:ltr]"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="رمز ورود"
          rules={[{ required: true, message: 'رمز ورود را وارد کنید.' }]}
        >
          <Input
            type={passwordVisible ? 'text' : 'password'}
            autoComplete="current-password"
            dir="ltr"
            maxLength={128}
            prefix={<AdminIcon name="lock" className="mr-2 size-5 text-[#a48d74]" />}
            suffix={
              <button
                type="button"
                aria-label={passwordVisible ? 'پنهان کردن رمز ورود' : 'نمایش رمز ورود'}
                aria-pressed={passwordVisible}
                disabled={pending}
                onClick={(event) => {
                  event.stopPropagation();
                  setPasswordVisible((visible) => !visible);
                }}
                className="-my-1 -mr-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-lg text-[#927d66] transition-colors hover:bg-[#f8efdf] hover:text-[#76100b] disabled:cursor-wait"
              >
                <AdminIcon name={passwordVisible ? 'eyeOff' : 'eye'} className="size-5" />
              </button>
            }
            className="!h-[52px] !rounded-xl !bg-white !px-3.5 !text-base ![direction:ltr] [&_input]:!text-left [&_input]:![direction:ltr]"
          />
        </Form.Item>
        {error && <Alert className="!mb-4" title={error} type="error" showIcon role="alert" />}
        <Button
          type="primary"
          htmlType="submit"
          loading={pending}
          block
          className="!h-[52px] !rounded-xl !text-base !font-bold !shadow-[0_6px_16px_#96140d24]"
        >
          ورود به پنل
          {!pending && <AdminIcon name="arrow" className="size-5" />}
        </Button>
      </Form>
      <p className="mt-6 flex items-center justify-center gap-2 border-t border-[#eee5d9] pt-5 text-xs leading-6 text-[#937c61]">
        <AdminIcon name="person" className="size-4 shrink-0" />
        ویژه مدیر و همکاران مجاز فروشگاه
      </p>
    </LoginLayout>
  );
}
