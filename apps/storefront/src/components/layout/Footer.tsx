import Link from 'next/link';
import Image from 'next/image';
import ArdakanOutline from '@/components/decoration/ardakan-outline';
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
    <footer className="relative isolate overflow-hidden border-t border-[#d6a457]/50 bg-[radial-gradient(ellipse_at_bottom_left,#bc3034_0%,#981c29_45%,#6d1022_100%)] pb-[calc(82px+env(safe-area-inset-bottom))] text-[#fff5e3] md:pb-0">
      <ArdakanOutline />
      <div className="relative mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0,1fr)_104px] items-center gap-x-2 gap-y-3 px-4 pt-5 pb-4 min-[375px]:grid-cols-[minmax(0,1fr)_138px] min-[480px]:grid-cols-[minmax(0,1fr)_170px] min-[480px]:px-6 md:min-h-[240px] md:grid-cols-[200px_1fr_220px] md:gap-x-6 md:gap-y-2 md:py-6 xl:px-0">
        <nav
          aria-label="لینک‌های فوتر"
          className="col-span-2 row-start-1 flex items-center justify-center gap-6 border-b border-[#f4d493]/25 pb-3 text-[13px] font-semibold md:col-span-1 md:col-start-2 md:self-end md:gap-8 md:border-0 md:pb-0 md:text-sm"
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-11 items-center rounded-sm transition-colors duration-300 hover:text-[#f5d59c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5d59c] motion-reduce:transition-none"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div
          className="col-start-1 row-start-2 flex items-center justify-center gap-2 md:col-start-2 md:self-start md:gap-3"
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
                width={22}
                height={22}
                className="size-[22px] opacity-85 brightness-0 invert"
              />
            </span>
          ))}
        </div>
        <div
          className="col-start-1 row-start-3 flex items-center justify-center gap-2 md:row-span-2 md:row-start-1"
          aria-label="نشان‌های اعتماد و پرداخت"
        >
          <div className="flex h-[80px] w-[84px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-[#f4d493]/30 bg-[#fff8ed] p-1 text-center text-[8px] leading-3 text-[#263f61] min-[375px]:w-[100px]">
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
        <div className="relative col-start-2 row-span-2 row-start-2 h-[152px] w-full self-end min-[375px]:h-[174px] min-[480px]:h-[195px] md:col-start-3 md:row-start-1 md:h-[220px]">
          <Image
            data-footer-mascot
            src="/images/home/shopping-mascot-branded.png"
            alt="پسر بچه با جعبهٔ محصولات سنتی بهجتی"
            fill
            quality={85}
            sizes="(max-width: 374px) 104px, (max-width: 479px) 138px, (max-width: 767px) 170px, 220px"
            className="object-contain object-bottom drop-shadow-[0_8px_14px_rgba(35,0,5,0.2)]"
          />
        </div>
      </div>
    </footer>
  );
}
