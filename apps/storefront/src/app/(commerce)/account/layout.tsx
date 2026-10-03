import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import AccountShell from '@/components/account/AccountShell';
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
