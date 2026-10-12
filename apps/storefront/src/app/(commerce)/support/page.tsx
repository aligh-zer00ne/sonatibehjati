import type { Metadata } from 'next';
import SupportEntry from '@/components/account/SupportEntry';

export const metadata: Metadata = {
  title: 'پشتیبانی سنتی بهجتی',
  alternates: { canonical: '/support' },
};

export default function Page() {
  return <SupportEntry />;
}
