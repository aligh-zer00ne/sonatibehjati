import type { ReactNode } from 'react';
export function EmptyState({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="px-[18px] py-9 text-center">
      {icon && <span className="mx-auto mb-[15px] flex w-fit text-clay">{icon}</span>}
      <h3 className="mb-2.5 text-[19px] font-[750]">{title}</h3>
      <p className="text-[13px] leading-8 text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
