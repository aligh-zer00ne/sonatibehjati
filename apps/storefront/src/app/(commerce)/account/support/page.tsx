import type { Metadata } from 'next';
import SupportTickets from '@/components/account/SupportTickets';
export const metadata: Metadata = {
  title: 'پشتیبانی و تیکت‌ها',
  robots: { index: false, follow: false },
};
export default function Page() {
  return <SupportTickets />;
}
