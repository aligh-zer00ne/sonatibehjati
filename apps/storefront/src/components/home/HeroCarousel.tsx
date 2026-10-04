'use client';
import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { formatNumber } from '@behjati/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SesamePattern } from '@/components/decoration/sesame-pattern';
const slides = [
  {
    src: '/images/home/tahini-family.webp',
    alt: 'بسته‌بندی‌های واقعی ارده ممتاز سنتی بهجتی با درهای زرد، قرمز و آبی',
    label: 'ارده ممتاز',
  },
  {
    src: '/images/home/oil-family.webp',
    alt: 'چهار بسته‌بندی واقعی روغن کنجد سنتی بهجتی',
    label: 'روغن کنجد',
  },
  {
    src: '/images/home/flavored-family.webp',
    alt: 'ارده شکلاتی، کرم ارده و ارده فندقی سنتی بهجتی با بسته‌بندی واقعی',
    label: 'ارده‌های طعم‌دار',
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
    const timer = setInterval(() => setCurrent((value) => (value + 1) % slides.length), 6500);
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
      className="relative order-2 -mx-5 h-[290px] w-[calc(100%+40px)] shrink-0 touch-pan-y min-[480px]:h-[340px] md:absolute md:bottom-0 md:left-0 md:m-0 md:h-full md:w-[55%] xl:w-[57%]"
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
        if (event.pointerType === 'touch') gesture.current = { x: event.clientX, y: event.clientY };
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
      <SesamePattern motif="tahini" className="text-clay opacity-25" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 bottom-12 h-5 rounded-[100%] bg-earth/15 blur-lg md:inset-x-12 md:bottom-20"
      />
      <div
        id={id}
        className="absolute inset-x-0 top-0 bottom-14 overflow-hidden md:top-4 md:bottom-16"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            role="group"
            aria-roledescription="اسلاید"
            aria-label={`${formatNumber(index + 1)} از ${formatNumber(slides.length)}: ${slide.label}`}
            aria-hidden={index !== current}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none',
              index === current ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <Image
              className={cn(
                'object-contain px-5 drop-shadow-[0_18px_16px_rgba(98,69,47,0.16)] transition-transform duration-[6500ms] ease-out motion-reduce:transform-none motion-reduce:transition-none md:px-6',
                index === current ? 'scale-100' : 'scale-[1.04]',
              )}
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              quality={85}
              sizes="(max-width: 767px) 100vw, 650px"
            />
          </div>
        ))}
      </div>
      <div
        className="absolute bottom-2 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1 rounded-full border border-earth/10 bg-background/95 px-1 shadow-sm md:bottom-5"
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
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            className="flex h-11 w-8 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={`نمایش اسلاید ${formatNumber(index + 1)}: ${slide.label}`}
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
        {slides[current]!.label}، اسلاید {formatNumber(current + 1)} از{' '}
        {formatNumber(slides.length)}
      </p>
    </div>
  );
}
