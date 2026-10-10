import HeroCarousel from './HeroCarousel';
export default function HeroSection() {
  return (
    <section
      className="-mx-4 w-[calc(100%+32px)] min-[480px]:-mx-6 min-[480px]:w-[calc(100%+48px)] md:mx-auto md:w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none"
      aria-labelledby="hero-title"
    >
      <HeroCarousel />
    </section>
  );
}
