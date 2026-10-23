import { useId, type ReactNode } from 'react';
/** Wrapped tabs keep every editor section reachable on narrow RTL screens. Panels stay mounted. */
export default function CompactTabs({
  activeKey,
  onChange,
  items,
}: {
  activeKey: string;
  onChange: (key: string) => void;
  items: { key: string; label: ReactNode; children: ReactNode; forceRender?: boolean }[];
}) {
  const id = useId();
  return (
    <>
      <div
        role="tablist"
        aria-label="بخش‌های ویرایش محصول"
        className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-[#f6f0e6] p-2 sm:grid-cols-4"
      >
        {items.map((item, index) => (
          <button
            type="button"
            role="tab"
            id={`${id}-${item.key}-tab`}
            aria-controls={`${id}-${item.key}-panel`}
            aria-selected={item.key === activeKey}
            tabIndex={item.key === activeKey ? 0 : -1}
            key={item.key}
            onClick={() => onChange(item.key)}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? items.length - 1
                    : (index + (event.key === 'ArrowLeft' ? 1 : -1) + items.length) % items.length;
              const key = items[next]!.key;
              onChange(key);
              requestAnimationFrame(() => document.getElementById(`${id}-${key}-tab`)?.focus());
            }}
            className="min-h-12 cursor-pointer rounded-xl border border-transparent px-2 text-sm font-bold text-[#796653] transition-colors aria-selected:border-[#e2cc9e] aria-selected:bg-white aria-selected:text-[#701e2a] aria-selected:shadow-sm hover:bg-white/70"
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.key}
          id={`${id}-${item.key}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-${item.key}-tab`}
          hidden={activeKey !== item.key}
        >
          {item.children}
        </div>
      ))}
    </>
  );
}
