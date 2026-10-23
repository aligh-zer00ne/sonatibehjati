import type { ReactNode } from 'react';
import AdminIcon, { type AdminIconName } from './AdminIcon';
export default function PageHeading({
  children,
  icon,
  description,
}: {
  children: ReactNode;
  icon: AdminIconName;
  description: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <span className="grid size-14 shrink-0 place-items-center rounded-[18px] border border-[#e7ce96] bg-[linear-gradient(135deg,#f6dfa0,#c49536)] text-[#4e141c] shadow-[0_6px_16px_#c4953626]">
        <AdminIcon name={icon} width={27} />
      </span>
      <div className="min-w-0">
        <h1 className="text-[23px] leading-normal font-extrabold sm:text-[27px]">{children}</h1>
        <p className="mt-2 text-sm leading-7 text-[#857467]">{description}</p>
      </div>
    </div>
  );
}
