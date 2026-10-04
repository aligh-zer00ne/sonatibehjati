import Link from 'next/link';
import HeroCarousel from './HeroCarousel';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function HeroSection() {
  return (
    <section
      className="relative isolate flex min-h-[620px] flex-col overflow-hidden rounded-[25px] bg-[radial-gradient(ellipse_at_top_right,#fcf2df_0%,#efddc0_55%,#e9cdab_100%)] px-5 pt-[25px] pb-[33px] text-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none before:pointer-events-none before:absolute before:inset-0 before:z-[3] before:rounded-[inherit] before:border before:border-earth/8 before:content-[''] min-[480px]:min-h-[680px] md:grid md:min-h-[430px] md:grid-cols-[1fr_1.15fr] md:items-center md:gap-2.5 md:px-10 md:py-[50px] md:text-right lg:min-h-[470px] lg:p-[60px] xl:min-h-[500px]"
      aria-labelledby="hero-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 h-[480px] w-[340px] rounded-t-full border-[28px] border-white/15 shadow-[0_25px_65px_rgba(121,75,34,0.08)] md:-top-20 md:-right-8"
      />
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
            <Link href="/shop">
              مشاهده محصولات <ArrowLeft size={19} />
            </Link>
          </Button>
          <Link
            className="group/story-link flex min-h-11 items-center gap-2.5 font-[650] text-primary transition-colors duration-300 hover:text-brand-red-dark [&_svg]:transition-transform [&_svg]:duration-300 motion-safe:hover:[&_svg]:-translate-x-1.5 motion-reduce:[&_svg]:transition-none"
            href="#story"
          >
            داستان سنتی بهجتی <ArrowLeft size={17} />
          </Link>
        </div>
      </div>
      <HeroCarousel />
    </section>
  );
}
