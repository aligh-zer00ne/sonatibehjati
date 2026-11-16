import { useState } from 'react';
import { formatNumber } from '@behjati/shared';
import shapes from '../lib/iran-province-shapes.json';
import type { AdminOrdersMapQuery } from '../generated/graphql';
type Province = AdminOrdersMapQuery['adminOrdersMap']['provinces'][number];
export default function ProvinceOrderMap({
  provinces,
  selected,
  onSelect,
}: {
  provinces: Province[];
  selected: string;
  onSelect: (code: string) => void;
}) {
  const [hover, setHover] = useState('');
  const byCode = new Map(provinces.map((p) => [p.code, p]));
  const maximum = Math.max(1, ...provinces.map((p) => p.count));
  const current = byCode.get(hover || selected);
  return (
    <div
      data-order-province-map
      className="relative isolate overflow-hidden rounded-[20px] border border-[#d7dce2] bg-[radial-gradient(ellipse_at_top,#fbfbfc,#e2e6eb)]"
    >
      <svg
        viewBox="0 0 1200 1070.6"
        role="group"
        aria-label="تراکم سفارش‌ها در استان‌های ایران"
        className="mx-auto block max-h-[560px] w-full px-3 py-5 sm:px-8"
      >
        {shapes.map((shape) => {
          const province = byCode.get(shape.code);
          if (!province) return null;
          const level = Math.sqrt(province.count / maximum);
          const fill = province.count
            ? `rgb(${Math.round(219 - level * 175)},${Math.round(230 - level * 148)},${Math.round(241 - level * 111)})`
            : '#d7dbe0';
          const active = selected === province.code;
          return (
            <path
              key={shape.code}
              d={shape.path}
              data-province-code={shape.code}
              role="button"
              tabIndex={0}
              aria-label={`${province.name}: ${formatNumber(province.count)} سفارش`}
              aria-pressed={active}
              onClick={() => onSelect(province.code)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(province.code);
                }
              }}
              onPointerEnter={() => setHover(province.code)}
              onPointerLeave={() => setHover('')}
              onFocus={() => setHover(province.code)}
              onBlur={() => setHover('')}
              fill={fill}
              stroke={active ? '#4f8992' : '#f7f8fa'}
              strokeWidth={active ? 7 : 2}
              className="cursor-pointer outline-none transition-[fill] duration-200 hover:brightness-110 focus:stroke-[#4c8189] focus:[stroke-width:7] motion-reduce:transition-none"
            >
              <title>
                {province.name} · {formatNumber(province.count)} سفارش
              </title>
            </path>
          );
        })}
      </svg>
      <div
        role="status"
        className="pointer-events-none absolute top-3 right-3 rounded-2xl border border-[#d7dce2] bg-white/95 px-3 py-2 text-xs leading-6 shadow-sm sm:text-sm"
      >
        <strong className="block text-[#2c5282]">{current?.name || 'پراکندگی سفارش‌ها'}</strong>
        {current
          ? `${formatNumber(current.count)} سفارش · ${formatNumber(current.locatedCount)} دارای موقعیت`
          : 'استان را لمس یا انتخاب کنید'}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#d7dce2] bg-white/85 px-4 py-3 text-[13px] text-[#6b7481]">
        <span>رنگ پررنگ‌تر = سفارش بیشتر</span>
        <div className="flex items-center gap-2">
          <span>۰</span>
          <span className="h-2 w-20 rounded-full bg-[linear-gradient(to_left,#2c5282,#d7dbe0)]" />
          <span>{formatNumber(maximum)}</span>
        </div>
      </div>
    </div>
  );
}
