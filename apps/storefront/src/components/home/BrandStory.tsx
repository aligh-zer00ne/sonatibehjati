import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function BrandStory() {
  return (
    <section
      className="my-8 md:my-12 xl:my-14 overflow-hidden rounded-3xl bg-[linear-gradient(140deg,#f2e2cb,#faf5ec)] md:grid md:grid-cols-2"
      id="story"
    >
      <div className="relative h-[260px] md:h-full md:min-h-[360px]">
        <Image
          className="object-cover"
          src="/images/story.webp"
          alt="فضای سنتی با دیوارهای خشتی و آسیاب سنگی"
          fill
          sizes="(max-width: 767px) 100vw, 520px"
        />
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
          <a href="#products">
            آشنایی با محصولات <ArrowLeft size={17} />
          </a>
        </Button>
      </div>
    </section>
  );
}
