import { useEffect, useRef } from 'react';

type Point = { x: number; y: number; vx: number; vy: number; radius: number };

/** A bounded, decorative particle network. It does not react to the pointer. */
export default function AmbientBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const surface = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !surface || !context) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let points: Point[] = [];
    let width = 0,
      height = 0,
      frame = 0,
      lastPaint = 0;
    let inView = false,
      disposed = false;
    const running = () => inView && !document.hidden && !media.matches && !disposed;
    const setState = (name: string, value: string) => {
      if (canvas.dataset[name] !== value) canvas.dataset[name] = value;
    };
    const paint = (timestamp: number, advance: boolean) => {
      const dt = advance ? Math.min(0.06, Math.max(0, (timestamp - lastPaint) / 1000)) : 0;
      lastPaint = timestamp;
      context.clearRect(0, 0, width, height);
      for (const point of points) {
        point.x += point.vx * dt;
        point.y += point.vy * dt;
        if (point.x < 8 || point.x > width - 8) {
          point.vx *= -1;
          point.x = Math.max(8, Math.min(width - 8, point.x));
        }
        if (point.y < 8 || point.y > height - 8) {
          point.vy *= -1;
          point.y = Math.max(8, Math.min(height - 8, point.y));
        }
      }
      const reach = Math.max(72, Math.min(135, width / 5));
      context.lineWidth = 0.95;
      for (let i = 0; i < points.length; i++) {
        const a = points[i]!;
        let neighbors = 0;
        for (let j = i + 1; j < points.length && neighbors < 3; j++) {
          const b = points[j]!;
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance >= reach) continue;
          neighbors++;
          context.strokeStyle = `rgba(139,194,203,${(1 - distance / reach) * 0.36})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
      for (const point of points) {
        context.fillStyle = 'rgba(157,205,212,0.82)';
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fill();
      }
    };
    const animate = (timestamp: number) => {
      if (!running()) {
        // Also reconcile here if a browser delays a media/visibility change event.
        sync();
        return;
      }
      if (timestamp - lastPaint >= 1000 / 30) paint(timestamp, true);
      frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      setState('networkState', media.matches ? 'static' : running() ? 'running' : 'paused');
      paint(performance.now(), false);
      if (running()) frame = requestAnimationFrame(animate);
    };
    const resize = () => {
      const bounds = surface.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(14, Math.min(42, Math.round((width * height) / 10000)));
      let seed = 8345;
      const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      points = Array.from({ length: count }, (_, i) => ({
        x: (i === 0 ? 0.08 : 0.04 + random() * 0.92) * width,
        y: (i === 0 ? 0.1 : 0.08 + random() * 0.84) * height,
        vx: Math.sin(i * 2.4 + 1) * 6,
        vy: Math.cos(i * 1.7 + 2) * 5,
        radius: i % 4 === 0 ? 2 : 1.2,
      }));
      sync();
    };
    const intersection = new IntersectionObserver(([entry]) => {
      inView = !!entry?.isIntersecting;
      sync();
    });
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    intersection.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    media.addEventListener('change', sync);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', sync);
      media.removeEventListener('change', sync);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-ambient-backdrop
      data-network-state="paused"
      className="pointer-events-none absolute inset-0 h-full w-full rounded-[inherit]"
    />
  );
}
