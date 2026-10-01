import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function HeroSection() {
  return (
    <section
      className="relative isolate flex min-h-[620px] flex-col overflow-hidden rounded-[25px] bg-[linear-gradient(125deg,#f4dfbf,#efcf9e)] px-5 pt-[25px] pb-[33px] text-center before:pointer-events-none before:absolute before:inset-0 before:z-[3] before:rounded-[inherit] before:border before:border-earth/8 before:content-[''] min-[480px]:min-h-[680px] md:grid md:min-h-[430px] md:grid-cols-[1fr_1.15fr] md:items-center md:gap-2.5 md:px-10 md:py-[50px] md:text-right lg:min-h-[470px] lg:p-[60px] xl:min-h-[500px]"
      aria-labelledby="hero-title"
    >
      <div className="contents md:relative md:z-[2] md:block">
        <p className="mb-2.5 text-xs font-[650] text-primary lg:text-[13px]">
          حلواارده سنتی بهجتی اردکان
        </p>
        <h1
          id="hero-title"
          className="text-[34px] leading-[1.55] font-[850] tracking-[-1px] text-[#482818] min-[480px]:text-[40px] md:text-[44px] lg:text-[54px] xl:text-[58px]"
        >
          طعم اصیل اردکان
          <br />
          از دل کنجد
        </h1>
        <p className="mx-auto mt-[9px] max-w-[265px] text-sm text-earth md:mx-0 md:my-4 md:max-w-[300px] lg:max-w-[340px] lg:text-base">
          ارده، حلواارده و فرآورده‌های کنجدی سنتی بهجتی
        </p>
        <div className="relative z-[2] order-3 -mt-[5px] flex flex-col items-center gap-2 md:mt-6 md:flex-row md:flex-wrap md:gap-[18px]">
          <Button className="w-[86%] md:w-auto" asChild>
            <a href="#products">
              مشاهده محصولات <ArrowLeft size={19} />
            </a>
          </Button>
          <a className="flex min-h-11 items-center gap-2.5 font-[650] text-primary" href="#story">
            داستان سنتی بهجتی <ArrowLeft size={17} />
          </a>
        </div>
      </div>
      <div className="relative order-2 -mx-5 h-[290px] w-[calc(100%+40px)] shrink-0 min-[480px]:h-[340px] md:absolute md:bottom-0 md:left-0 md:m-0 md:h-full md:w-[55%] xl:w-[57%]">
        <Image
          className="object-cover mix-blend-multiply [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_88%,transparent)] md:[mask-image:linear-gradient(to_right,#000_70%,transparent)]"
          src="/images/hero.webp"
          alt="ارده و حلواارده در کنار دانه‌های کنجد و بادگیرهای اردکان"
          fill
          priority
          sizes="(max-width: 767px) 100vw, 650px"
        />
      </div>
      <div
        dir="ltr"
        className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 gap-1.5 md:bottom-[22px] md:left-[27%]"
        aria-hidden="true"
      >
        <i className="size-[7px] rounded-full bg-primary" />
        <i className="size-[7px] rounded-full bg-[#b59d7b]" />
        <i className="size-[7px] rounded-full bg-[#b59d7b]" />
        <i className="size-[7px] rounded-full bg-[#b59d7b]" />
      </div>
    </section>
  );
}
