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
    <div className="section-heading">
      <h2>{title}</h2>
      {href && (
        <a href={href}>
          {label}
          <ArrowLeft size={16} />
        </a>
      )}
    </div>
  );
}
