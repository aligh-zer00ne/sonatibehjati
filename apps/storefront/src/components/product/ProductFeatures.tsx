import { PackageCheck, Truck, Info, Headphones } from 'lucide-react';
const features = [
  { icon: PackageCheck, title: 'وزن مشخص', text: 'مطابق مشخصات محصول' },
  { icon: Truck, title: 'اطلاعات ارسال', text: 'در مرحلهٔ ثبت سفارش' },
  { icon: Info, title: 'انتخاب آگاهانه', text: 'توضیحات و مشخصات' },
  { icon: Headphones, title: 'ارتباط با ما', text: 'پاسخ به پرسش‌های شما' },
];
export default function ProductFeatures() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-y-5 border-t border-border/70 pt-6 sm:grid-cols-4">
      {features.map(({ icon: Icon, title, text }) => (
        <div
          key={title}
          className="px-1 text-center sm:border-l sm:border-border/60 sm:last:border-l-0"
        >
          <Icon className="mx-auto mb-2 text-clay" size={25} strokeWidth={1.7} aria-hidden />
          <p className="text-xs font-bold text-earth">{title}</p>
          <p className="mt-1 text-[10px] leading-5 text-muted-foreground">{text}</p>
        </div>
      ))}
    </div>
  );
}
