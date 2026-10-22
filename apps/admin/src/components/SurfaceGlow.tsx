export default function SurfaceGlow() {
  return (
    <span
      aria-hidden="true"
      data-surface-glow
      className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] bg-[radial-gradient(260px_circle_at_var(--surface-x,50%)_var(--surface-y,50%),#edc57d26,transparent_75%)] [opacity:var(--surface-glow,0)] transition-opacity duration-300 motion-reduce:hidden"
    />
  );
}
