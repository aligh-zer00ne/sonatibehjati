import Image from 'next/image';

const ornaments = [
  {
    name: 'arabesque-palmette',
    width: 205,
    height: 205,
    position: 'top-32 left-1 md:top-44 xl:left-2',
  },
  {
    name: 'arabesque-foliage',
    width: 205,
    height: 200,
    position: 'top-36 right-1 md:top-52 xl:right-2',
  },
  {
    name: 'arabesque-vine',
    width: 205,
    height: 105,
    position: 'top-[39%] left-1 -rotate-90 xl:left-2',
  },
  {
    name: 'arabesque-lotus',
    width: 205,
    height: 205,
    position: 'top-[52%] right-1 xl:right-2',
  },
  {
    name: 'arabesque-scrolls',
    width: 200,
    height: 190,
    position: 'bottom-80 left-1 md:bottom-72 xl:left-2',
  },
  {
    name: 'arabesque-knot',
    width: 130,
    height: 205,
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
      {ornaments.map(({ name, width, height, position }) => (
        <Image
          key={name}
          data-ornament={name}
          src={`/images/ornaments/${name}.svg`}
          alt=""
          width={width}
          height={height}
          className={`absolute h-auto w-[clamp(52px,8vw,176px)] opacity-25 md:opacity-35 ${position}`}
        />
      ))}
    </div>
  );
}
