import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function BrandStory() {
  return (
    <section className="brand-story home-section" id="story">
      <div className="story-image">
        <Image
          src="/images/story.webp"
          alt="فضای سنتی با دیوارهای خشتی و آسیاب سنگی"
          fill
          sizes="(max-width: 767px) 100vw, 520px"
        />
      </div>
      <div className="story-copy">
        <span className="eyebrow">داستانی از کنجد، اردکان و طعم</span>
        <h2>حلواارده سنتی بهجتی اردکان</h2>
        <p>
          کنجد، نقطهٔ آغاز این داستان است. از ارده و حلواارده تا روغن ارده، اینجا با فرآورده‌های
          کنجدی بهجتی آشنا می‌شوید؛ طعم‌هایی برای همراهی با صبحانه و سفرهٔ هر روز.
        </p>
        <p>داستان کامل برند، پس از دریافت اطلاعات تأییدشده، در این بخش منتشر می‌شود.</p>
        <Button variant="outline" asChild>
          <a href="#products">
            آشنایی با محصولات <ArrowLeft size={17} />
          </a>
        </Button>
      </div>
    </section>
  );
}
