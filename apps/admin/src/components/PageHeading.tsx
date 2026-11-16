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
      <span className="grid size-14 shrink-0 place-items-center rounded-[18px] border border-[#9dc5cc] bg-[linear-gradient(135deg,#a7d4db,#528b93)] text-[#1e3a5f] shadow-[0_6px_16px_#528b9326]">
        <AdminIcon name={icon} width={27} />
      </span>
      <div className="min-w-0">
        <h1 className="text-[23px] leading-normal font-extrabold sm:text-[27px]">{children}</h1>
        <p className="mt-2 text-sm leading-7 text-[#6b7481]">{description}</p>
      </div>
    </div>
  );
}
