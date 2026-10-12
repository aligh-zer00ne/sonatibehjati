import Link from 'next/link';
import Image from 'next/image';
import ArdakanOutline from '@/components/decoration/ardakan-outline';
import EnamadBadge from './EnamadBadge';

const links = [
  ['/', 'خانه'],
  ['/shop', 'محصولات'],
  ['/#story', 'درباره ما'],
  ['/support', 'پشتیبانی'],
] as const;

const socialMarks = [
  { name: 'ایتا', image: '/images/eitaa-social.svg' },
  { name: 'تلگرام', image: '/images/telegram-social.svg' },
  { name: 'واتساپ', image: '/images/whatsapp-social.svg' },
  { name: 'اینستاگرام', image: '/images/instagram-social.svg' },
] as const;

export default function Footer() {
  return (
    <footer className="w-full pt-3 pb-[calc(70px+env(safe-area-inset-bottom))] md:pb-0">
      <div
        data-slot="footer-banner-background"
        className="group/footer relative isolate w-full overflow-hidden rounded-none border border-[#d6a457]/40 bg-[radial-gradient(ellipse_at_bottom_left,#bc3034_0%,#981c29_45%,#6d1022_100%)] text-[#fff5e3] shadow-[0_18px_40px_-28px_rgba(109,16,34,0.65)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 z-[2] rounded-none border border-[#f4d493]/25"
        />
        <ArdakanOutline />
        <Link
          data-slot="footer-brand"
          href="/"
          className="absolute top-3 left-1/2 z-[3] flex -translate-x-1/2 flex-col items-center gap-1 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f5d59c] md:top-4"
          aria-label="فروشگاه سنتی بهجتی اردکان"
        >
          <Image
            src="/images/logo-footer.svg"
            alt="لوگوی سنتی بهجتی"
            width={88}
            height={116}
            className="h-[94px] w-[72px] object-contain drop-shadow-md md:h-[116px] md:w-[88px]"
            sizes="(min-width: 768px) 88px, 72px"
          />
          <span className="whitespace-nowrap text-xs font-bold text-[#f5d59c] md:text-sm">
            فروشگاه سنتی بهجتی اردکان
          </span>
        </Link>
        <div className="relative z-[1] flex min-h-[260px] flex-col items-start justify-end px-4 pt-[132px] pb-3 md:min-h-[290px] md:px-8 md:pt-40 md:pb-5 lg:min-h-[300px] lg:px-10">
          <div className="flex w-[150px] flex-col items-start gap-1 min-[480px]:w-auto md:gap-2">
            <nav
              aria-label="لینک‌های فوتر"
              className="order-2 flex items-center justify-start gap-1 text-[10px] font-semibold min-[480px]:text-xs md:gap-2 lg:text-sm"
            >
              {links.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex min-h-11 items-center rounded-full px-1 min-[480px]:px-2 transition-[color,background-color,translate] duration-300 hover:bg-[#f5d59c]/15 hover:text-[#f5d59c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5d59c] motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div
              className="order-1 flex items-center justify-start gap-1 md:gap-3"
              aria-label="شبکه‌های اجتماعی سنتی بهجتی"
            >
              {socialMarks.map(({ name, image }) => (
                <span
                  key={name}
                  title={`${name}؛ نشانی رسمی به‌زودی افزوده می‌شود`}
                  aria-label={name}
                  className="grid size-8 place-items-center md:size-9"
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
          </div>
          <div
            className="order-first mb-1 flex items-center justify-start gap-1.5"
            aria-label="نشان‌های اعتماد و پرداخت"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded border border-[#f4d493]/30 bg-[#fff8ed] p-1">
              <Image
                src="/images/sep-logo.png"
                alt="لوگوی پرداخت الکترونیک سامان کیش"
                width={78}
                height={49}
                className="h-auto w-9 object-contain"
              />
            </div>
            <EnamadBadge compact />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 z-[1] h-[150px] w-[100px] min-[375px]:h-[175px] min-[375px]:w-[120px] min-[480px]:h-[210px] min-[480px]:w-[160px] md:h-[250px] md:w-[240px] lg:h-[290px] lg:w-[320px]">
          <Image
            data-footer-mascot
            src="/images/home/shopping-mascot-branded.png"
            alt="پسر بچه با جعبهٔ محصولات سنتی بهجتی"
            fill
            quality={85}
            sizes="(max-width: 374px) 100px, (max-width: 479px) 120px, (max-width: 767px) 160px, (max-width: 1023px) 240px, 320px"
            className="origin-bottom-left object-contain object-left-bottom drop-shadow-[0_8px_14px_rgba(35,0,5,0.2)] transition-transform duration-700 ease-out motion-safe:group-hover/footer:-translate-y-1 motion-safe:group-hover/footer:rotate-[-2deg] motion-safe:group-focus-within/footer:-translate-y-1 motion-safe:group-focus-within/footer:rotate-[-2deg] motion-reduce:transition-none"
          />
        </div>
      </div>
    </footer>
  );
}
