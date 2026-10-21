import { useState, type ReactNode } from 'react';
import { Button, Popover } from 'antd';
export function FilterButton({
  label,
  active = false,
  children,
}: {
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      title={label}
      content={
        <div className="w-[min(320px,calc(100vw-64px))] space-y-3">
          {children}
          <Button size="small" onClick={() => setOpen(false)}>
            بستن فیلتر
          </Button>
        </div>
      }
    >
      <Button
        aria-expanded={open}
        className={active ? '!border-[#96140d] !bg-[#f4e8d3] !text-[#76100b]' : ''}
      >
        {label}
        {active ? ' •' : ''}
      </Button>
    </Popover>
  );
}
export function FilterChips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Button
          key={o.value}
          aria-pressed={value === o.value}
          type={value === o.value ? 'primary' : 'default'}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}
