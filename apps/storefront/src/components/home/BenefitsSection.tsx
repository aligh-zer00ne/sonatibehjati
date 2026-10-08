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
      className="my-4 grid grid-cols-4 gap-1.5 rounded-2xl border border-[#d5ba91]/45 bg-[#f7eddf]/85 px-1 py-4 text-center shadow-sm min-[480px]:gap-3 md:my-7 md:px-5 md:py-5"
      aria-label="آشنایی با سنتی بهجتی"
    >
      {benefits.map(({ icon: Icon, title, text }) => (
        <div key={title} className="group/benefit">
          <span className="mb-1.5 inline-grid size-9 place-items-center rounded-full border border-[#e9cda8] bg-[#f5e7d1] text-[#a5652e] transition-[translate,rotate,background-color,box-shadow] duration-500 ease-out group-hover/benefit:bg-sesame/60 group-hover/benefit:shadow-[0_8px_18px_rgba(98,69,47,0.12)] motion-safe:group-hover/benefit:-translate-y-1 motion-safe:group-hover/benefit:-rotate-6 motion-reduce:transition-none md:mb-2.5 md:size-[52px]">
            <Icon className="size-5 md:size-[25px]" />
          </span>
          <h3 className="text-[9px] leading-4 font-[750] min-[480px]:text-[11px] md:text-[13px] lg:text-base">{title}</h3>
          <p className="mt-1 hidden text-[11px] text-muted-foreground md:block lg:text-xs">{text}</p>
        </div>
      ))}
    </section>
  );
}
