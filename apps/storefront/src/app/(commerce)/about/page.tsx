import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getHomepageContent, getHomepageCatalog } from '@/lib/catalog/service';
import { absoluteUrl, BUSINESS, pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, organizationSchema } from '@/lib/structured-data';

export const metadata = pageMetadata({
  title: 'دربارهٔ سنتی بهجتی و راه‌های تماس',
  description:
    'معرفی سنتی بهجتی اردکان، محصولات کنجدی و سنتی، شمارهٔ تماس، اینستاگرام رسمی، مسیریابی و راه پشتیبانی سفارش‌ها.',
  path: '/about',
});

export default async function AboutPage() {
  const [content, { categories }] = await Promise.all([getHomepageContent(), getHomepageCatalog()]);
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(content.story.description),
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            url: absoluteUrl('/about'),
            name: 'دربارهٔ سنتی بهجتی',
            inLanguage: 'fa-IR',
            mainEntity: { '@id': absoluteUrl('/#organization') },
          },
          breadcrumbSchema([{ title: 'دربارهٔ ما', path: '/about' }]),
        ]}
      />
      <Breadcrumbs items={[{ title: 'دربارهٔ ما' }]} />
      <article className="mx-auto max-w-3xl space-y-6">
        <Card className="rounded-3xl p-5 sm:p-8">
          <h1 className="text-2xl font-extrabold text-earth sm:text-3xl">
            دربارهٔ سنتی بهجتی اردکان
          </h1>
          <p className="mt-4 leading-8 text-earth">
            سنتی بهجتی، برند محصولات کنجدی و سنتی در اردکانِ استان یزد است.
          </p>
          <h2 className="mt-6 text-xl font-bold">
            {content.story.title} {content.story.subtitle}
          </h2>
          <p className="mt-3 whitespace-pre-line leading-8 text-muted-foreground">
            {content.story.description}
          </p>
          <h2 className="mt-6 text-xl font-bold">محصولات سنتی بهجتی</h2>
          <ul className="mt-3 flex flex-wrap gap-3">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-primary hover:bg-primary/5"
                >
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="rounded-3xl p-5 sm:p-8">
          <h2 className="text-xl font-extrabold">راه‌های ارتباط با سنتی بهجتی</h2>
          <dl className="mt-4 space-y-4 leading-8">
            <div>
              <dt className="font-bold">شهر</dt>
              <dd>اردکان، استان یزد، ایران</dd>
            </div>
            <div>
              <dt className="font-bold">شمارهٔ تماس</dt>
              <dd>
                <a
                  className="inline-flex min-h-11 items-center text-primary underline underline-offset-4"
                  href={`tel:${BUSINESS.phone}`}
                  dir="ltr"
                >
                  ۰۹۱۳ ۱۵۶ ۴۸۷۶
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-bold">اینستاگرام رسمی</dt>
              <dd>
                <a
                  className="inline-flex min-h-11 items-center text-primary underline underline-offset-4"
                  href={BUSINESS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                >
                  @sonatibehjati.ir
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-bold">مسیریابی</dt>
              <dd>
                <a
                  className="inline-flex min-h-11 items-center text-primary underline underline-offset-4"
                  href={BUSINESS.map}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  مشاهدهٔ موقعیت در نشان
                </a>
              </dd>
            </div>
          </dl>
          <p className="mt-4 leading-8 text-muted-foreground">
            برای پرسش دربارهٔ محصولات یا پیگیری سفارش، از بخش پشتیبانی تیکت ثبت کنید.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/support">تماس با پشتیبانی</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/faq">پرسش‌های متداول خرید</Link>
            </Button>
          </div>
        </Card>
      </article>
    </>
  );
}
