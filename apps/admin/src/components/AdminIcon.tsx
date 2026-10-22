import type { SVGProps } from 'react';
const paths = {
  search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  refresh: 'M20 7V3m0 4h-4M4 17v4m0-4h4M20 7a9 9 0 0 0-16 2M4 17a9 9 0 0 0 16-2',
  trend: 'm3 17 6-6 4 4 8-10M15 5h6v6',
  download: 'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
  support: 'M4 14v-3a8 8 0 0 1 16 0v3M4 12H2v7h4v-7H4ZM20 12h2v7h-4v-7h2ZM18 19v3h-6',
  review: 'M3 3h18v14H8l-5 4V3ZM7 7h10M7 11h7',
  home: 'm3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7',
  orders: 'M3 3h2l3 12h11l3-9H6M9 20h.01M18 20h.01',
  products: 'm12 3 9 5v10l-9 5-9-5V8l9-5Zm-9 5 9 5 9-5M12 13v10M7 5l10 6',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  discount: 'M9 3H3v6l12 12 6-6L9 3ZM7 7h.01M10 16l6-6',
  reports: 'M4 21V11h4v10M10 21V3h4v18M16 21v-7h4v7',
  settings:
    'M9.5 3h5l.6 2.5 2 .9 2.3-.7 2.5 4.3-1.8 1.8v2.4l1.8 1.8-2.5 4.3-2.3-.7-2 .9-.6 2.5h-5L8.9 20l-2-.9-2.3.7-2.5-4.3 1.8-1.8v-2.4L2.1 9.5l2.5-4.3 2.3.7 2-.9.6-2.5ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  menu: 'M4 6h16M4 12h16M4 18h16',
  map: 'm3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5ZM9 3v16M15 5v16',
  logout: 'M9 3H4v18h5M9 12h12M17 8l4 4-4 4',
  calendar: 'M8 2v4M16 2v4M3 10h18M3 5h18v16H3V5Z',
  wallet: 'M20 8V4H4v16h16v-6M16 8h6v6h-6V8ZM18 11h.01',
  arrow: 'M19 12H5M10 7l-5 5 5 5',
  plus: 'M12 5v14M5 12h14',
  print: 'M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6v-7ZM17 12h.01',
  shield: 'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7l-9-4ZM8 12l3 3 5-6',
  person: 'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  phone: 'M7 3H3c0 10 8 18 18 18v-4l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5Z',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  chevron: 'm6 9 6 6 6-6',
  close: 'm6 6 12 12M6 18 18 6',
  history: 'M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2',
  truck:
    'M3 5h12v12H3V5ZM15 9h4l3 4v4h-7M8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM21 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  edit: 'm15 4 5 5M3 21l5-1L21 7l-5-5L3 15v6Z',
  receipt: 'M5 3h14v19l-3-2-4 2-4-2-3 2V3ZM9 7h6M9 11h6M9 15h3',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  eyeOff:
    'm3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.5 5.3A11 11 0 0 1 12 5c6 0 10 7 10 7a20 20 0 0 1-3 3.8M6.2 6.2A24 24 0 0 0 2 12s4 7 10 7a12 12 0 0 0 5.8-1.8',
  mail: 'M3 5h18v14H3V5Zm0 1 9 7 9-7',
  lock: 'M5 10h14v11H5V10ZM8 10V6a4 4 0 0 1 8 0v4M12 14v3',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
} as const;
export type AdminIconName = keyof typeof paths;
export default function AdminIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: AdminIconName }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
