import { ArrowLeft } from 'lucide-react';
export default function SectionHeading({
  title,
  href,
  label = 'مشاهده همه',
}: {
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="mb-[18px] flex items-center justify-between gap-3">
      <h2 className="text-[21px] font-extrabold min-[480px]:text-2xl lg:text-[27px]">{title}</h2>
      {href && (
        <a
          className="flex min-h-11 items-center gap-[5px] text-[11px] whitespace-nowrap text-[#94602c]"
          href={href}
        >
          {label}
          <ArrowLeft size={16} />
        </a>
      )}
    </div>
  );
}
