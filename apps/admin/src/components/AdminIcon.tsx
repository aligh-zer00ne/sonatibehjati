import type { SVGProps } from 'react';
const paths = {
  home: 'm3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7',
  orders: 'M3 3h2l3 12h11l3-9H6M9 20h.01M18 20h.01',
  products: 'm12 3 9 5v10l-9 5-9-5V8l9-5Zm-9 5 9 5 9-5M12 13v10M7 5l10 6',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  discount: 'M9 3H3v6l12 12 6-6L9 3ZM7 7h.01M10 16l6-6',
  reports: 'M4 21V11h4v10M10 21V3h4v18M16 21v-7h4v7',
  settings:
    'M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  menu: 'M4 6h16M4 12h16M4 18h16',
  map: 'm3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5ZM9 3v16M15 5v16',
  logout: 'M9 3H4v18h5M9 12h12M17 8l4 4-4 4',
  calendar: 'M8 2v4M16 2v4M3 10h18M3 5h18v16H3V5Z',
  wallet: 'M20 8V4H4v16h16v-6M16 8h6v6h-6V8ZM18 11h.01',
  arrow: 'M19 12H5M10 7l-5 5 5 5',
  plus: 'M12 5v14M5 12h14',
  print: 'M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6v-7ZM17 12h.01',
  shield: 'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7l-9-4ZM8 12l3 3 5-6',
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
