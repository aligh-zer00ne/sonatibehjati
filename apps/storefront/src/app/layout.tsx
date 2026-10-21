import type { Metadata } from 'next';
import '@fontsource-variable/vazirmatn';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { BRAND_NAME } from '@behjati/shared';
import AuthProvider from '@/components/auth/AuthProvider';
import ClientRuntime from '@/components/layout/ClientRuntime';
import StorefrontBackdrop from '@/components/decoration/storefront-backdrop';
import { BUSINESS, pageMetadata, SITE_URL } from '@/lib/seo';
export const metadata: Metadata = {
  ...pageMetadata({ title: 'خرید ارده و حلواارده اردکان', path: '/' }),
  metadataBase: new URL(SITE_URL),
  alternates: undefined,
  title: { default: BRAND_NAME, template: `%s | ${BRAND_NAME}` },
  applicationName: BUSINESS.name,
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png', sizes: '192x192' }],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
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
        <AuthProvider>
          <ClientRuntime />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
