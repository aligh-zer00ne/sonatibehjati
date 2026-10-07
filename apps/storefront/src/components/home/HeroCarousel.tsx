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
      className="relative isolate h-[480px] overflow-hidden rounded-[24px] border border-[#60382b]/30 bg-[#2b1410] shadow-[0_18px_50px_-28px_rgba(49,21,13,0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary min-[375px]:h-[500px] min-[480px]:h-[550px] sm:h-[400px] md:h-[430px] lg:h-[480px] lg:rounded-[28px]"
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
        className="absolute inset-0 touch-pan-y overflow-hidden min-[480px]:right-auto min-[480px]:w-[367px] min-[480px]:[mask-image:linear-gradient(to_right,#000_87%,transparent)] sm:w-[78%] sm:[mask-image:linear-gradient(to_right,#000_78%,transparent)] lg:w-[60%]"
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
                  media="(min-width: 640px)"
                  srcSet={`${item.src.replace('.webp', '-768.webp')} 768w, ${item.src} 1536w`}
                  sizes="(min-width: 1024px) 720px, (min-width: 875px) calc(78vw - 37.44px), (min-width: 768px) 645px, 600px"
                />
                <img
                  src={item.mobileSrc}
                  srcSet={`${item.mobileSrc.replace('.webp', '-512.webp')} 512w, ${item.mobileSrc.replace('.webp', '-768.webp')} 768w, ${item.mobileSrc} 1024w`}
                  sizes="(min-width: 480px) 367px, (min-width: 375px) calc(100vw - 32px), 320px"
                  alt={item.alt}
                  width={1024}
                  height={1536}
                  loading={index === current ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover sm:object-left lg:object-center"
                />
              </picture>
            </div>
          );
        })}
      </div>

      <div
        data-slot="hero-shade"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(28,11,9,0.32),transparent_52%,rgba(28,11,9,0.34))] sm:bg-[linear-gradient(270deg,#2b1410_0%,rgba(43,20,16,0.98)_28%,rgba(43,20,16,0.55)_48%,transparent_69%)]"
      />
      <div
        data-slot="hero-copy"
        className="absolute top-4 right-5 z-[1] w-[80%] text-right min-[480px]:right-7 sm:top-10 sm:right-[5%] sm:w-[43%] lg:top-14 lg:right-[6%]"
      >
        <div
          key={current}
          className="animate-in fade-in slide-in-from-right-3 duration-500 motion-reduce:animate-none"
        >
          <p className="flex items-center gap-2 text-[10px] leading-[14px] font-medium text-[#efd6ae] sm:leading-5 sm:text-[11px] lg:text-xs">
            <span className="h-px w-6 bg-[#edc580]/70" aria-hidden="true" /> {slide.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="mt-0.5 text-[30px] leading-[1.25] sm:mt-2 sm:leading-[1.6] font-[900] tracking-[-0.5px] text-[#ffebc8] min-[375px]:text-[33px] min-[480px]:text-[36px] sm:text-[34px] md:text-[42px] lg:text-[58px]"
          >
            {slide.title}
          </h1>
          <p className="mt-0 text-[12px] leading-[18px] font-semibold sm:mt-1 sm:leading-6 text-[#fff4df] min-[480px]:text-base sm:text-[14px] lg:text-xl lg:leading-8">
            {slide.subtitle}
          </p>
          <p className="mt-3 hidden text-[13px] leading-7 text-[#ecdac4] md:block lg:max-w-[390px] lg:text-sm lg:leading-8">
            {slide.description}
          </p>
          <Button
            asChild
            className="mt-2 min-h-11 gap-2 border-[#f5d7a0] sm:mt-4 sm:min-h-12 bg-[#f3d39b] px-4 text-xs text-[#482216] shadow-[0_6px_24px_rgba(0,0,0,0.15)] hover:bg-[#ffe6b8] lg:mt-6 lg:px-6 lg:text-sm"
          >
            <Link href={slide.href}>
              <span className="md:hidden">{slide.mobileAction}</span>
              <span className="hidden md:inline">{slide.action}</span>
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <div
        className="absolute bottom-4 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-[#24110c]/55 px-1 shadow-sm backdrop-blur-sm lg:bottom-5"
        aria-label="کنترل اسلایدر"
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-[#f3d39b] hover:bg-white/10 hover:text-[#ffebc8]"
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
                index === current ? 'w-5 bg-[#f3d39b]' : 'w-2 bg-white/45',
              )}
            />
          </button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className="text-[#f3d39b] hover:bg-white/10 hover:text-[#ffebc8]"
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
            className="text-[#f3d39b] hover:bg-white/10 hover:text-[#ffebc8]"
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
