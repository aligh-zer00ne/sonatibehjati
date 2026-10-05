import Link from 'next/link';
import Image from 'next/image';
import { BRAND_NAME } from '@behjati/shared';
import { ArrowLeft } from 'lucide-react';
import EnamadBadge from './EnamadBadge';
const links = [
  ['/shop', 'محصولات'],
  ['/shop#categories', 'دسته‌بندی محصولات'],
  ['/#story', 'داستان سنتی بهجتی'],
  ['/#ardakan', 'درباره اردکان'],
] as const;
export default function Footer() {
  return (
    <footer className="border-t border-border bg-[#f0e4d1]/85 pt-9 pb-[100px] text-center md:pb-[35px] md:text-right">
      <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 min-[480px]:px-6 sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1.2fr_0.9fr] md:gap-6 xl:px-0 xl:pt-2.5">
        <div className="flex flex-col items-center sm:col-span-2 md:col-span-1 md:items-start">
          <Image
            className="h-24 w-[74px] object-contain mix-blend-multiply"
            src="/images/logo-brand.png"
            alt={BRAND_NAME}
            width={74}
            height={96}
          />
          <h2 className="my-3 text-[17px] font-[750]">{BRAND_NAME}</h2>
          <p className="max-w-[340px] text-xs leading-6 text-muted-foreground">
            ارده، حلواارده و فرآورده‌های کنجدی؛
            <br />
            روایتی از طعم و فرهنگ اردکان.
          </p>
        </div>
        <nav aria-label="لینک‌های فوتر">
          <h3 className="mb-3 text-[15px] font-[750]">همراه سنتی بهجتی</h3>
          <div className="grid grid-cols-2 gap-x-3 sm:grid-cols-1">
            {links.map(([href, label]) => (
              <Link
                key={href}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg text-xs text-earth transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:justify-start"
                href={href}
              >
                {label} {href === '/shop' && <ArrowLeft size={15} aria-hidden="true" />}
              </Link>
            ))}
          </div>
        </nav>
        <div className="flex flex-col items-center md:items-start">
          <h3 className="mb-3 text-[15px] font-[750]">پیش از سفارش</h3>
          <p className="max-w-[340px] text-xs leading-6 text-muted-foreground">
            این نسخه در مرحلهٔ توسعه است و محصولات و قیمت‌ها نمونه‌اند. سفارش در انتظار پرداخت ثبت
            می‌شود؛ پرداخت آنلاین هنوز فعال نیست.
          </p>
          <Link
            className="mt-2 flex min-h-11 items-center justify-center gap-2 text-xs text-earth transition-colors hover:text-primary md:justify-start"
            href="/images/logo-brand.png"
            target="_blank"
            rel="noreferrer"
          >
            مشاهده نشان رسمی برند
          </Link>
        </div>
        <div className="sm:col-span-2 md:col-span-1">
          <EnamadBadge />
        </div>
      </div>
      <div className="mx-auto mt-8 flex w-full max-w-[1200px] flex-col items-center gap-2 border-t border-border px-4 pt-5 text-[10px] leading-6 text-muted-foreground min-[480px]:px-6 md:flex-row md:justify-between xl:px-0">
        <span>{BRAND_NAME}</span>
        <span>با الهام از خاک، آفتاب و کنجد</span>
      </div>
    </footer>
  );
}
