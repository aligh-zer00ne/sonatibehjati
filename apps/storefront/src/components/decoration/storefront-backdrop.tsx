import Image from 'next/image';

const ornaments = [
  {
    name: 'sesame-rosette',
    position: 'top-28 -left-[44px] md:top-36 md:-left-[72px] xl:-left-[94px]',
  },
  {
    name: 'ardakan-windcatcher',
    position: 'top-32 -right-[50px] md:top-44 md:-right-[76px] xl:-right-[92px]',
  },
  {
    name: 'sesame-branch',
    position: 'top-[39%] -left-[48px] md:-left-[76px] xl:-left-[96px]',
  },
  {
    name: 'tahini-bowl',
    position: 'top-[52%] -right-[50px] md:-right-[78px] xl:-right-[98px]',
  },
  {
    name: 'ardakan-arch',
    position: 'bottom-72 -left-[48px] md:bottom-48 md:-left-[76px] xl:-left-[96px]',
  },
  {
    name: 'halva-mosaic',
    position: 'bottom-80 -right-[48px] md:bottom-56 md:-right-[78px] xl:-right-[98px]',
  },
] as const;

export default function StorefrontBackdrop() {
  return (
    <div
      aria-hidden="true"
      data-slot="storefront-backdrop"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,#efd8b8_0%,transparent_45%),radial-gradient(ellipse_at_center_left,#f2e2c9_0%,transparent_55%),linear-gradient(180deg,#fbf4e7,#f6ecdb_60%,#f9f1e4)]"
    >
      {ornaments.map(({ name, position }) => (
        <Image
          key={name}
          data-ornament={name}
          src={`/images/ornaments/${name}.svg`}
          alt=""
          width={240}
          height={420}
          className={`absolute h-auto w-[92px] opacity-40 md:w-[150px] md:opacity-50 xl:w-[190px] ${position}`}
        />
      ))}
    </div>
  );
}
