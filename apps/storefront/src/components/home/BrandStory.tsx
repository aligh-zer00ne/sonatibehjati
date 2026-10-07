import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SesameMotif } from '@/components/decoration/sesame-motif';

export default function BrandStory() {
  return (
    <section
      id="story"
      aria-labelledby="story-title"
      className="group/story relative my-8 grid grid-cols-2 scroll-mt-8 overflow-hidden rounded-[24px] border border-clay/30 bg-[linear-gradient(125deg,#edbf83,#f5d8a7_45%,#dba16a)] md:my-12 md:rounded-[28px] xl:my-14"
    >
      <span id="ardakan" aria-hidden="true" className="absolute top-0 scroll-mt-8" />
      <div
        data-slot="story-image"
        className="relative order-2 my-3 mr-0 ml-3 min-h-[260px] overflow-hidden rounded-[12px_45px_12px_12px] border border-clay/20 min-[480px]:my-5 min-[480px]:ml-5 sm:min-h-[360px] md:m-6 md:min-h-[420px] md:rounded-[20px_90px_20px_20px] lg:m-8 lg:rounded-[24px_130px_24px_24px]"
      >
        <Image
          src="/images/home/ardakan-courtyard.webp"
          alt="حیاط خشتی، طاق‌ها و بادگیرهای اردکان در نور گرم کویر"
          fill
          quality={85}
          sizes="(max-width: 1199px) 50vw, 600px"
          className="object-cover object-[60%_center] transition-transform duration-1000 ease-out motion-safe:group-hover/story:scale-[1.035] motion-reduce:transition-none"
        />
        <div className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-[#482818]/85 to-transparent px-5 pt-16 pb-5 text-white sm:block">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <MapPin size={17} aria-hidden="true" /> اردکان، شهر بادگیرها
          </p>
          <p className="mt-1 text-xs text-white/85">روایتی از خاک، آفتاب و کنجد</p>
        </div>
      </div>
      <div
        data-slot="story-copy"
        className="relative order-1 min-w-0 self-center py-5 pr-3 pl-2 min-[375px]:pr-4 min-[480px]:py-7 min-[480px]:pr-6 min-[480px]:pl-3 md:py-10 md:pr-8 lg:pr-12 lg:pl-5"
      >
        <SesameMotif
          kind="seeds"
          aria-hidden="true"
          className="pointer-events-none absolute top-4 left-3 size-12 rotate-12 text-clay/20 md:left-5 md:size-20"
        />
        <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold text-primary min-[480px]:mb-3 min-[480px]:gap-2 min-[480px]:text-xs">
          <Wheat className="size-3 shrink-0 min-[480px]:size-4" aria-hidden="true" /> داستان سنتی
          بهجتی
        </p>
        <h2
          id="story-title"
          className="max-w-[440px] text-[17px] leading-[1.7] font-extrabold text-[#482818] min-[375px]:text-xl min-[480px]:text-[24px] md:text-[27px] lg:text-[35px]"
        >
          <span className="hidden sm:inline">سنتی بهجتی؛ </span>از دل اردکان
          <span className="block text-primary">تا سفرهٔ شما</span>
        </h2>
        <p className="mt-2 text-[11px] leading-[21px] text-[#593b25] min-[480px]:mt-4 min-[480px]:text-[13px] min-[480px]:leading-7 sm:leading-8 lg:text-sm">
          <span className="sm:hidden">
            از شهر بادگیرها، ارده و فرآورده‌های کنجدی سنتی بهجتی را به سفرهٔ شما می‌آوریم.
          </span>
          <span className="hidden sm:inline">
            میان کوچه‌های خشتی و بادگیرهای اردکان، کنجد بخشی از قصهٔ طعم‌هاست. سنتی بهجتی این پیوند
            را با ارده، حلواارده و فرآورده‌های کنجدی به سفرهٔ هر روز شما می‌آورد.
          </span>
        </p>
        <p className="mt-3 hidden text-[13px] leading-8 text-[#593b25] sm:block lg:text-sm">
          از اردهٔ ساده تا طعم‌های شکلاتی و فندقی، هر انتخاب فرصتی است برای آشنایی با دنیای کنجد و
          پیدا کردن طعمی که دوست دارید.
        </p>
        <Button
          asChild
          className="mt-4 max-w-full gap-1 px-2 text-[10px] min-[375px]:text-[11px] min-[480px]:mt-6 min-[480px]:gap-2 min-[480px]:px-4 min-[480px]:text-xs lg:text-sm"
        >
          <Link href="/shop">
            <span className="sm:hidden">محصولات ما</span>
            <span className="hidden sm:inline">آشنایی با محصولات</span>{' '}
            <ArrowLeft className="size-3 shrink-0 min-[480px]:size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
