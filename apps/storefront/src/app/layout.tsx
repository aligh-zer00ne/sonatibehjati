import type { Metadata } from 'next';
import { BRAND_NAME } from '@behjati/shared';
export const metadata: Metadata = { title: BRAND_NAME };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
