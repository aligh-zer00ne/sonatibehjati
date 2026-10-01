import { Truck } from 'lucide-react';
export default function AnnouncementBar() {
  return (
    <div className="flex h-[34px] items-center justify-center gap-2 bg-primary text-[11px] text-primary-foreground xl:h-9 xl:text-xs">
      <Truck size={17} />
      <span>طعم اردکان، همراه شما در سراسر ایران</span>
    </div>
  );
}
