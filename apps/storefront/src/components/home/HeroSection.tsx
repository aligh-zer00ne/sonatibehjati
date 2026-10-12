import type { HeroSlide } from '@behjati/shared/homepage';
import HeroCarousel from './HeroCarousel';
export default function HeroSection({ slides }: { slides: HeroSlide[] }) {
  return (
    <section
      className="mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none"
      aria-labelledby="hero-title"
    >
      <HeroCarousel slides={slides} />
    </section>
  );
}
