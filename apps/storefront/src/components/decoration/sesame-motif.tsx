import type { SVGProps } from 'react';

export type SesameMotifKind = 'seeds' | 'leaf' | 'oil' | 'tahini' | 'halva' | 'chocolate' | 'date';

const drawings: Record<SesameMotifKind, string[]> = {
  seeds: [
    'M18 16C9 23 10 37 18 39C26 41 30 24 18 16Z',
    'M42 9C31 17 33 31 41 33C50 35 54 18 42 9Z',
    'M64 22C53 27 51 41 58 45C67 49 76 34 64 22Z',
    'M29 49C18 56 20 70 28 72C37 74 41 58 29 49Z',
    'M54 56C43 63 45 77 53 79C62 81 66 65 54 56Z',
  ],
  leaf: [
    'M20 82C34 62 49 38 71 14',
    'M32 65C11 64 10 45 13 35C27 36 40 46 32 65Z',
    'M44 48C44 24 56 14 71 14C76 28 66 47 44 48Z',
    'M52 40C72 39 83 49 84 61C68 66 51 56 52 40Z',
    'M34 66C53 62 70 70 72 84C52 90 39 82 34 66Z',
    'M17 42L32 65M59 27L44 48M71 54L52 40M57 79L34 66',
  ],
  oil: [
    'M39 11H61V24H39Z',
    'M43 24V37C43 42 28 45 28 55V82Q28 89 36 89H64Q72 89 72 82V55C72 45 57 42 57 37V24',
    'M28 56H72M28 78H72',
    'M50 59C47 64 43 66 43 70A7 7 0 0 0 57 70C57 66 53 64 50 59Z',
    'M82 30C79 35 75 37 75 41A7 7 0 0 0 89 41C89 37 85 35 82 30Z',
  ],
  tahini: [
    'M13 48C18 74 30 82 50 82C70 82 82 74 87 48',
    'M13 48C13 30 87 30 87 48C87 62 13 62 13 48Z',
    'M30 46C30 37 70 37 70 46C70 54 37 54 37 46C37 41 61 41 61 46C61 49 47 49 47 46',
    'M35 83H65M72 29L85 13M77 34L92 24',
  ],
  halva: [
    'M17 36L61 21L86 39L43 56Z',
    'M17 36V68L43 85L86 67V39M43 56V85',
    'M31 40L54 32M46 43L65 37M31 52L34 59M24 58L29 62M53 63L60 60M68 68L77 64M52 75L56 74',
    'M63 12L68 9M17 80L22 83M78 85L83 83',
  ],
  chocolate: [
    'M16 35L59 16L85 42L42 63ZM16 35V47L42 74L85 55V42M42 63V74',
    'M30 29L57 56M45 23L71 49M26 45L69 26M34 54L77 34',
    'M20 80L33 76L42 84L30 90ZM69 78L77 75L84 82L76 87Z',
  ],
  date: [
    'M41 17C23 15 15 34 18 56C20 76 30 88 43 82C57 76 59 58 56 41C54 28 50 20 41 17Z',
    'M37 26C29 39 40 56 34 74',
    'M63 27C73 26 83 38 83 53C84 67 79 80 69 81C58 82 52 70 52 57',
    'M70 35C63 48 76 61 67 74M38 16L42 9M62 27L60 20',
  ],
};

export function SesameMotif({
  kind,
  ...props
}: SVGProps<SVGSVGElement> & { kind: SesameMotifKind }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {drawings[kind].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
