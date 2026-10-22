import { useEffect, useRef } from 'react';
import SurfaceGlow from './SurfaceGlow';

/** A small SVG constellation; CSS runs its two slow loops without a canvas/render loop. */
export default function AmbientBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let inView = false;
    const sync = () => {
      element.dataset.active = String(inView && !document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = !!entry?.isIntersecting;
      sync();
    });
    observer.observe(element);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);
  return (
    <>
      <div
        ref={ref}
        aria-hidden="true"
        data-ambient-backdrop
        data-active="false"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] data-[active=false]:[&_[data-ambient-layer]]:[animation-play-state:paused]"
      >
        <div className="absolute -inset-4 motion-safe:transition-transform motion-safe:duration-500 motion-safe:[transform:translate3d(var(--surface-dx,0px),var(--surface-dy,0px),0)]">
          <div
            data-ambient-layer
            className="absolute -top-20 -left-12 h-72 w-80 rounded-full bg-[#edc57d]/10 blur-3xl motion-safe:animate-ambient-breathe"
          />
          <svg
            viewBox="0 0 900 360"
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full text-[#edc57d]"
          >
            <g data-ambient-layer className="motion-safe:animate-ambient-drift">
              <path
                d="M42 72 126 38 201 98 266 61M126 38l18 132 57-72 84 94 92-33M42 72l22 158 80-60M504 34l92 73 66-48 120 39 67-61M596 107l-36 119 111 35 111-163M671 261l112 53 66-118-67-98M285 192l-27 117 119-26 57 45M64 230l63 82 131-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.7"
                opacity="0.13"
              />
              {[
                [42, 72],
                [126, 38],
                [201, 98],
                [266, 61],
                [144, 170],
                [285, 192],
                [377, 159],
                [64, 230],
                [504, 34],
                [596, 107],
                [662, 59],
                [782, 98],
                [849, 37],
                [560, 226],
                [671, 261],
                [783, 314],
                [849, 196],
                [258, 309],
                [377, 283],
                [434, 328],
                [127, 312],
              ].map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={i % 4 === 0 ? 2.4 : 1.5}
                  fill="currentColor"
                  opacity={i % 4 === 0 ? 0.5 : 0.25}
                />
              ))}
            </g>
          </svg>
        </div>
      </div>
      <SurfaceGlow />
    </>
  );
}
