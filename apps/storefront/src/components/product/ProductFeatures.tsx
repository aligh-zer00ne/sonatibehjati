import { PackageCheck, Truck, Info } from 'lucide-react';
const features = [
  { icon: PackageCheck, title: 'وزن مشخص', text: 'مطابق اطلاعات محصول' },
  { icon: Truck, title: 'هزینهٔ ارسال', text: 'در مرحلهٔ ثبت سفارش' },
  { icon: Info, title: 'اطلاعات محصول', text: 'توضیحات و مشخصات' },
];
export default function ProductFeatures() {
  return (
    <div className="mt-5 grid grid-cols-3 gap-2">
      {features.map(({ icon: Icon, title, text }) => (
        <div key={title} className="rounded-xl bg-surface/70 px-2 py-4 text-center">
          <Icon className="mx-auto mb-2 text-[#a5652e]" size={24} />
          <p className="text-[11px] font-bold">{title}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{text}</p>
        </div>
      ))}
    </div>
  );
}
