import { useEffect, useRef } from 'react';

type Point = { x: number; y: number; vx: number; vy: number; radius: number };

/** A bounded, decorative particle network. The surface and its text never follow the pointer. */
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
    let pointer: { x: number; y: number } | null = null;
    let release: ReturnType<typeof setTimeout> | undefined;
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
          context.strokeStyle = `rgba(237,197,125,${(1 - distance / reach) * 0.36})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
      let links = 0;
      if (pointer && !media.matches) {
        const nearest = points
          .map((point) => ({
            point,
            distance: Math.hypot(point.x - pointer!.x, point.y - pointer!.y),
          }))
          .filter((p) => p.distance < 165)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 6);
        links = nearest.length;
        for (const { point, distance } of nearest) {
          context.strokeStyle = `rgba(255,222,154,${(1 - distance / 165) * 0.55})`;
          context.beginPath();
          context.moveTo(pointer.x, pointer.y);
          context.lineTo(point.x, point.y);
          context.stroke();
        }
        if (links) {
          context.fillStyle = 'rgba(255,225,161,0.85)';
          context.beginPath();
          context.arc(pointer.x, pointer.y, 2, 0, Math.PI * 2);
          context.fill();
        }
      }
      setState('networkLinks', String(links));
      for (const point of points) {
        context.fillStyle = 'rgba(242,208,148,0.82)';
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
      if (!running()) {
        pointer = null;
        clearTimeout(release);
      }
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
    const clearPointer = () => {
      pointer = null;
      clearTimeout(release);
      if (!running()) paint(performance.now(), false);
    };
    const move = (event: PointerEvent) => {
      if (!running()) return;
      clearTimeout(release);
      const bounds = surface.getBoundingClientRect();
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') clearPointer();
    };
    const up = (event: PointerEvent) => {
      if (event.pointerType === 'touch') release = setTimeout(clearPointer, 350);
    };
    const intersection = new IntersectionObserver(([entry]) => {
      inView = !!entry?.isIntersecting;
      sync();
    });
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    intersection.observe(canvas);
    surface.addEventListener('pointermove', move, { passive: true });
    surface.addEventListener('pointerdown', move, { passive: true });
    surface.addEventListener('pointerleave', leave, { passive: true });
    surface.addEventListener('pointerup', up, { passive: true });
    surface.addEventListener('pointercancel', clearPointer, { passive: true });
    document.addEventListener('visibilitychange', sync);
    media.addEventListener('change', sync);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(release);
      observer.disconnect();
      intersection.disconnect();
      surface.removeEventListener('pointermove', move);
      surface.removeEventListener('pointerdown', move);
      surface.removeEventListener('pointerleave', leave);
      surface.removeEventListener('pointerup', up);
      surface.removeEventListener('pointercancel', clearPointer);
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
      data-network-links="0"
      className="pointer-events-none absolute inset-0 h-full w-full rounded-[inherit]"
    />
  );
}
