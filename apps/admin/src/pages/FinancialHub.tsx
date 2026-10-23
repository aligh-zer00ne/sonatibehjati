import { useAdmin } from '../auth/AdminProvider';
import { accountEntryInputSchema } from '@behjati/shared/admin';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import AdminIcon, { type AdminIconName } from '../components/AdminIcon';
import AmbientBackdrop from '../components/AmbientBackdrop';
const operations: { href: string; title: string; description: string; icon: AdminIconName }[] = [
  {
    href: 'receipt',
    title: 'دریافت از مشتری',
    description: 'ثبت وجه نقد، کارت‌خوان، کارت به کارت یا چک و تسویهٔ فاکتورهای باز.',
    icon: 'wallet',
  },
  {
    href: 'payment',
    title: 'پرداخت به مشتری',
    description: 'بازپرداخت بستانکاری مشتری با ثبت سند مستقل در گردش حساب.',
    icon: 'logout',
  },
  {
    href: 'account',
    title: 'حساب و فاکتورها',
    description: 'ماندهٔ لحظه‌ای، جزئیات دریافت و پرداخت و فاکتورهای مستقل هر مشتری.',
    icon: 'history',
  },
  {
    href: 'links',
    title: 'لینک‌های پرداخت',
    description: 'ساخت و اشتراک‌گذاری لینک ماندهٔ مشتری یا دریافت مبلغ دلخواه از هر شخص.',
    icon: 'link',
  },
];
export default function FinancialHub() {
  const [params] = useSearchParams();
  const { admin } = useAdmin();
  let pending: { customerId: string; direction: string } | null = null;
  try {
    const stored = JSON.parse(sessionStorage.getItem('behjati-admin-account-request') ?? 'null');
    const p = accountEntryInputSchema.safeParse(stored?.input);
    if (stored?.adminId === admin?.id && p.success) pending = p.data;
  } catch {
    /* Storage may be unavailable. */
  }
  if (params.get('customerId'))
    return <Navigate replace to={'/admin/settlements/account?' + params.toString()} />;
  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <header className="relative isolate overflow-hidden rounded-[26px] bg-[linear-gradient(125deg,#83160e,#4b0c09)] p-6 text-[#fff5e1] sm:p-8">
        <AmbientBackdrop />
        <div className="relative z-10">
          <p className="text-sm text-[#edc57d]">امور مالی فروش دستی</p>
          <h1 className="mt-3 text-[30px] font-extrabold">دریافت و پرداخت</h1>
          <p className="mt-3 max-w-xl text-sm leading-8 text-[#f2d6a2]">
            عملیات موردنظر را انتخاب کنید؛ هر دریافت و پرداخت با سند مستقل در حساب مشتری ثبت می‌شود.
          </p>
        </div>
      </header>
      {pending && (
        <Link
          className="block rounded-2xl border border-[#d9c7a8] bg-[#faf6ee] p-4 font-bold !text-[#76100b]"
          to={`/admin/settlements/${pending.direction === 'PAYMENT' ? 'payment' : 'receipt'}?customerId=${pending.customerId}`}
        >
          ادامهٔ بررسی درخواست قبلی دریافت و پرداخت ←
        </Link>
      )}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {operations.map((item) => (
          <Link
            key={item.href}
            to={'/admin/settlements/' + item.href}
            className="group relative flex min-h-[245px] flex-col overflow-hidden rounded-[26px] border border-[#e8ded1] bg-white p-6 !text-[#34251e] shadow-[0_6px_22px_#62452f0a] transition duration-300 hover:-translate-y-1 hover:!border-[#c49536] hover:shadow-[0_14px_30px_#62452f18] motion-reduce:transform-none"
          >
            <span className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#c49536,#76100b)]" />
            <span className="mb-5 grid size-14 place-items-center rounded-[18px] bg-[linear-gradient(135deg,#a13521,#76100b)] text-[#fff0ca] shadow-[0_6px_16px_#76100b26]">
              <AdminIcon name={item.icon} width={27} height={27} />
            </span>
            <h2 className="text-lg font-extrabold">{item.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-8 text-[#796653]">{item.description}</p>
            <span className="mt-5 flex items-center justify-between border-t border-dashed border-[#e8ded1] pt-3 text-xs font-bold text-[#a17b3d]">
              ورود به بخش
              <AdminIcon name="arrow" width={18} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
