import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function BrandStory() {
  return (
    <section
      className="group/story my-8 md:my-12 xl:my-14 overflow-hidden rounded-3xl bg-[linear-gradient(140deg,#f2e2cb,#faf5ec)] md:grid md:grid-cols-[0.85fr_1.15fr]"
      id="story"
    >
      <div className="relative isolate aspect-[4/5] overflow-hidden bg-[#dac09c]">
        <Image
          className="object-cover transition-transform duration-1000 ease-out motion-safe:group-hover/story:scale-[1.025] motion-reduce:transition-none"
          src="/images/home/story-tahini-scene.webp"
          alt="کاسهٔ آبی و ریزش ارده سنتی بهجتی همراه با محصولات طعم‌دار، در فضایی گرم با نور پنجره و سطح سنگی"
          fill
          quality={85}
          sizes="(max-width: 767px) 100vw, 600px"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f2e2cb] to-transparent md:hidden"
        />
      </div>
      <div className="px-[22px] py-[26px] md:self-center md:p-[35px] lg:p-12 xl:p-[55px]">
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
