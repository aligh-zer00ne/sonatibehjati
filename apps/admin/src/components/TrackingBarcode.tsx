import { useMemo } from 'react';
import { code128, drawingSVG } from 'bwip-js/browser';

export default function TrackingBarcode({ value }: { value: string }) {
  const text = value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .trim();
  const source = useMemo(() => {
    if (
      !text ||
      text.length > 40 ||
      [...text].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) > 126)
    )
      return null;
    return (
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(
        code128(
          {
            bcid: 'code128',
            text,
            height: 10,
            scale: 2,
            paddingwidth: 10,
            includetext: false,
            backgroundcolor: 'FFFFFF',
          },
          drawingSVG(),
        ),
      )
    );
  }, [text]);
  return (
    <div className="min-w-0 text-center" dir="ltr">
      {source && (
        <img
          src={source}
          alt={`بارکد رهگیری ${text}`}
          className="mx-auto h-9 w-full object-fill print:h-[12mm]"
        />
      )}
      <p className="mt-1 break-all font-mono text-[0.85em]">{value}</p>
    </div>
  );
}
