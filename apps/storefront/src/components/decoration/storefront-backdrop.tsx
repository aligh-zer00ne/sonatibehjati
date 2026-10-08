import Image from 'next/image';

const ornamentPositions = [
  'top-32 -left-[52px] md:top-40 md:-left-[90px] xl:-left-[124px]',
  'top-32 -right-[52px] rotate-180 md:top-40 md:-right-[90px] xl:-right-[124px]',
  'top-[43%] -left-[52px] md:-left-[90px] xl:-left-[124px]',
  'top-[43%] -right-[52px] rotate-180 md:-right-[90px] xl:-right-[124px]',
  'bottom-72 -left-[52px] md:bottom-44 md:-left-[90px] xl:-left-[124px]',
  'bottom-72 -right-[52px] rotate-180 md:bottom-44 md:-right-[90px] xl:-right-[124px]',
] as const;

export default function StorefrontBackdrop() {
  return (
    <div
      aria-hidden="true"
      data-slot="storefront-backdrop"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,#efd8b8_0%,transparent_45%),radial-gradient(ellipse_at_center_left,#f2e2c9_0%,transparent_55%),linear-gradient(180deg,#fbf4e7,#f6ecdb_60%,#f9f1e4)]"
    >
      {ornamentPositions.map((position) => (
        <Image
          key={position}
          src="/images/ornaments/sesame-arabesque.svg"
          alt=""
          width={280}
          height={600}
          className={`absolute h-auto w-[88px] opacity-40 md:w-[152px] md:opacity-50 xl:w-[210px] ${position}`}
        />
      ))}
    </div>
  );
}
