import Image from 'next/image';

const ornaments = [
  {
    name: 'fleuron-scroll',
    width: 420,
    height: 150,
    size: 'hidden md:block md:w-[112px] xl:w-[118px]',
    position: 'top-52 left-1 xl:left-2',
  },
  {
    name: 'fleuron-lace',
    width: 821,
    height: 263,
    size: 'hidden md:block md:w-[112px] xl:w-[118px]',
    position: 'top-56 right-1 xl:right-2',
  },
  {
    name: 'fleuron-vine',
    width: 1920,
    height: 620,
    size: 'w-[112px] md:w-[145px] xl:w-[185px]',
    position: 'top-[39%] left-1 xl:left-2',
  },
  {
    name: 'fleuron-bouquet',
    width: 297,
    height: 315,
    size: 'w-[64px] md:w-[92px] xl:w-[112px]',
    position: 'top-[52%] right-1 xl:right-2',
  },
  {
    name: 'fleuron-sprig',
    width: 300,
    height: 65,
    size: 'w-[104px] md:w-[142px] xl:w-[168px]',
    position: 'bottom-80 left-1 md:bottom-72 xl:left-2',
  },
  {
    name: 'fleuron-frond',
    width: 211,
    height: 141,
    size: 'w-[76px] md:w-[96px] xl:w-[124px]',
    position: 'bottom-96 right-1 md:bottom-80 xl:right-2',
  },
] as const;

export default function StorefrontBackdrop() {
  return (
    <div
      aria-hidden="true"
      data-slot="storefront-backdrop"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,#efd8b8_0%,transparent_45%),radial-gradient(ellipse_at_center_left,#f2e2c9_0%,transparent_55%),linear-gradient(180deg,#fbf4e7,#f6ecdb_60%,#f9f1e4)]"
    >
      {ornaments.map(({ name, width, height, size, position }) => (
        <Image
          key={name}
          data-ornament={name}
          src={`/images/ornaments/${name}.svg`}
          alt=""
          width={width}
          height={height}
          className={`absolute h-auto opacity-40 md:opacity-45 ${size} ${position}`}
        />
      ))}
    </div>
  );
}
