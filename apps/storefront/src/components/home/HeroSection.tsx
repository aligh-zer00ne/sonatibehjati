import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">حلواارده سنتی بهجتی اردکان</p>
        <h1 id="hero-title">
          طعم اصیل اردکان
          <br />
          از دل کنجد
        </h1>
        <p className="hero-subtitle">ارده، حلواارده و فرآورده‌های کنجدی بهجتی</p>
        <div className="hero-actions">
          <Button asChild>
            <a href="#products">
              مشاهده محصولات <ArrowLeft size={19} />
            </a>
          </Button>
          <a className="story-link" href="#story">
            داستان بهجتی <ArrowLeft size={17} />
          </a>
        </div>
      </div>
      <div className="hero-art">
        <Image
          src="/images/hero.webp"
          alt="ارده و حلواارده در کنار دانه‌های کنجد و بادگیرهای اردکان"
          fill
          priority
          sizes="(max-width: 767px) 100vw, 650px"
        />
      </div>
      <div className="hero-dots" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
    </section>
  );
}
