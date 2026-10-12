import { z } from 'zod';
const image = z
  .string()
  .regex(
    /^\/(?:images\/[a-zA-Z0-9_./-]+\.(?:webp|png|jpg|jpeg|svg)|uploads\/products\/[a-f0-9-]{36}\.webp)$/,
    'تصویر معتبر انتخاب کنید.',
  )
  .max(300)
  .refine((value) => !value.includes('..'));
const link = z
  .string()
  .trim()
  .max(200)
  .regex(/^\/(?!\/)[^\s]*$/, 'پیوند باید از مسیرهای همین سایت باشد.');
export const heroSlideSchema = z.object({
  src: image,
  mobileSrc: image,
  alt: z.string().trim().min(1).max(200),
  label: z.string().trim().min(1).max(60),
  eyebrow: z.string().trim().max(80),
  title: z.string().trim().min(1).max(60),
  subtitle: z.string().trim().max(100),
  description: z.string().trim().max(400),
  href: link,
  action: z.string().trim().min(1).max(60),
  mobileAction: z.string().trim().min(1).max(60),
});
export const storySchema = z.object({
  src: image,
  mobileSrc: image,
  alt: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(100),
  subtitle: z.string().trim().max(100),
  description: z.string().trim().min(1).max(1500),
  action: z.string().trim().min(1).max(60),
  mobileAction: z.string().trim().min(1).max(60),
  href: link,
  location: z.string().trim().max(100),
});
export const homepageSchema = z.object({
  slides: z.array(heroSlideSchema).min(1).max(8),
  story: storySchema,
});
export type HeroSlide = z.infer<typeof heroSlideSchema>;
export type BrandStoryContent = z.infer<typeof storySchema>;
export type HomepageValues = z.infer<typeof homepageSchema>;
const defaultSlides = [
  {
    src: '/images/home/hero-tahini-desktop-v6.webp',
    mobileSrc: '/images/home/hero-tahini-mobile-v6.webp',
    alt: 'اردهٔ روان سنتی بهجتی در کاسه، کنار بسته‌بندی‌های واقعی روی میز چوبی و پارچهٔ ترمه',
    label: 'ارده ممتاز',
    eyebrow: 'فرآورده‌های کنجدی اردکان',
    title: 'سنتی بهجتی',
    subtitle: 'طعم اصالت، از دل کویر',
    description: 'ارده، حلواارده و طعم‌های کنجدی؛ همراه صبحانه و سفرهٔ هر روز شما.',
    href: '/shop',
    action: 'مشاهده محصولات',
    mobileAction: 'دیدن محصولات',
  },
  {
    src: '/images/home/hero-oil-desktop-v6.webp',
    mobileSrc: '/images/home/hero-oil-mobile-v6.webp',
    alt: 'بسته‌بندی‌های واقعی روغن کنجد سنتی بهجتی با رنگ طلایی و نور طبیعی',
    label: 'روغن کنجد',
    eyebrow: 'روغن کنجد سنتی بهجتی',
    title: 'طلای کنجد',
    subtitle: 'برای آشپزخانهٔ شما',
    description: 'روغن‌های کنجد را ببینید و بسته‌بندی مناسب آشپزخانهٔ خود را انتخاب کنید.',
    href: '/category/oil',
    action: 'مشاهده روغن‌های کنجد',
    mobileAction: 'دیدن روغن‌ها',
  },
  {
    src: '/images/home/hero-flavored-desktop-v6.webp',
    mobileSrc: '/images/home/hero-flavored-mobile-v6.webp',
    alt: 'ارده شکلاتی، کرم ارده و ارده فندقی سنتی بهجتی در فضایی گرم و سنتی',
    label: 'ارده‌های طعم‌دار',
    eyebrow: 'طعم‌های تازهٔ سنتی بهجتی',
    title: 'طعم‌های تازه',
    subtitle: 'شکلاتی، فندقی یا کرم ارده؟',
    description: 'از میان طعم‌های مختلف ارده، همراه تازهٔ صبحانه‌تان را پیدا کنید.',
    href: '/category/tahini',
    action: 'کشف ارده‌های طعم‌دار',
    mobileAction: 'کشف طعم‌ها',
  },
];
export const defaultHomepage: HomepageValues = {
  slides: defaultSlides,
  story: {
    src: '/images/home/story-desktop-v6.webp',
    mobileSrc: '/images/home/story-mobile-v6.webp',
    alt: 'بادگیر و بام‌های خشتی اردکان در نور عصر، با سفره‌ای از ارده و کنجد در پیش‌زمینه',
    title: 'از دل اردکان',
    subtitle: 'تا سفرهٔ شما',
    description:
      'تولیدی محصولات سنتی بهجتی اردکان با بیش از ۱۰ سال سابقه، به دنبال حفظ طعم اصیل و کیفیت ماندگار است. با مواد اولیهٔ مرغوب، طعم سنتی اردکان را به سفرهٔ شما می‌رسانیم.',
    action: 'آشنایی با محصولات',
    mobileAction: 'محصولات ما',
    href: '/shop',
    location: 'اردکان، شهر بادگیرها',
  },
};
