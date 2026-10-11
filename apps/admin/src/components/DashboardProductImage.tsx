import { useState } from 'react';
import { productPhotoUrl } from '@behjati/shared/photo-catalog';

export default function DashboardProductImage({
  src,
  title,
}: {
  src?: string | null;
  title: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  return (
    <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#eee3d5] bg-[#fffcf7]">
      {src && src !== failedSource ? (
        <img
          key={src}
          src={productPhotoUrl(src)}
          alt={title}
          className="h-full w-full object-contain"
          onError={() => setFailedSource(src)}
        />
      ) : (
        <span className="px-1 text-center text-[9px] leading-4 text-[#8c8176]">
          {src ? 'تصویر در دسترس نیست' : 'تصویر ثبت نشده'}
        </span>
      )}
    </div>
  );
}
