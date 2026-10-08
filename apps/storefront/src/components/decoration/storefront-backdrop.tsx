import { SesameMotif } from './sesame-motif';

export default function StorefrontBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[linear-gradient(180deg,#fbf7ee,#f7efdf_55%,#fbf7ee)] text-[#c6a46d]"
    >
      <div className="absolute inset-y-0 right-0 w-[clamp(18px,3vw,54px)] border-r border-[#c6a46d]/15 bg-[linear-gradient(90deg,transparent,#d8b7810d)]" />
      <div className="absolute inset-y-0 left-0 w-[clamp(18px,3vw,54px)] border-l border-[#c6a46d]/15 bg-[linear-gradient(270deg,transparent,#d8b7810d)]" />
      <div className="absolute inset-x-0 top-0 h-16 border-t border-[#c6a46d]/15 bg-[linear-gradient(180deg,#d8b78110,transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-16 border-b border-[#c6a46d]/15 bg-[linear-gradient(0deg,#d8b78110,transparent)]" />
      <SesameMotif kind="leaf" className="absolute -top-8 -right-8 size-28 rotate-[-28deg] opacity-40 md:size-44" />
      <SesameMotif kind="seeds" className="absolute -top-8 -left-8 size-28 rotate-[28deg] opacity-40 md:size-44" />
      <SesameMotif kind="halva" className="absolute -bottom-8 -right-8 size-28 rotate-[24deg] opacity-40 md:size-44" />
      <SesameMotif kind="tahini" className="absolute -bottom-8 -left-8 size-28 rotate-[-24deg] opacity-40 md:size-44" />
      <SesameMotif kind="oil" className="absolute top-[34%] -right-8 size-24 rotate-12 opacity-25 md:size-36" />
      <SesameMotif kind="seeds" className="absolute top-[60%] -left-8 size-24 -rotate-12 opacity-25 md:size-36" />
    </div>
  );
}
