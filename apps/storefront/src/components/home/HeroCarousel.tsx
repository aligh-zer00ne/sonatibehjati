'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { getImageProps } from 'next/image';
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { formatNumber } from '@behjati/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const slides = [
  {
    src: '/images/home/hero-tahini-wide-v5.webp',
    mobileSrc: '/images/home/hero-tahini-mobile-v5.webp',
    alt: 'اردهٔ روان سنتی بهجتی در کاسه، کنار بسته‌بندی‌های واقعی روی میز چوبی و پارچهٔ ترمه',
    label: 'ارده ممتاز',
    eyebrow: 'فرآورده‌های کنجدی اردکان',
    title: 'سنتی بهجتی',
    subtitle: 'طعم اصالت، از دل کویر',
    description: 'ارده، حلواارده و طعم‌های کنجدی؛ همراه صبحانه و سفرهٔ هر روز شما.',
    href: '/shop',
    action: 'مشاهده محصولات',
    mobileAction: 'دیدن محصولات',
    mobileDescription: 'طعم‌های کنجدی، همراه صبحانهٔ هر روز شما.',
  },
  {
    src: '/images/home/hero-oil-wide-v5.webp',
    mobileSrc: '/images/home/hero-oil-mobile-v5.webp',
    alt: 'بسته‌بندی‌های واقعی روغن کنجد سنتی بهجتی با رنگ طلایی و نور طبیعی',
    label: 'روغن کنجد',
    eyebrow: 'روغن کنجد سنتی بهجتی',
    title: 'طلای کنجد',
    subtitle: 'برای آشپزخانهٔ شما',
    description: 'روغن‌های کنجد را ببینید و بسته‌بندی مناسب آشپزخانهٔ خود را انتخاب کنید.',
    href: '/category/oil',
    action: 'مشاهده روغن‌های کنجد',
    mobileAction: 'دیدن روغن‌ها',
    mobileDescription: 'عطر و رنگ کنجد، همراه پخت‌وپز شما.',
  },
  {
    src: '/images/home/hero-flavored-wide-v5.webp',
    mobileSrc: '/images/home/hero-flavored-mobile-v5.webp',
    alt: 'ارده شکلاتی، کرم ارده و ارده فندقی سنتی بهجتی در فضایی گرم و سنتی',
    label: 'ارده‌های طعم‌دار',
    eyebrow: 'طعم‌های تازهٔ سنتی بهجتی',
    title: 'طعم‌های تازه',
    subtitle: 'شکلاتی، فندقی یا کرم ارده؟',
    description: 'از میان طعم‌های مختلف ارده، همراه تازهٔ صبحانه‌تان را پیدا کنید.',
    href: '/category/tahini',
    action: 'کشف ارده‌های طعم‌دار',
    mobileAction: 'کشف طعم‌ها',
    mobileDescription: 'طعم دلخواهتان را برای صبحانه پیدا کنید.',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const id = useId();
  const slide = slides[current]!;

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      setReducedMotion(preference.matches);
      setPlaying(!preference.matches);
    };
    const syncVisibility = () => setVisible(document.visibilityState === 'visible');
    syncMotion();
    syncVisibility();
    preference.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      preference.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (!playing || hovered || focused || !visible || reducedMotion) return;
    const timer = setInterval(() => setCurrent((value) => (value + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, [playing, hovered, focused, visible, reducedMotion]);

  function select(index: number) {
    setCurrent((index + slides.length) % slides.length);
    setPlaying(false);
  }

  return (
    <div
      role="region"
      aria-roledescription="اسلایدر"
      aria-label="تصاویر محصولات کنجدی"
      tabIndex={0}
      className="relative isolate min-h-[350px] overflow-hidden rounded-[26px] border border-earth/10 bg-[#6d422c] pb-[76px] shadow-[0_16px_50px_-35px_rgba(72,40,24,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary min-[480px]:min-h-[390px] md:min-h-[420px] lg:min-h-[540px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          select(current + (event.key === 'ArrowLeft' ? 1 : -1));
        }
      }}
      onPointerDown={(event) => {
        if (event.pointerType === 'touch' && !(event.target as HTMLElement).closest('a, button'))
          gesture.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        const start = gesture.current;
        gesture.current = null;
        if (!start) return;
        const dx = event.clientX - start.x;
        if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(event.clientY - start.y))
          select(current + (dx < 0 ? 1 : -1));
      }}
      onPointerCancel={() => {
        gesture.current = null;
      }}
    >
      <div id={id} className="absolute inset-0 touch-pan-y overflow-hidden">
        {slides.map((item, index) => {
          const { props: desktop } = getImageProps({
            src: item.src,
            alt: item.alt,
            width: 1942,
            height: 809,
            quality: 85,
            sizes: '(min-width: 1200px) 1200px, 100vw',
          });
          const { props: mobile } = getImageProps({
            src: item.mobileSrc,
            alt: item.alt,
            width: 1122,
            height: 1402,
            quality: 85,
            sizes: '100vw',
          });
          return (
            <div
              key={item.src}
              role="group"
              aria-roledescription="اسلاید"
              aria-label={`${formatNumber(index + 1)} از ${formatNumber(slides.length)}: ${item.label}`}
              aria-hidden={index !== current}
              inert={index !== current}
              className={cn(
                'absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none',
                index === current ? 'opacity-100' : 'opacity-0',
              )}
            >
              <picture>
                <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
                <img
                  {...mobile}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover transition-transform duration-[7000ms] ease-out motion-reduce:transform-none motion-reduce:transition-none md:object-left xl:object-center',
                    index === current ? 'scale-100' : 'scale-[1.035]',
                  )}
                />
              </picture>
            </div>
          );
        })}
      </div>

      <div
        data-slot="hero-copy"
        className="relative z-[1] my-6 mr-[3%] ml-auto w-[54%] rounded-[18px] border border-[#efc68c]/75 bg-[linear-gradient(145deg,rgba(250,220,165,0.96),rgba(230,174,108,0.94)_58%,rgba(196,126,68,0.95))] p-3 text-right shadow-[0_16px_45px_-20px_rgba(48,23,12,0.6)] backdrop-blur-md min-[375px]:p-4 min-[480px]:my-8 min-[480px]:w-[49%] min-[480px]:p-6 md:w-[44%] md:p-7 lg:my-12 lg:w-[40%] lg:max-w-[440px] lg:rounded-[22px] lg:p-10"
      >
        <div
          key={current}
          className="animate-in fade-in slide-in-from-right-3 duration-500 motion-reduce:animate-none"
        >
          <p className="text-[9px] leading-5 font-semibold text-primary/85 min-[375px]:text-[10px] min-[480px]:text-xs lg:text-[13px]">
            {slide.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="mt-2 text-[22px] leading-[1.5] font-[900] tracking-[-0.5px] text-primary min-[375px]:text-[26px] min-[480px]:text-[32px] md:text-[40px] lg:mt-3 lg:text-[58px]"
          >
            {slide.title}
          </h1>
          <p className="mt-1 text-[12px] leading-5 font-bold text-[#482818] min-[375px]:text-[13px] min-[480px]:text-base min-[480px]:leading-7 lg:text-[21px] lg:leading-8">
            {slide.subtitle}
          </p>
          <p className="mt-2 min-h-10 text-[11px] leading-5 text-[#593b25] min-[480px]:mt-3 min-[480px]:min-h-14 min-[480px]:text-[13px] min-[480px]:leading-7 lg:text-sm">
            <span className="sm:hidden">{slide.mobileDescription}</span>
            <span className="hidden sm:inline">{slide.description}</span>
          </p>
          <Button
            asChild
            className="mt-3 w-full gap-1 px-2 text-[10px] min-[375px]:text-[11px] min-[480px]:mt-5 min-[480px]:w-auto min-[480px]:gap-2 min-[480px]:px-4 min-[480px]:text-xs lg:text-sm"
          >
            <Link href={slide.href}>
              <span className="sm:hidden">{slide.mobileAction}</span>
              <span className="hidden sm:inline">{slide.action}</span>
              <ArrowLeft className="size-3 shrink-0 min-[480px]:size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <div
        className="absolute bottom-4 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#efc68c]/70 bg-[linear-gradient(135deg,#f4d5a5,#dca367)] px-1 shadow-sm backdrop-blur-md md:bottom-5"
        aria-label="کنترل اسلایدر"
      >
        <Button
          variant="ghost"
          size="icon"
          aria-label="اسلاید قبلی"
          aria-controls={id}
          onClick={() => select(current - 1)}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </Button>
        {slides.map((item, index) => (
          <button
            key={item.src}
            type="button"
            className="flex h-11 w-8 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={`نمایش اسلاید ${formatNumber(index + 1)}: ${item.label}`}
            aria-current={index === current ? 'true' : undefined}
            aria-controls={id}
            onClick={() => select(index)}
          >
            <span
              className={cn(
                'h-2 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none',
                index === current ? 'w-5 bg-primary' : 'w-2 bg-earth/35',
              )}
            />
          </button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          aria-label="اسلاید بعدی"
          aria-controls={id}
          onClick={() => select(current + 1)}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </Button>
        {!reducedMotion && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={playing ? 'توقف پخش خودکار اسلایدر' : 'شروع پخش خودکار اسلایدر'}
            aria-controls={id}
            onClick={() => {
              if (!playing) {
                setFocused(false);
                setHovered(false);
              }
              setPlaying((value) => !value);
            }}
          >
            {playing ? (
              <Pause size={16} aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
          </Button>
        )}
      </div>
      <p className="sr-only" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
        {slide.label}، اسلاید {formatNumber(current + 1)} از {formatNumber(slides.length)}
      </p>
    </div>
  );
}
