import type { Metadata } from 'next';
import SupportConversation from '@/components/account/SupportConversation';
export const metadata: Metadata = {
  title: 'گفتگو با پشتیبانی',
  robots: { index: false, follow: false },
};
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SupportConversation id={id} />;
}
