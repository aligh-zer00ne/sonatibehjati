import { ShoppingCart, MapPin, CreditCard, PackageCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
const steps = [
  { icon: ShoppingCart, title: 'سبد خرید', text: 'انتخاب محصول و تعداد' },
  { icon: MapPin, title: 'اطلاعات ارسال', text: 'آدرس و مشخصات تحویل' },
  { icon: CreditCard, title: 'پرداخت', text: 'بررسی مبلغ سفارش' },
  { icon: PackageCheck, title: 'ثبت سفارش', text: 'دریافت اطلاعات پیگیری' },
];
export default function PurchaseJourney() {
  return (
    <Card className="mt-10 overflow-hidden rounded-3xl border-clay/15 bg-[linear-gradient(120deg,#f9f0e2,#fdf9f1)] px-3 py-6 sm:px-7 sm:py-8">
      <h2 className="mb-6 text-center text-sm font-bold text-earth">از انتخاب تا ثبت سفارش</h2>
      <ol className="grid grid-cols-2 gap-y-7 sm:grid-cols-4">
        {steps.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className="relative px-2 text-center">
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute top-6 right-[calc(50%+28px)] hidden h-px w-[calc(100%-56px)] bg-clay/25 sm:block"
              />
            )}
            <span className="relative mx-auto grid size-12 place-items-center rounded-full border border-clay/20 bg-background text-primary shadow-[0_4px_12px_rgba(98,69,47,0.06)]">
              <Icon size={23} strokeWidth={1.8} aria-hidden />
            </span>
            <p className="mt-3 text-sm font-bold text-earth">{title}</p>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{text}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
