import { Truck } from 'lucide-react';
import { getHomepageContent } from '@/lib/catalog/service';
export default async function AnnouncementBar() {
  const { announcement } = await getHomepageContent();
  if (!announcement.enabled) return null;
  return (
    <div className="flex min-h-[34px] items-center justify-center gap-2 bg-primary px-4 py-1.5 text-center text-xs font-medium leading-5 text-primary-foreground xl:min-h-9">
      <Truck size={17} className="shrink-0" />
      <span className="break-words [overflow-wrap:anywhere]">{announcement.text}</span>
    </div>
  );
}
