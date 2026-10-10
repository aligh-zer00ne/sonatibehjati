'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { formatNumber } from '@behjati/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const slides = [
  {
    src: '/images/home/hero-tahini-desktop-v6.webp',
    mobileSrc: '/images/home/hero-tahini-mobile-v6.webp',
    alt: 'اردهٔ روان سنتی بهجتی در کاسه، کنار بسته‌بندی‌های واقعی روی میز چوبی و پارچهٔ ترمه',
    label: 'ارده ممتاز',
    eyebrow: 'فرآورده‌های کنجدی اردکان',
    title: 'سنتی بهجتی',
    subtitle: 'طعم اصالت، از دل کویر',
    description: 'ارده، حلواارده و طعم‌های کنجدی؛ همراه صبحانه و سفرهٔ هر روز شما.',
    href: '/shop',
    action: 'مشاهده محصولات',
    mobileAction: 'دیدن محصولات',
  },
  {
    src: '/images/home/hero-oil-desktop-v6.webp',
    mobileSrc: '/images/home/hero-oil-mobile-v6.webp',
    alt: 'بسته‌بندی‌های واقعی روغن کنجد سنتی بهجتی با رنگ طلایی و نور طبیعی',
    label: 'روغن کنجد',
    eyebrow: 'روغن کنجد سنتی بهجتی',
    title: 'طلای کنجد',
    subtitle: 'برای آشپزخانهٔ شما',
    description: 'روغن‌های کنجد را ببینید و بسته‌بندی مناسب آشپزخانهٔ خود را انتخاب کنید.',
    href: '/category/oil',
    action: 'مشاهده روغن‌های کنجد',
    mobileAction: 'دیدن روغن‌ها',
  },
  {
    src: '/images/home/hero-flavored-desktop-v6.webp',
    mobileSrc: '/images/home/hero-flavored-mobile-v6.webp',
    alt: 'ارده شکلاتی، کرم ارده و ارده فندقی سنتی بهجتی در فضایی گرم و سنتی',
    label: 'ارده‌های طعم‌دار',
    eyebrow: 'طعم‌های تازهٔ سنتی بهجتی',
    title: 'طعم‌های تازه',
    subtitle: 'شکلاتی، فندقی یا کرم ارده؟',
    description: 'از میان طعم‌های مختلف ارده، همراه تازهٔ صبحانه‌تان را پیدا کنید.',
    href: '/category/tahini',
    action: 'کشف ارده‌های طعم‌دار',
    mobileAction: 'کشف طعم‌ها',
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
      className="relative isolate h-[240px] min-[375px]:h-[250px] min-[480px]:h-[275px] sm:h-[200px] overflow-hidden rounded-[24px] border border-[#60382b]/30 bg-[#2b1410] shadow-[0_18px_50px_-28px_rgba(49,21,13,0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:h-[430px] lg:h-[480px] lg:rounded-[28px]"
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
      <div
        id={id}
        data-slot="hero-image"
        className="absolute inset-0 right-auto w-[64%] touch-pan-y overflow-hidden min-[480px]:w-[78%] [mask-image:linear-gradient(to_right,#000_80%,transparent)] md:w-[78%] md:[mask-image:linear-gradient(to_right,#000_78%,transparent)] lg:w-[60%]"
      >
        {slides.map((item, index) => {
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
                <source
                  media="(min-width: 480px)"
                  srcSet={`${item.src.replace('.webp', '-768.webp')} 768w, ${item.src} 1536w`}
                  sizes="(min-width: 1024px) 720px, (min-width: 875px) calc(78vw - 37.44px), (min-width: 768px) 645px, (min-width: 480px) 78vw, 64vw"
                />
                <img
                  src={item.mobileSrc}
                  srcSet={`${item.mobileSrc.replace('.webp', '-512.webp')} 512w, ${item.mobileSrc.replace('.webp', '-768.webp')} 768w, ${item.mobileSrc} 1024w`}
                  sizes="(min-width: 768px) 645px, (min-width: 480px) 78vw, 64vw"
                  alt={item.alt}
                  width={1024}
                  height={1536}
                  loading={index === current ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover md:object-left lg:object-center"
                />
              </picture>
            </div>
          );
        })}
      </div>

      <div
        data-slot="hero-shade"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(270deg,#2b1410_0%,rgba(43,20,16,0.96)_25%,rgba(43,20,16,0.35)_48%,transparent_70%)] md:bg-[linear-gradient(270deg,#2b1410_0%,rgba(43,20,16,0.98)_28%,rgba(43,20,16,0.55)_48%,transparent_69%)]"
      />
      <div
        data-slot="hero-copy"
        className="absolute top-1/2 right-2 z-[1] w-[46%] -translate-y-1/2 text-right md:translate-y-0 md:top-10 md:right-[5%] md:w-[43%] lg:top-14 lg:right-[6%]"
      >
        <div
          key={current}
          className="animate-in fade-in slide-in-from-right-3 duration-500 motion-reduce:animate-none"
        >
          <p className="hidden items-center gap-2 font-medium text-[#efd6ae] md:flex md:leading-5 md:text-[11px] lg:text-xs">
            <span className="h-px w-6 bg-[#edc580]/70" aria-hidden="true" /> {slide.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="text-[16px] leading-[1.5] font-[900] tracking-[-0.5px] text-[#ffebc8] min-[375px]:text-[18px] min-[480px]:text-[24px] md:mt-2 md:leading-[1.6] md:text-[36px] lg:text-[58px]"
          >
            {slide.title}
          </h1>
          <p className="mt-1 text-[10px] leading-5 font-semibold text-[#fff4df] min-[480px]:text-xs md:text-[14px] md:leading-6 lg:text-xl lg:leading-8">
            {slide.subtitle}
          </p>
          <p className="mt-3 hidden text-[13px] leading-7 text-[#ecdac4] md:block lg:max-w-[390px] lg:text-sm lg:leading-8">
            {slide.description}
          </p>
          <Button
            asChild
            className="mt-3 min-h-9 gap-1 border-[#f5d7a0] md:mt-4 md:min-h-12 bg-[#f3d39b] px-3 py-1 text-[10px] md:gap-2 md:px-4 md:text-xs text-[#482216] shadow-[0_6px_24px_rgba(0,0,0,0.15)] hover:bg-[#ffe6b8] lg:mt-6 lg:px-6 lg:text-sm"
          >
            <Link href={slide.href}>
              <span className="md:hidden">{slide.mobileAction}</span>
              <span className="hidden md:inline">{slide.action}</span>
              <ArrowLeft className="size-3 md:size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <div
        className="absolute bottom-1 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-[#24110c]/55 px-1 shadow-sm backdrop-blur-sm md:bottom-4 lg:bottom-5"
        aria-label="کنترل اسلایدر"
      >
        <Button
          variant="ghost"
          size="icon"
          className="hidden text-[#f3d39b] hover:bg-white/10 hover:text-[#ffebc8] md:inline-flex"
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
            className="flex h-8 w-7 cursor-pointer md:h-11 md:w-8 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={`نمایش اسلاید ${formatNumber(index + 1)}: ${item.label}`}
            aria-current={index === current ? 'true' : undefined}
            aria-controls={id}
            onClick={() => select(index)}
          >
            <span
              className={cn(
                'h-2 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none',
                index === current ? 'w-3 bg-[#f3d39b] md:w-5' : 'w-1.5 bg-white/45 md:w-2',
              )}
            />
          </button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className="hidden text-[#f3d39b] hover:bg-white/10 hover:text-[#ffebc8] md:inline-flex"
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
            className="size-8 min-h-8 text-[#f3d39b] hover:bg-white/10 hover:text-[#ffebc8] md:size-11 md:min-h-11"
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
