export default function ArdakanOutline() {
  return (
    <svg
      aria-hidden="true"
      data-slot="footer-ardakan"
      viewBox="0 0 520 250"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute bottom-[calc(82px+env(safe-area-inset-bottom))] left-0 h-[155px] w-[320px] max-w-full -translate-x-1/3 text-[#edc57d]/30 md:bottom-0 md:h-[220px] md:w-[460px] md:translate-x-0"
    >
      <path d="M6 238H518M20 238V179H89V238M28 179V164H80V179M37 164V143H71V164M34 143H74M29 139H79M40 150V160M50 150V160M60 150V160M26 194H83M41 238V214Q54 192 67 214V238M95 238V160H186V238M104 160V146H177V160M111 146Q140 94 170 146M140 116V106M119 238V200Q140 173 161 200V238M122 162H158M127 169H153M193 238V190H248V238M201 190V176H241V190M211 238V218Q221 203 231 218V238M375 238V172H458V238M383 172Q416 122 450 172M416 145V135M392 238V203Q416 174 441 203V238M471 238V189H506V238M479 198H498M479 207H498" />
      {[
        { x: 255, y: 40, height: 150 },
        { x: 337, y: 79, height: 111 },
      ].map(({ x, y, height }) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <path
            d={`M0 ${height + 48}V0H52V${height + 48}M-5 0H57L52 -8H0ZM-6 -8H58M0 62H52M0 67H52M7 7V55M17 7V55M27 7V55M37 7V55M46 7V55M0 ${height}H52M-4 ${height + 5}H56M8 ${height + 48}V${height + 19}Q26 ${height + 2} 44 ${height + 19}V${height + 48}`}
          />
          <path d="M7 15H46M7 45H46M8 78H17V102H8ZM35 78H44V102H35Z" />
        </g>
      ))}
      <path d="M178 238V218M178 218Q162 195 150 207M178 218Q183 187 201 194M178 218Q158 211 151 222M178 218Q196 204 206 213M15 148L10 143M10 148L15 143M473 124L478 129M478 124L473 129" />
    </svg>
  );
}
