import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Card } from '@/components/ui/card';
import JsonLd from '@/components/seo/JsonLd';
import { buyingFaq } from '@/lib/buying-faq';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/structured-data';

export const metadata = pageMetadata({
  title: 'پرسش‌های متداول خرید',
  description:
    'پاسخ به پرسش‌های خرید از سنتی بهجتی؛ مشاهدهٔ مشخصات و قیمت محصول، ثبت سفارش، درگاه پرداخت سامان و پیگیری سفارش از پشتیبانی.',
  path: '/faq',
});

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            url: absoluteUrl('/faq'),
            inLanguage: 'fa-IR',
            mainEntity: buyingFaq.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          },
          breadcrumbSchema([{ title: 'پرسش‌های متداول', path: '/faq' }]),
        ]}
      />
      <Breadcrumbs items={[{ title: 'پرسش‌های متداول' }]} />
      <article className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-extrabold text-earth sm:text-3xl">
          پرسش‌های متداول خرید از سنتی بهجتی
        </h1>
        <p className="mt-3 leading-8 text-muted-foreground">
          راهنمای انتخاب محصول، ثبت سفارش و ارتباط با پشتیبانی.
        </p>
        <div className="mt-6 space-y-4">
          {buyingFaq.map((item) => (
            <Card key={item.question} className="rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-bold leading-8">{item.question}</h2>
              <p className="mt-3 leading-8 text-muted-foreground">{item.answer}</p>
              <Link
                className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-primary underline underline-offset-4"
                href={item.href}
              >
                {item.action}
              </Link>
            </Card>
          ))}
        </div>
      </article>
    </>
  );
}
