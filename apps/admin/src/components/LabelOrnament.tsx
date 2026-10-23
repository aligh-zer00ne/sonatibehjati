// Print-native vector ornaments: no raster background, animation or external artwork.
export function LabelWindcatcher({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 110"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path d="M14 105H106M39 104V29L60 17L81 29V104M33 29L60 13L87 29L81 33L60 22L39 33ZM30 24L60 6L90 24M45 39V79M53 35V79M61 33V79M69 36V79M76 39V79M40 84H80M40 89H80M51 104V96L60 91L69 96V104" />
      <path
        d="M29 99Q8 94 15 78Q3 69 15 58Q5 42 25 38M91 99Q112 94 105 78Q117 69 105 58Q115 42 95 38M25 87Q11 81 26 73Q34 83 25 87ZM95 87Q109 81 94 73Q86 83 95 87ZM24 65Q11 59 24 50Q35 59 24 65ZM96 65Q109 59 96 50Q85 59 96 65Z"
        fill="currentColor"
        strokeWidth="1"
      />
      <path d="M17 99Q28 89 36 99M84 99Q92 89 103 99M8 107H112" />
    </svg>
  );
}
export function LabelFlourish({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 80"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 73V39Q4 8 36 8H73M9 73V40Q9 14 37 14H73M17 64Q36 61 29 47Q14 42 17 64ZM36 40Q52 41 48 25Q33 24 36 40ZM52 21Q68 25 65 12M12 72Q36 75 43 55Q51 35 72 35" />
      <path
        d="M40 57Q57 59 54 44Q40 43 40 57ZM60 41Q73 44 72 31Q60 30 60 41Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LabelSkyline({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 50" className={className} fill="currentColor">
      <path d="M0 48H200V50H0ZM10 48V35H23V48ZM25 48V28L37 17L49 28V48ZM54 48V9H71V48ZM51 9L62 2L75 9V12H51ZM78 48V33H87V28H95V48ZM100 48V23Q113 4 126 23V48ZM132 48V15H147V48ZM129 15L140 6L151 15V18H129ZM155 48V31L168 20L182 31V48ZM185 48V38H195V48Z" />
      <path
        d="M58 14V31M63 14V31M68 14V31M136 21V34M141 21V34M145 21V34"
        stroke="white"
        strokeWidth="1.4"
      />
      <path
        d="M32 48V36Q37 29 42 36V48M108 48V33Q113 27 118 33V48M163 48V37Q168 31 173 37V48"
        fill="white"
      />
    </svg>
  );
}
