import Image from 'next/image';
import { BRAND_NAME } from '@behjati/shared';
import { ArrowLeft } from 'lucide-react';
export default function Footer() {
  return (
    <footer className="border-t border-border bg-[#f0e4d1] pt-9 pb-[100px] md:pb-[35px]">
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[480px]:px-6 xl:px-0 grid gap-7 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10 xl:pt-2.5">
        <div>
          <Image
            className="h-20 w-[60px] object-contain mix-blend-multiply"
            src="/images/logo-brand.png"
            alt={BRAND_NAME}
            width={68}
            height={88}
          />
          <h2 className="my-2 text-[17px] font-[750]">{BRAND_NAME}</h2>
          <p className="max-w-[340px] text-xs leading-6 text-muted-foreground">
            ارده، حلواارده و فرآورده‌های کنجدی؛
            <br />
            روایتی از طعم و فرهنگ اردکان.
          </p>
        </div>
        <div>
          <h3 className="mb-2.5 text-[15px] font-[750]">همراه سنتی بهجتی</h3>
          <a className="flex min-h-11 items-center gap-2 text-xs text-earth" href="#products">
            محصولات <ArrowLeft size={15} />
          </a>
          <a className="flex min-h-11 items-center gap-2 text-xs text-earth" href="#categories">
            دسته‌بندی محصولات
          </a>
          <a className="flex min-h-11 items-center gap-2 text-xs text-earth" href="#story">
            داستان سنتی بهجتی
          </a>
          <a className="flex min-h-11 items-center gap-2 text-xs text-earth" href="#ardakan">
            درباره اردکان
          </a>
        </div>
        <div>
          <h3 className="mb-2.5 text-[15px] font-[750]">پیش از سفارش</h3>
          <p className="max-w-[340px] text-xs leading-6 text-muted-foreground">
            این نسخه در مرحلهٔ توسعه است. محصولات و قیمت‌ها نمونه‌اند و امکان ثبت سفارش هنوز فعال
            نیست.
          </p>
          <a
            className="flex min-h-11 items-center gap-2 text-xs text-earth"
            href="/images/logo-brand.png"
            target="_blank"
            rel="noreferrer"
          >
            مشاهده نشان رسمی برند
          </a>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[480px]:px-6 xl:px-0 mt-7 flex flex-col gap-[5px] border-t border-border pt-5 text-[10px] text-muted-foreground md:flex-row md:justify-between">
        <span>{BRAND_NAME}</span>
        <span>با الهام از خاک، آفتاب و کنجد</span>
      </div>
    </footer>
  );
}
