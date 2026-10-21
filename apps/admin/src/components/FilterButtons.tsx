import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react';
import { Popover } from 'antd';
import AdminIcon from './AdminIcon';

const BarContext = createContext<{
  openId: string | null;
  setOpenId: Dispatch<SetStateAction<string | null>>;
} | null>(null);
const MenuContext = createContext<(() => void) | null>(null);

export function FilterBar({
  children,
  label = 'فیلترها',
}: {
  children: ReactNode;
  label?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <BarContext.Provider value={{ openId, setOpenId }}>
      <section
        aria-label={label}
        data-admin-filter-bar
        className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 rounded-xl border border-[#e8ded1] bg-white px-2 py-2 sm:px-3"
      >
        <span className="me-1 flex items-center gap-1.5 border-e border-[#e8ded1] pe-3 text-[13px] font-semibold text-[#76685d]">
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          >
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          فیلترها
        </span>
        {children}
      </section>
    </BarContext.Provider>
  );
}

export function FilterButton({
  label,
  active = false,
  children,
}: {
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  const compactLabel = label.startsWith('جستجو')
    ? 'جستجو'
    : label.startsWith('مرتب‌سازی')
      ? 'مرتب‌سازی'
      : label.startsWith('وضعیت')
        ? 'وضعیت'
        : label === 'محل خرید مشتری'
          ? 'محل خرید'
          : label;
  const id = useId();
  const bar = useContext(BarContext);
  const [localOpen, setLocalOpen] = useState(false);
  const open = bar ? bar.openId === id : localOpen;
  const trigger = useRef<HTMLButtonElement>(null);
  const keyboard = useRef(false);
  function changeOpen(next: boolean) {
    if (bar) bar.setOpenId((current) => (next ? id : current === id ? null : current));
    else setLocalOpen(next);
  }
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        if (bar) bar.setOpenId(null);
        else setLocalOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open, bar]);
  return (
    <Popover
      trigger={['hover', 'click']}
      open={open}
      onOpenChange={changeOpen}
      mouseEnterDelay={0.12}
      mouseLeaveDelay={0.2}
      placement="bottomRight"
      align={{ overflow: { adjustX: true, adjustY: true, shiftX: 8, shiftY: true } }}
      arrow={false}
      classNames={{
        container:
          '!rounded-xl !border !border-[#e8ded1] !p-0 !shadow-[0_8px_28px_rgba(52,37,30,0.12)]',
      }}
      afterOpenChange={(visible) => {
        if (visible && keyboard.current) {
          keyboard.current = false;
          const panel = document.getElementById(`${id}-panel`);
          (
            panel?.querySelector<HTMLElement>('[role="group"] button,input,[role="combobox"]') ??
            panel?.querySelector<HTMLElement>('button')
          )?.focus();
        }
      }}
      content={
        <MenuContext.Provider value={() => changeOpen(false)}>
          <div
            id={`${id}-panel`}
            role="region"
            aria-label={label}
            data-admin-filter-panel
            className="w-[min(268px,calc(100vw-40px))] p-2 text-[13px]"
            onBlur={(event) => {
              if (
                event.relatedTarget &&
                !event.currentTarget.contains(event.relatedTarget) &&
                !trigger.current?.contains(event.relatedTarget)
              )
                changeOpen(false);
            }}
          >
            <div className="mb-1 flex items-center justify-between gap-2 border-b border-[#eee5d9] pb-1 ps-2">
              <span className="font-semibold text-[#62452f]">{label}</span>
              <button
                type="button"
                aria-label="بستن فیلتر"
                onClick={() => {
                  changeOpen(false);
                  trigger.current?.focus();
                }}
                className="grid size-8 cursor-pointer place-items-center rounded-lg text-[#76685d] hover:bg-[#fcf9f3] [@media(pointer:coarse)]:size-10"
              >
                <AdminIcon name="close" width={15} height={15} />
              </button>
            </div>
            <div className="space-y-2 [&_.ant-input-search-button]:!px-2 [&_.ant-select]:w-full [&_label]:text-[13px]">
              {children}
            </div>
          </div>
        </MenuContext.Provider>
      }
    >
      <button
        ref={trigger}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onKeyDown={(event) => {
          if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
            event.preventDefault();
            keyboard.current = true;
            changeOpen(true);
          }
        }}
        className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-colors motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 ${active ? 'bg-[#fcf4e9] text-[#96140d]' : open ? 'bg-[#f7f4ef] text-[#34251e]' : 'text-[#624f42] hover:bg-[#f7f4ef]'}`}
      >
        {active && <span aria-hidden="true" className="size-1.5 rounded-full bg-[#96140d]" />}
        <span className="sm:hidden">{compactLabel}</span>
        <span className="hidden sm:inline">{label}</span>
        <AdminIcon
          name="chevron"
          width={13}
          height={13}
          className={`shrink-0 text-[#958477] transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        />
      </button>
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
  const close = useContext(MenuContext);
  return (
    <div
      role="group"
      aria-label={label}
      className={
        close
          ? 'flex max-h-[min(360px,50dvh)] flex-col gap-0.5 overflow-y-auto overscroll-contain'
          : 'flex flex-wrap gap-1'
      }
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => {
            onChange(option.value);
            close?.();
          }}
          className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-start text-[13px] font-medium transition-colors motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 ${value === option.value ? 'bg-[#fcf4e9] text-[#96140d]' : 'text-[#624f42] hover:bg-[#f7f4ef]'} ${close ? 'w-full' : 'border border-[#e8ded1]'}`}
        >
          <span
            aria-hidden="true"
            className={`grid size-4 shrink-0 place-items-center rounded border ${value === option.value ? 'border-[#96140d] bg-[#96140d] text-white' : 'border-[#d7cfc5] bg-white'}`}
          >
            {value === option.value && (
              <svg
                width="11"
                height="11"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m3 8 3 3 7-7" />
              </svg>
            )}
          </span>
          <span className="min-w-0 break-words">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
