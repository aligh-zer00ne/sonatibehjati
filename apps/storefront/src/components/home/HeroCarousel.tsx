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
    src: '/images/home/hero-tahini-wide-v4.webp',
    mobileSrc: '/images/home/hero-tahini-scene.webp',
    alt: 'ارده‌های ممتاز سنتی بهجتی روی سکوی سنگی در حیاطی با نور گرم اردکان',
    label: 'ارده ممتاز',
    eyebrow: 'فرآورده‌های کنجدی اردکان',
    title: 'سنتی بهجتی',
    subtitle: 'طعم اصالت، از دل کویر',
    description: 'ارده، حلواارده و طعم‌های کنجدی؛ همراه صبحانه و سفرهٔ هر روز شما.',
    href: '/shop',
    action: 'مشاهده محصولات',
  },
  {
    src: '/images/home/hero-oil-wide-v4.webp',
    mobileSrc: '/images/home/hero-oil-scene.webp',
    alt: 'بسته‌بندی‌های واقعی روغن کنجد سنتی بهجتی با رنگ طلایی و نور طبیعی',
    label: 'روغن کنجد',
    eyebrow: 'روغن کنجد سنتی بهجتی',
    title: 'طلای کنجد',
    subtitle: 'برای آشپزخانهٔ شما',
    description: 'روغن‌های کنجد را ببینید و بسته‌بندی مناسب آشپزخانهٔ خود را انتخاب کنید.',
    href: '/category/oil',
    action: 'مشاهده روغن‌های کنجد',
  },
  {
    src: '/images/home/hero-flavored-wide-v4.webp',
    mobileSrc: '/images/home/hero-flavored-scene.webp',
    alt: 'ارده شکلاتی، کرم ارده و ارده فندقی سنتی بهجتی در فضایی گرم و سنتی',
    label: 'ارده‌های طعم‌دار',
    eyebrow: 'طعم‌های تازهٔ سنتی بهجتی',
    title: 'طعم‌های تازه',
    subtitle: 'شکلاتی، فندقی یا کرم ارده؟',
    description: 'از میان طعم‌های مختلف ارده، همراه تازهٔ صبحانه‌تان را پیدا کنید.',
    href: '/category/tahini',
    action: 'کشف ارده‌های طعم‌دار',
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
      className="relative isolate overflow-hidden rounded-[26px] border border-earth/10 bg-[#eee0cb] pb-[76px] shadow-[0_16px_50px_-35px_rgba(72,40,24,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:min-h-[540px] lg:pb-0"
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
        className="relative aspect-[3/2] touch-pan-y overflow-hidden lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
      >
        {slides.map((item, index) => {
          const { props: desktop } = getImageProps({
            src: item.src,
            alt: item.alt,
            width: 2400,
            height: 1000,
            quality: 85,
            sizes: '(min-width: 1200px) 1200px, 100vw',
          });
          const { props: mobile } = getImageProps({
            src: item.mobileSrc,
            alt: item.alt,
            width: 1536,
            height: 1024,
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
                <source media="(min-width: 1024px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
                <img
                  {...mobile}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover transition-transform duration-[7000ms] ease-out motion-reduce:transform-none motion-reduce:transition-none',
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
        className="relative z-[1] mx-4 -mt-5 rounded-[22px] border border-white/70 bg-[#fffaf2]/95 p-6 text-right shadow-[0_16px_45px_-20px_rgba(72,40,24,0.3)] backdrop-blur-md min-[480px]:mx-6 min-[480px]:p-8 md:mx-auto md:w-[calc(100%-48px)] md:max-w-[620px] lg:my-12 lg:mr-[3%] lg:ml-auto lg:w-[40%] lg:max-w-[440px] lg:p-10"
      >
        <div
          key={current}
          className="animate-in fade-in slide-in-from-right-3 duration-500 motion-reduce:animate-none"
        >
          <p className="text-xs font-semibold text-primary/85 lg:text-[13px]">{slide.eyebrow}</p>
          <h1
            id="hero-title"
            className="mt-3 text-[34px] leading-[1.5] font-[900] tracking-[-1px] text-primary min-[375px]:text-[40px] min-[480px]:text-[52px] lg:text-[58px]"
          >
            {slide.title}
          </h1>
          <p className="mt-1 text-lg leading-8 font-bold text-[#482818] lg:text-[21px]">
            {slide.subtitle}
          </p>
          <p className="mt-3 min-h-14 text-[13px] leading-7 text-earth lg:text-sm">
            {slide.description}
          </p>
          <Button asChild className="mt-5 w-full gap-2 text-xs min-[480px]:w-auto lg:text-sm">
            <Link href={slide.href}>
              {slide.action} <ArrowLeft size={17} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <div
        className="absolute bottom-4 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/65 bg-[#fffaf2]/95 px-1 shadow-sm backdrop-blur-md md:bottom-5"
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
