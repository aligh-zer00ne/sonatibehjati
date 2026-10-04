import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SesamePattern } from '@/components/decoration/sesame-pattern';
export default function BrandStory() {
  return (
    <section
      className="group/story my-8 md:my-12 xl:my-14 overflow-hidden rounded-3xl bg-[linear-gradient(140deg,#f2e2cb,#faf5ec)] md:grid md:grid-cols-2"
      id="story"
    >
      <div className="relative isolate h-[340px] overflow-hidden bg-[radial-gradient(ellipse_at_center,#fff8ec,#ead5b4)] md:h-full md:min-h-[440px]">
        <SesamePattern motif="tahini" className="text-clay opacity-30" />
        <Image
          className="object-contain px-12 pt-5 pb-28 drop-shadow-[0_15px_20px_rgba(98,69,47,0.18)] transition-transform duration-1000 ease-out motion-safe:group-hover/story:scale-105 motion-reduce:transition-none md:px-16 md:pb-36"
          src="/images/home/tahini-pour.webp"
          alt="بافت واقعی ارده سنتی بهجتی؛ ریزش ارده از قاشق در کاسهٔ آبی"
          fill
          quality={85}
          sizes="(max-width: 767px) 100vw, 520px"
        />
        <div className="absolute right-4 bottom-3 left-4 flex h-24 items-center justify-center gap-3 rounded-2xl border border-earth/10 bg-background/90 p-2 shadow-sm md:right-8 md:bottom-5 md:left-8 md:h-28 md:gap-5">
          {[
            ['chocolate-tahini', 'ارده شکلاتی'],
            ['tahini-cream', 'کرم ارده'],
            ['hazelnut-tahini', 'ارده فندقی'],
          ].map(([photo, title]) => (
            <Image
              key={photo}
              src={`/images/products/${photo}.webp`}
              alt={`${title} سنتی بهجتی`}
              width={96}
              height={96}
              sizes="96px"
              className="size-20 object-contain drop-shadow-sm md:size-24"
            />
          ))}
        </div>
      </div>
      <div className="px-[22px] py-[26px] md:p-[35px] lg:p-12 xl:p-[55px]">
        <span className="mb-2.5 text-xs font-[650] text-primary lg:text-[13px]">
          داستانی از کنجد، اردکان و طعم
        </span>
        <h2 className="mb-3.5 text-[23px] font-extrabold text-primary lg:text-[27px]">
          حلواارده سنتی بهجتی اردکان
        </h2>
        <p className="mb-4 text-[13px] leading-[2.1] text-muted-foreground lg:text-sm">
          کنجد، نقطهٔ آغاز این داستان است. از ارده و حلواارده تا روغن ارده، اینجا با فرآورده‌های
          کنجدی سنتی بهجتی آشنا می‌شوید؛ طعم‌هایی برای همراهی با صبحانه و سفرهٔ هر روز.
        </p>
        <p className="mb-4 text-[13px] leading-[2.1] text-muted-foreground lg:text-sm">
          داستان کامل برند، پس از دریافت اطلاعات تأییدشده، در این بخش منتشر می‌شود.
        </p>
        <Button className="text-xs" variant="outline" asChild>
          <Link href="/shop">
            آشنایی با محصولات <ArrowLeft size={17} />
          </Link>
        </Button>
      </div>
    </section>
  );
}
