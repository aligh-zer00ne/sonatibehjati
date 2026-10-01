import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
export default function HeritageSection() {
  return (
    <section
      className="group/heritage overflow-hidden rounded-[26px] bg-[#efddc0] md:grid md:min-h-[350px] md:grid-cols-2"
      id="ardakan"
      aria-labelledby="heritage-title"
    >
      <div className="relative h-[265px] md:col-start-2 md:row-start-1 md:h-full md:min-h-[350px]">
        <Image
          className="object-cover transition-transform duration-1000 ease-out motion-safe:group-hover/heritage:scale-105 motion-reduce:transition-none [mask-image:linear-gradient(to_bottom,#000_70%,transparent)] md:[mask-image:linear-gradient(to_right,#000_75%,transparent)]"
          src="/images/heritage.webp"
          alt="بادگیر و گنبد در معماری خشتی اردکان"
          fill
          sizes="(max-width: 767px) 100vw, 600px"
        />
      </div>
      <div className="px-[22px] pt-1 pb-[26px] text-right md:col-start-1 md:row-start-1 md:self-center md:p-10">
        <span className="mb-2.5 text-xs font-[650] text-primary lg:text-[13px]">
          از خاک کویر، تا سفرهٔ شما
        </span>
        <h2 className="mb-[7px] text-[29px] font-extrabold md:text-[34px]" id="heritage-title">
          از دل اردکان
        </h2>
        <p className="text-sm leading-7 text-earth lg:text-base">
          اردکان، شهر بادگیرها و کوچه‌های خشتی؛
          <br />
          جایی که طعم کنجد با فرهنگ زندگی پیوند می‌خورد.
        </p>
        <a
          className="mt-2.5 flex min-h-11 items-center gap-2 text-xs text-primary [&_svg]:transition-transform [&_svg]:duration-300 motion-safe:hover:[&_svg]:-translate-x-1.5 motion-reduce:[&_svg]:transition-none"
          href="#story"
        >
          بیشتر دربارهٔ داستان سنتی بهجتی <ArrowLeft size={17} />
        </a>
      </div>
    </section>
  );
}
