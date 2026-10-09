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
    <footer className="relative isolate overflow-hidden border-t border-[#d1b184]/60 bg-[#f0e4d1]/85 pb-[calc(82px+env(safe-area-inset-bottom))] text-earth md:pb-5">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[1fr_auto] items-center gap-x-4 gap-y-4 px-4 py-5 min-[480px]:px-6 md:grid-cols-[1fr_auto] md:gap-x-8 md:gap-y-6 md:py-7 lg:grid-cols-[1.25fr_1fr_auto_auto] lg:gap-6 lg:py-8 xl:px-0">
        <div className="col-span-2 flex items-center justify-center gap-3 text-right md:col-span-1 md:justify-start">
          <Link href="/" aria-label={BRAND_NAME} className="shrink-0 rounded-lg">
            <Image
              src="/images/logo-brand.png"
              alt={BRAND_NAME}
              width={58}
              height={76}
              className="h-[66px] w-[50px] object-contain mix-blend-multiply md:h-[82px] md:w-[63px]"
            />
          </Link>
          <div>
            <h2 className="text-[13px] font-bold min-[375px]:text-[15px] md:text-base">
              {BRAND_NAME}
            </h2>
            <p className="mt-1 text-[10px] leading-5 text-earth/75 md:text-[11px]">
              ارده، حلواارده و طعم اصیل اردکان
            </p>
          </div>
        </div>
        <nav
          aria-label="لینک‌های فوتر"
          className="col-span-2 grid grid-cols-3 rounded-xl border border-earth/10 bg-white/30 p-1 text-center text-xs font-medium md:col-span-1 lg:border-0 lg:bg-transparent lg:p-0"
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-10 items-center justify-center rounded-lg px-2 transition-colors duration-300 hover:bg-white/45 hover:text-primary motion-reduce:transition-none"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div
          className="grid grid-cols-2 justify-self-center gap-2 md:flex md:justify-self-start"
          aria-label="شبکه‌های اجتماعی سنتی بهجتی"
        >
          {socialMarks.map(({ name, image }) => (
            <span
              key={name}
              title={`${name}؛ نشانی رسمی به‌زودی افزوده می‌شود`}
              aria-label={name}
              className="grid size-9 place-items-center"
            >
              <Image
                src={image}
                alt=""
                width={18}
                height={18}
                className="size-[18px] opacity-65 mix-blend-multiply"
              />
            </span>
          ))}
        </div>
        <div
          className="flex items-center justify-self-end gap-2"
          aria-label="نشان‌های اعتماد و پرداخت"
        >
          <div className="flex h-[80px] w-[100px] flex-col items-center justify-center gap-1 rounded-xl border border-earth/10 bg-white/65 p-1 text-center text-[8px] leading-3 text-[#263f61] md:w-[110px]">
            <Image
              src="/images/sep-logo.png"
              alt="لوگوی پرداخت الکترونیک سامان کیش"
              width={78}
              height={49}
              className="h-10 w-auto object-contain"
            />
            <span>پرداخت الکترونیک سامان کیش</span>
          </div>
          <EnamadBadge />
        </div>
      </div>
      <p className="mx-auto w-full max-w-[1200px] border-t border-earth/10 px-6 py-3 text-center text-[10px] leading-5 text-earth/70 md:px-6 lg:text-right xl:px-0">
        تمامی حقوق مادی و معنوی این وب‌سایت متعلق به {BRAND_NAME} است.
      </p>
    </footer>
  );
}
