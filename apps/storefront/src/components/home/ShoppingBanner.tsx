import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Package, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SesameMotif } from '@/components/decoration/sesame-motif';

function ArdakanOutline() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 520 250"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute right-0 bottom-0 h-[220px] w-[420px] max-w-full text-[#edc57d]/30 md:h-full md:w-[45%]"
    >
      <path d="M6 238H518M20 238V179H89V238M28 179V164H80V179M37 164V143H71V164M34 143H74M29 139H79M40 150V160M50 150V160M60 150V160M26 194H83M41 238V214Q54 192 67 214V238M95 238V160H186V238M104 160V146H177V160M111 146Q140 94 170 146M140 116V106M119 238V200Q140 173 161 200V238M122 162H158M127 169H153M193 238V190H248V238M201 190V176H241V190M211 238V218Q221 203 231 218V238M375 238V172H458V238M383 172Q416 122 450 172M416 145V135M392 238V203Q416 174 441 203V238M471 238V189H506V238M479 198H498M479 207H498" />
      {[
        { x: 255, y: 40, height: 150 },
        { x: 337, y: 79, height: 111 },
      ].map(({ x, y, height }) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <path
            d={`M0 ${height + 48}V0H52V${height + 48}M-5 0H57L52 -8H0ZM-6 -8H58M0 62H52M0 67H52M7 7V55M17 7V55M27 7V55M37 7V55M46 7V55M0 ${height}H52M-4 ${height + 5}H56M8 ${height + 48}V${height + 19}Q26 ${height + 2} 44 ${height + 19}V${height + 48}`}
          />
          <path d="M7 15H46M7 45H46M8 78H17V102H8ZM35 78H44V102H35Z" />
        </g>
      ))}
      <path d="M178 238V218M178 218Q162 195 150 207M178 218Q183 187 201 194M178 218Q158 211 151 222M178 218Q196 204 206 213M15 148L10 143M10 148L15 143M473 124L478 129M478 124L473 129" />
    </svg>
  );
}

export default function ShoppingBanner() {
  return (
    <section
      id="shopping-banner"
      aria-labelledby="shopping-banner-title"
      className="group/shopping relative isolate my-8 overflow-hidden rounded-[26px] border border-[#d6a457]/40 bg-[radial-gradient(ellipse_at_bottom_left,#bc3034_0%,#981c29_45%,#6d1022_100%)] text-[#fff5e3] shadow-[0_18px_40px_-28px_rgba(109,16,34,0.65)] md:my-12 xl:my-14"
    >
      <ArdakanOutline />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 rounded-[20px] border border-[#f4d493]/25"
      />
      <SesameMotif
        kind="leaf"
        aria-hidden="true"
        className="pointer-events-none absolute top-5 right-5 size-16 -rotate-45 text-[#f4d493]/25 md:size-24"
      />
      <div className="relative grid items-end px-6 pt-8 min-[480px]:px-8 md:min-h-[245px] md:grid-cols-[1fr_1.45fr_0.9fr] md:gap-4 md:px-10 md:pt-0">
        <div className="hidden self-center md:block">
          <p className="text-sm font-semibold text-[#f5d59c]">از اردکان، برای شما</p>
          <p className="mt-2 max-w-[180px] text-xs leading-7 text-[#fff5e3]/85">
            دنیایی از طعم‌های کنجدی
            <br />
            با سنتی بهجتی
          </p>
        </div>
        <div className="relative z-[1] text-center md:self-center md:py-8 md:text-right">
          <p className="mb-2 text-xs font-medium text-[#f5d59c]">انتخاب بعدی سفرهٔ شما</p>
          <h2
            id="shopping-banner-title"
            className="text-[25px] leading-[1.7] font-extrabold min-[480px]:text-[30px] lg:text-[33px]"
          >
            با خیال راحت انتخاب کنید
          </h2>
          <p className="mx-auto mt-2 max-w-[360px] text-xs leading-7 text-[#fff5e3]/85 md:mx-0 lg:text-[13px]">
            طعم‌ها و بسته‌بندی‌ها را ببینید و محصول موردعلاقه‌تان را پیدا کنید.
          </p>
          <Button
            variant="secondary"
            asChild
            className="mt-4 gap-2 border border-[#f4d493] bg-[#f5d59c] text-xs font-bold text-[#651024] shadow-[0_6px_20px_rgba(40,0,8,0.15)] hover:bg-[#ffe6b9] focus-visible:ring-[#f5d59c]/60"
          >
            <Link href="/shop">
              مشاهده محصولات <ArrowLeft size={17} aria-hidden="true" />
            </Link>
          </Button>
          <div className="mt-4 flex justify-center gap-4 text-[10px] text-[#fff5e3]/85 md:justify-start">
            <span className="flex items-center gap-1.5">
              <Wheat size={13} aria-hidden="true" /> تنوع طعم‌ها
            </span>
            <span className="flex items-center gap-1.5">
              <Package size={13} aria-hidden="true" /> بسته‌بندی‌های مختلف
            </span>
          </div>
        </div>
        <div className="relative mx-auto mt-4 h-[190px] w-[240px] min-[480px]:h-[220px] min-[480px]:w-[270px] md:-ml-6 md:h-[245px] md:w-[calc(100%+24px)] lg:h-[270px]">
          <Image
            src="/images/home/shopping-mascot-v4.webp"
            alt="شخصیت کارتونی خندان با لباس قرمز و جعبهٔ محصولات"
            fill
            quality={85}
            sizes="(max-width: 767px) 270px, 320px"
            className="object-contain object-bottom drop-shadow-[0_8px_14px_rgba(35,0,5,0.2)] transition-transform duration-700 ease-out motion-safe:group-hover/shopping:-translate-y-1 motion-safe:group-hover/shopping:rotate-[-2deg] motion-reduce:transition-none"
          />
        </div>
      </div>
    </section>
  );
}
