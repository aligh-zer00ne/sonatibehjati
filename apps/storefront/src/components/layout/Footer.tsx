import Image from 'next/image';
import { BRAND_NAME } from '@behjati/shared';
import { ArrowLeft } from 'lucide-react';
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image src="/images/logo.webp" alt={BRAND_NAME} width={68} height={88} />
          <h2>{BRAND_NAME}</h2>
          <p>
            ارده، حلواارده و فرآورده‌های کنجدی؛
            <br />
            روایتی از طعم و فرهنگ اردکان.
          </p>
        </div>
        <div>
          <h3>همراه بهجتی</h3>
          <a href="#products">
            محصولات <ArrowLeft size={15} />
          </a>
          <a href="#categories">دسته‌بندی محصولات</a>
          <a href="#story">داستان بهجتی</a>
          <a href="#ardakan">درباره اردکان</a>
        </div>
        <div>
          <h3>پیش از سفارش</h3>
          <p>
            این نسخه در مرحلهٔ توسعه است. محصولات و قیمت‌ها نمونه‌اند و امکان ثبت سفارش هنوز فعال
            نیست.
          </p>
          <a href="/images/logo-original.pdf" target="_blank" rel="noreferrer">
            مشاهده نشان رسمی برند
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>{BRAND_NAME}</span>
        <span>با الهام از خاک، آفتاب و کنجد</span>
      </div>
    </footer>
  );
}
