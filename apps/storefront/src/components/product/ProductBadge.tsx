import { Badge } from '@/components/ui/badge';
export default function ProductBadge({ label }: { label: string }) {
  return (
    <Badge className="absolute top-2 right-1.5 px-[9px] py-0.5 text-[10px] font-normal">
      {label}
    </Badge>
  );
}
