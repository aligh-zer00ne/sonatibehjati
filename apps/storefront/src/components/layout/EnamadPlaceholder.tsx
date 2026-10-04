import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
export default function EnamadPlaceholder() {
  return (
    <Card
      data-enamad-placeholder
      className="mx-auto flex w-full max-w-[220px] flex-col items-center gap-3 border-dashed border-earth/25 bg-background/70 p-5 text-center shadow-none md:mx-0"
      role="region"
      aria-labelledby="enamad-title"
    >
      <Shield size={38} strokeWidth={1.3} className="text-earth/50" aria-hidden="true" />
      <h3 id="enamad-title" className="text-sm font-bold text-earth">
        نماد اعتماد الکترونیکی
      </h3>
      <p className="text-[11px] leading-6 text-muted-foreground">اینماد هنوز فعال نشده است.</p>
    </Card>
  );
}
