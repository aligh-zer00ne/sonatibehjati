import Link from 'next/link';
import Image from 'next/image';
import { BRAND_NAME } from '@behjati/shared';
import EnamadBadge from './EnamadBadge';

const links = [
  ['/', 'خانه'],
  ['/shop', 'محصولات'],
  ['/#story', 'درباره ما'],
] as const;

const socialMarks = [
  { name: 'ایتا', image: '/images/eitaa-social.svg' },
  { name: 'تلگرام', image: '/images/telegram-social.svg' },
  { name: 'واتساپ', image: '/images/whatsapp-social.svg' },
  { name: 'اینستاگرام', image: '/images/instagram-social.svg' },
] as const;

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-[#d9ad69]/50 bg-[linear-gradient(115deg,#680a12,#8f111b_55%,#5c0b15)] pb-[calc(82px+env(safe-area-inset-bottom))] text-[#fff4df] md:pb-5">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-y-3 px-4 py-3 min-[480px]:px-6 md:gap-5 md:py-4 xl:px-0">
        <Link href="/" aria-label={BRAND_NAME} className="shrink-0 rounded-lg bg-[#fff7ea] px-1.5 py-1">
          <Image src="/images/logo-brand.png" alt={BRAND_NAME} width={58} height={76} className="h-[50px] w-[40px] object-contain mix-blend-multiply md:h-[70px] md:w-[54px]" />
        </Link>
        <div className="flex flex-col items-center gap-2 md:items-start">
          <nav aria-label="لینک‌های فوتر" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium md:justify-start md:gap-x-5 md:text-xs">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="min-h-9 content-center transition-colors hover:text-[#f6d48e]">{label}</Link>
            ))}
          </nav>
          <p className="hidden text-center text-[10px] text-[#f6e4cf]/75 md:block md:text-right">ارده، حلواارده و طعم اصیل اردکان با سنتی بهجتی</p>
        </div>
        <div className="flex items-center gap-1 md:gap-2" aria-label="شبکه‌های اجتماعی سنتی بهجتی">
          {socialMarks.map(({ name, image }) => (
            <span key={name} title={`${name}؛ نشانی رسمی به‌زودی افزوده می‌شود`} aria-label={name} className="grid size-8 place-items-center rounded-full border border-white/25 md:size-9">
              <Image src={image} alt="" width={18} height={18} className="size-[18px] brightness-0 invert" />
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          <div className="flex h-[70px] w-[100px] flex-col items-center justify-center rounded-lg border border-white/20 bg-white/95 p-1 text-center text-[8px] leading-3 text-[#263f61] md:w-[110px]">
            <Image src="/images/sep-logo.png" alt="لوگوی پرداخت الکترونیک سامان کیش" width={78} height={49} className="h-9 w-auto object-contain" />
            <span>پرداخت الکترونیک سامان کیش</span>
          </div>
          <EnamadBadge />
        </div>
      </div>
      <p className="mx-auto w-full max-w-[1200px] border-t border-white/15 px-4 py-2 text-center text-[10px] text-[#f6e4cf]/65 min-[480px]:px-6 md:text-right xl:px-0">تمامی حقوق مادی و معنوی این وب‌سایت متعلق به {BRAND_NAME} است.</p>
    </footer>
  );
}
