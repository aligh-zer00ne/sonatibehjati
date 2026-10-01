import { PackageCheck, Truck, HeartHandshake, Sprout } from 'lucide-react';
const benefits = [
  { icon: Sprout, title: 'دنیای کنجد', text: 'ارده و فرآورده‌های کنجدی' },
  { icon: PackageCheck, title: 'انتخاب آسان', text: 'اطلاعات روشن محصولات' },
  { icon: Truck, title: 'همراه سفرهٔ شما', text: 'از اردکان تا خانهٔ شما' },
  { icon: HeartHandshake, title: 'ارتباط با بهجتی', text: 'داستانی از طعم و فرهنگ' },
];
export default function BenefitsSection() {
  return (
    <section className="benefits" aria-label="آشنایی با بهجتی">
      {benefits.map(({ icon: Icon, title, text }) => (
        <div key={title}>
          <span>
            <Icon size={25} />
          </span>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      ))}
    </section>
  );
}
