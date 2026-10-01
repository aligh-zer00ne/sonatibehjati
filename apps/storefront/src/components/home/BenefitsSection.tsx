import { PackageCheck, Truck, HeartHandshake, Sprout } from 'lucide-react';
const benefits = [
  { icon: Sprout, title: 'دنیای کنجد', text: 'ارده و فرآورده‌های کنجدی' },
  { icon: PackageCheck, title: 'انتخاب آسان', text: 'اطلاعات روشن محصولات' },
  { icon: Truck, title: 'همراه سفرهٔ شما', text: 'از اردکان تا خانهٔ شما' },
  { icon: HeartHandshake, title: 'ارتباط با سنتی بهجتی', text: 'داستانی از طعم و فرهنگ' },
];
export default function BenefitsSection() {
  return (
    <section
      className="my-[38px] grid grid-cols-2 gap-x-3 gap-y-6 text-center md:my-14 md:grid-cols-4"
      aria-label="آشنایی با سنتی بهجتی"
    >
      {benefits.map(({ icon: Icon, title, text }) => (
        <div key={title}>
          <span className="mb-2.5 inline-grid size-[52px] place-items-center rounded-full border border-[#e9cda8] bg-[#f5e7d1] text-[#a5652e]">
            <Icon size={25} />
          </span>
          <h3 className="text-[13px] font-[750] lg:text-base">{title}</h3>
          <p className="mt-1 text-[11px] text-muted-foreground lg:text-xs">{text}</p>
        </div>
      ))}
    </section>
  );
}
