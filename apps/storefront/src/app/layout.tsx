import type { Metadata } from 'next';
import '@fontsource-variable/vazirmatn';
import './globals.css';
import { BRAND_NAME } from '@behjati/shared';
import ClientRuntime from '@/components/layout/ClientRuntime';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: BRAND_NAME, template: `%s | ${BRAND_NAME}` },
  description: 'آشنایی با ارده، حلواارده و فرآورده‌های کنجدی حلواارده سنتی بهجتی اردکان.',
  alternates: { canonical: '/' },
  openGraph: {
    title: BRAND_NAME,
    description: 'طعم اصیل اردکان، از دل کنجد',
    locale: 'fa_IR',
    type: 'website',
    images: [{ url: '/images/hero.webp', width: 252, height: 191 }],
  },
  twitter: { card: 'summary', title: BRAND_NAME },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <a className="skip-link" href="#main">
          رفتن به محتوای اصلی
        </a>
        <ClientRuntime />
        {children}
      </body>
    </html>
  );
}
