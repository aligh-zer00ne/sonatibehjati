import type { Metadata } from 'next';
import '@fontsource-variable/vazirmatn';
import './globals.css';
import { BRAND_NAME } from '@behjati/shared';
import ClientRuntime from '@/components/layout/ClientRuntime';
import StorefrontBackdrop from '@/components/decoration/storefront-backdrop';
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
    <html lang="fa" dir="rtl" className="scroll-smooth scroll-pt-6 motion-reduce:scroll-auto">
      <body className="relative isolate min-h-dvh bg-background font-sans text-sm leading-[1.8] text-foreground [&_a]:touch-manipulation [&_a]:outline-offset-4 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-primary [&_button]:touch-manipulation">
        <StorefrontBackdrop />
        <a
          className="fixed -top-[100px] right-[15px] z-[100] bg-white p-2.5 text-primary focus:top-2.5"
          href="#main"
        >
          رفتن به محتوای اصلی
        </a>
        <ClientRuntime />
        {children}
      </body>
    </html>
  );
}
