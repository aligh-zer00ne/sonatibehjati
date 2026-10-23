export default function SurfaceGlow() {
  return (
    <span
      aria-hidden="true"
      data-surface-glow
      className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] bg-[radial-gradient(ellipse_at_bottom_left,#d7a35020,transparent_65%)] [opacity:var(--surface-glow,0)] transition-opacity duration-300 motion-reduce:hidden"
    />
  );
}
