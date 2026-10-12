import type { BrandStoryContent } from '@behjati/shared/homepage';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BrandStory({ content }: { content: BrandStoryContent }) {
  return (
    <section
      id="story"
      aria-labelledby="story-title"
      className="group/story relative isolate my-8 min-h-[215px] w-full scroll-mt-8 overflow-hidden rounded-[24px] border border-[#69422e]/25 bg-[#3c2319] shadow-[0_18px_45px_-30px_rgba(49,21,13,0.4)] min-[375px]:min-h-[230px] min-[480px]:min-h-[250px] sm:min-h-[200px] md:my-12 md:min-h-[430px] lg:min-h-[480px] lg:rounded-[28px] xl:my-14"
    >
      <span id="ardakan" aria-hidden="true" className="absolute top-0 scroll-mt-8" />
      <div
        data-slot="story-image"
        className="absolute inset-0 min-[480px]:right-auto min-[480px]:w-[334px] min-[480px]:[mask-image:linear-gradient(to_right,#000_87%,transparent)] sm:w-[78%] sm:[mask-image:linear-gradient(to_right,#000_78%,transparent)] lg:w-[60%]"
      >
        <picture>
          <source
            media="(min-width: 640px)"
            srcSet={
              content.src === '/images/home/story-desktop-v6.webp'
                ? '/images/home/story-desktop-v6-768.webp 768w, /images/home/story-desktop-v6.webp 1536w'
                : content.src
            }
            sizes="(min-width: 1024px) 720px, (min-width: 875px) calc(78vw - 37.44px), (min-width: 768px) 645px, 600px"
          />
          <img
            src={content.mobileSrc}
            srcSet={
              content.mobileSrc === '/images/home/story-mobile-v6.webp'
                ? '/images/home/story-mobile-v6-512.webp 512w, /images/home/story-mobile-v6-768.webp 768w, /images/home/story-mobile-v6.webp 1024w'
                : undefined
            }
            sizes="(min-width: 480px) 334px, calc(100vw - 32px)"
            alt={content.alt}
            width={1024}
            height={1536}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover sm:object-left lg:object-center"
          />
        </picture>
      </div>
      <div
        data-slot="story-shade"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(270deg,rgba(38,20,13,0.65),transparent_80%),linear-gradient(180deg,rgba(38,20,13,0.2),transparent_65%,rgba(38,20,13,0.2))] sm:bg-[linear-gradient(270deg,#3c2319_0%,rgba(60,35,25,0.98)_28%,rgba(60,35,25,0.55)_48%,transparent_69%)]"
      />
      <div
        data-slot="story-copy"
        className="relative right-3 pt-3 z-[1] pb-12 w-[58%] text-right min-[480px]:w-[52%] md:pt-10 md:right-[5%] md:w-[43%] lg:pt-12 lg:right-[6%]"
      >
        <h2
          id="story-title"
          className="text-[17px] leading-[1.5] font-extrabold text-[#fff0d6] min-[375px]:text-[18px] min-[480px]:text-[21px] md:leading-[1.65] md:text-[31px] lg:text-[39px]"
        >
          {content.title}
          <span className="block text-[#f4d69f]">{content.subtitle}</span>
        </h2>
        <p className="mt-1.5 whitespace-pre-line text-[10px] leading-4 min-[480px]:text-[11px] min-[480px]:leading-[18px] md:mt-3 text-[#f5e6ce] md:text-[13px] md:leading-7 lg:mt-4 lg:max-w-[390px] lg:text-sm lg:leading-8">
          {content.description}
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-1.5 min-h-8 max-w-full gap-2 md:mt-4 md:min-h-12 border-[#e4c18d]/60 bg-[#3c2319]/20 px-3 py-1 text-[10px] md:py-2.5 md:text-[11px] text-[#fff0d6] hover:border-[#f4d69f] hover:bg-[#f4d69f]/15 hover:text-[#fff0d6] lg:mt-6 lg:px-5 lg:text-sm"
        >
          <Link href={content.href}>
            <span className="md:hidden">{content.mobileAction}</span>
            <span className="hidden md:inline">{content.action}</span>
            <ArrowLeft className="size-3.5 shrink-0 lg:size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <p className="absolute bottom-2 left-3 z-[1] flex items-center gap-1.5 text-[10px] font-medium text-[#fff0d6] md:bottom-5 md:left-5 md:text-xs lg:bottom-7 lg:left-7">
        <MapPin className="size-3.5" aria-hidden="true" /> {content.location}
      </p>
    </section>
  );
}
