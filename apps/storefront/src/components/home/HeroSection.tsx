import HeroCarousel from './HeroCarousel';
export default function HeroSection() {
  return (
    <section
      className="mx-auto w-1/2 md:w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out motion-reduce:animate-none"
      aria-labelledby="hero-title"
    >
      <HeroCarousel />
    </section>
  );
}
