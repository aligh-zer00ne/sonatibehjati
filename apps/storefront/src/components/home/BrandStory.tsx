import Link from 'next/link';
import { ArrowLeft, MapPin, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BrandStory() {
  return (
    <section
      id="story"
      aria-labelledby="story-title"
      className="group/story relative isolate my-8 h-[430px] scroll-mt-8 overflow-hidden rounded-[24px] border border-[#69422e]/25 bg-[#3c2319] shadow-[0_18px_45px_-30px_rgba(49,21,13,0.4)] min-[375px]:h-[460px] min-[480px]:h-[500px] sm:h-[400px] md:my-12 md:h-[430px] lg:h-[480px] lg:rounded-[28px] xl:my-14"
    >
      <span id="ardakan" aria-hidden="true" className="absolute top-0 scroll-mt-8" />
      <div
        data-slot="story-image"
        className="absolute inset-0 min-[480px]:right-auto min-[480px]:w-[334px] min-[480px]:[mask-image:linear-gradient(to_right,#000_87%,transparent)] sm:w-[78%] sm:[mask-image:linear-gradient(to_right,#000_78%,transparent)] lg:w-[60%]"
      >
        <picture>
          <source
            media="(min-width: 640px)"
            srcSet="/images/home/story-desktop-v6-768.webp 768w, /images/home/story-desktop-v6.webp 1536w"
            sizes="(min-width: 1024px) 720px, (min-width: 875px) calc(78vw - 37.44px), (min-width: 768px) 645px, 600px"
          />
          <img
            src="/images/home/story-mobile-v6.webp"
            srcSet="/images/home/story-mobile-v6-512.webp 512w, /images/home/story-mobile-v6-768.webp 768w, /images/home/story-mobile-v6.webp 1024w"
            sizes="(min-width: 480px) 334px, calc(100vw - 32px)"
            alt="بادگیر و بام‌های خشتی اردکان در نور عصر، با سفره‌ای از ارده و کنجد در پیش‌زمینه"
            width={1024}
            height={1536}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover sm:object-left lg:object-center"
          />
        </picture>
      </div>
      <div
        data-slot="story-shade"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(270deg,rgba(38,20,13,0.65),transparent_80%),linear-gradient(180deg,rgba(38,20,13,0.2),transparent_65%,rgba(38,20,13,0.2))] sm:bg-[linear-gradient(270deg,#3c2319_0%,rgba(60,35,25,0.98)_28%,rgba(60,35,25,0.55)_48%,transparent_69%)]"
      />
      <div
        data-slot="story-copy"
        className="absolute top-6 right-5 z-[1] w-[55%] text-right min-[375px]:top-7 min-[480px]:right-7 min-[480px]:w-[61%] sm:top-10 sm:right-[5%] sm:w-[43%] lg:top-12 lg:right-[6%]"
      >
        <p className="mb-2 flex items-center gap-1.5 text-[10px] leading-5 font-medium text-[#f4d69f] sm:text-[11px] lg:text-xs">
          <Wheat className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="sm:hidden">سنتی بهجتی و اردکان</span>
          <span className="hidden sm:inline">داستان سنتی بهجتی و اردکان</span>
        </p>
        <h2
          id="story-title"
          className="text-[23px] leading-[1.65] font-extrabold text-[#fff0d6] min-[375px]:text-[26px] min-[480px]:text-[30px] sm:text-[27px] md:text-[31px] lg:text-[39px]"
        >
          از دل اردکان
          <span className="block text-[#f4d69f]">تا سفرهٔ شما</span>
        </h2>
        <p className="mt-3 text-[12px] leading-6 text-[#f5e6ce] md:text-[13px] md:leading-7 lg:mt-4 lg:max-w-[390px] lg:text-sm lg:leading-8">
          <span className="md:hidden">قصهٔ کنجد و اصالت؛ از شهر بادگیرها تا سفرهٔ هر روز شما.</span>
          <span className="hidden md:inline">
            میان کوچه‌های خشتی و بادگیرهای اردکان، کنجد بخشی از قصهٔ طعم‌هاست. سنتی بهجتی این پیوند
            را با ارده، حلواارده و فرآورده‌های کنجدی به سفرهٔ شما می‌آورد.
          </span>
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-4 max-w-full gap-2 border-[#e4c18d]/60 bg-[#3c2319]/20 px-3 text-[11px] text-[#fff0d6] hover:border-[#f4d69f] hover:bg-[#f4d69f]/15 hover:text-[#fff0d6] lg:mt-6 lg:px-5 lg:text-sm"
        >
          <Link href="/shop">
            <span className="md:hidden">محصولات ما</span>
            <span className="hidden md:inline">آشنایی با محصولات</span>
            <ArrowLeft className="size-3.5 shrink-0 lg:size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <p className="absolute bottom-5 left-5 z-[1] flex items-center gap-1.5 text-[10px] font-medium text-[#fff0d6] sm:text-xs lg:bottom-7 lg:left-7">
        <MapPin className="size-3.5" aria-hidden="true" /> اردکان، شهر بادگیرها
      </p>
    </section>
  );
}
