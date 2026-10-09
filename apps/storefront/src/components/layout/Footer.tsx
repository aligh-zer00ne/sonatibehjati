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
    <footer className="px-2 pt-3 pb-[calc(82px+env(safe-area-inset-bottom))] md:px-4 md:pb-6">
      <div
        data-slot="footer-banner-background"
        className="group/footer relative isolate mx-auto w-full max-w-[1200px] overflow-hidden rounded-[26px] border border-[#d6a457]/40 bg-[radial-gradient(ellipse_at_bottom_left,#bc3034_0%,#981c29_45%,#6d1022_100%)] text-[#fff5e3] shadow-[0_18px_40px_-28px_rgba(109,16,34,0.65)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 z-[2] rounded-[20px] border border-[#f4d493]/25"
        />
        <ArdakanOutline />
        <div className="relative z-[1] grid grid-cols-2 gap-y-3 px-5 pt-5 md:min-h-[270px] md:grid-cols-[minmax(0,1fr)_184px_minmax(0,1fr)] md:gap-x-6 md:px-8 md:pt-0 lg:min-h-[290px] lg:gap-x-8 lg:px-10">
          <div className="col-span-2 row-start-1 flex flex-col items-start gap-1 justify-self-start md:col-span-1 md:col-start-1 md:self-center md:gap-3 md:py-8">
            <nav
              aria-label="لینک‌های فوتر"
              className="flex items-center justify-end gap-1 text-[13px] font-semibold md:gap-2 lg:gap-4 lg:text-sm"
            >
              {links.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex min-h-11 items-center rounded-full px-3 transition-[color,background-color,translate] duration-300 hover:bg-[#f5d59c]/15 hover:text-[#f5d59c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5d59c] motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div
              className="flex items-center justify-end gap-2 md:gap-3"
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
          </div>
          <div
            className="col-span-2 row-start-2 flex items-center justify-center gap-2 md:col-span-1 md:col-start-2 md:row-start-1 md:self-center"
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
          <div
            aria-hidden="true"
            className="col-span-2 row-start-3 h-[160px] min-[375px]:h-[180px] min-[480px]:h-[210px] md:hidden"
          />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 z-[1] h-[160px] w-[150px] min-[375px]:h-[180px] min-[375px]:w-[180px] min-[480px]:h-[210px] min-[480px]:w-[220px] md:h-[250px] md:w-[240px] lg:h-[290px] lg:w-[320px]">
          <Image
            data-footer-mascot
            src="/images/home/shopping-mascot-branded.png"
            alt="پسر بچه با جعبهٔ محصولات سنتی بهجتی"
            fill
            quality={85}
            sizes="(max-width: 374px) 150px, (max-width: 479px) 180px, (max-width: 767px) 220px, (max-width: 1023px) 240px, 320px"
            className="origin-bottom-left object-contain object-left-bottom drop-shadow-[0_8px_14px_rgba(35,0,5,0.2)] transition-transform duration-700 ease-out motion-safe:group-hover/footer:-translate-y-1 motion-safe:group-hover/footer:rotate-[-2deg] motion-safe:group-focus-within/footer:-translate-y-1 motion-safe:group-focus-within/footer:rotate-[-2deg] motion-reduce:transition-none"
          />
        </div>
      </div>
    </footer>
  );
}
