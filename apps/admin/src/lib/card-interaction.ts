// Shared visual feedback; leaves semantics, layout and click targets to each card.
export const cardInteraction =
  "group relative isolate hover:!border-[#a6404e] hover:!shadow-[0_16px_32px_-18px_#701e2a80] focus-within:!border-[#a6404e] focus-within:!shadow-[0_12px_28px_-16px_#701e2a70] active:!border-[#701e2a] after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-[inherit] after:bg-[linear-gradient(145deg,transparent_50%,#701e2a0d)] after:opacity-0 after:transition-opacity after:duration-300 after:content-[''] hover:after:opacity-100 focus-within:after:opacity-100 active:after:opacity-100 motion-safe:hover:-translate-y-1 motion-safe:active:translate-y-0 motion-safe:transition-[border-color,box-shadow,transform,translate] motion-safe:duration-300 motion-reduce:transition-none motion-reduce:after:transition-none";

export const cardIconInteraction =
  'motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-105 motion-safe:group-focus-within:-rotate-6 motion-safe:group-active:scale-95 motion-reduce:transform-none group-hover:shadow-[0_9px_18px_#701e2a30]';
