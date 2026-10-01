import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
export default function HeritageSection() {
  return (
    <section className="heritage" id="ardakan" aria-labelledby="heritage-title">
      <div className="heritage-image">
        <Image
          src="/images/heritage.webp"
          alt="بادگیر و گنبد در معماری خشتی اردکان"
          fill
          sizes="(max-width: 767px) 100vw, 600px"
        />
      </div>
      <div className="heritage-copy">
        <span className="eyebrow">از خاک کویر، تا سفرهٔ شما</span>
        <h2 id="heritage-title">از دل اردکان</h2>
        <p>
          اردکان، شهر بادگیرها و کوچه‌های خشتی؛
          <br />
          جایی که طعم کنجد با فرهنگ زندگی پیوند می‌خورد.
        </p>
        <a href="#story">
          بیشتر دربارهٔ داستان بهجتی <ArrowLeft size={17} />
        </a>
      </div>
    </section>
  );
}
