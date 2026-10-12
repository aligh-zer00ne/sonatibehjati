export const BRAND_QR_URL = 'https://sonatibehjati.ir/QR';

export default function BrandQr({ className = '' }: { className?: string }) {
  return (
    <a
      href={BRAND_QR_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`block shrink-0 ${className}`}
    >
      <img
        data-brand-qr
        src="/images/brand-qr.svg"
        alt="QR سنتی بهجتی؛ اسکن برای مشاهده راه‌های ارتباطی"
        width={720}
        height={720}
        className="block aspect-square h-auto w-full"
      />
    </a>
  );
}
