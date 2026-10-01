import { SesamePattern } from './sesame-pattern';

export default function StorefrontBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,#efd8b8_0%,transparent_45%),radial-gradient(ellipse_at_center_left,#f2e2c9_0%,transparent_55%),linear-gradient(180deg,#fbf4e7,#f6ecdb_60%,#f9f1e4)]"
    >
      <SesamePattern className="opacity-[0.19]" />
    </div>
  );
}
