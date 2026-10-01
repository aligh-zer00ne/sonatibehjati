import { useId } from 'react';
import { cn } from '@/lib/utils';
import { SesameMotif, type SesameMotifKind } from './sesame-motif';

export function SesamePattern({
  motif,
  className,
}: {
  motif?: SesameMotifKind;
  className?: string;
}) {
  const id = useId();
  const compact = Boolean(motif);
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-decoration={compact ? 'product' : 'page'}
      data-motif={motif}
      viewBox={compact ? '0 0 220 420' : undefined}
      preserveAspectRatio="xMidYMid slice"
      className={cn('pointer-events-none absolute inset-0 h-full w-full text-clay', className)}
    >
      <defs>
        <pattern
          id={id}
          width={compact ? 220 : 520}
          height={compact ? 420 : 500}
          patternUnits="userSpaceOnUse"
        >
          {motif ? (
            <>
              <g transform="translate(161 270) rotate(18 30 30)">
                <SesameMotif kind={motif} width="60" height="60" />
              </g>
              <g transform="translate(-2 307) rotate(-24 24 24)">
                <SesameMotif kind={motif} width="48" height="48" />
              </g>
              <SesameMotif kind="seeds" x="10" y="246" width="33" height="33" />
              <SesameMotif kind="seeds" x="171" y="8" width="29" height="29" />
              <g transform="translate(5 5) rotate(-35 20 20)">
                <SesameMotif kind="leaf" width="40" height="40" />
              </g>
            </>
          ) : (
            <>
              <g transform="translate(30 34) rotate(-24 40 40)">
                <SesameMotif kind="leaf" width="80" height="80" />
              </g>
              <SesameMotif kind="seeds" x="182" y="26" width="38" height="38" />
              <g transform="translate(352 39) rotate(17 44 44)">
                <SesameMotif kind="tahini" width="88" height="88" />
              </g>
              <g transform="translate(202 144) rotate(-17 42 42)">
                <SesameMotif kind="oil" width="84" height="84" />
              </g>
              <SesameMotif kind="seeds" x="452" y="191" width="48" height="48" />
              <SesameMotif kind="seeds" x="33" y="195" width="26" height="26" />
              <g transform="translate(67 293) rotate(14 44 44)">
                <SesameMotif kind="halva" width="88" height="88" />
              </g>
              <g transform="translate(358 311) rotate(31 34 34)">
                <SesameMotif kind="leaf" width="68" height="68" />
              </g>
              <SesameMotif kind="seeds" x="216" y="335" width="50" height="50" />
              <SesameMotif kind="date" x="267" y="427" width="42" height="42" />
              <g transform="translate(432 433) rotate(-19 25 25)">
                <SesameMotif kind="chocolate" width="50" height="50" />
              </g>
              <SesameMotif kind="seeds" x="70" y="452" width="32" height="32" />
            </>
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
