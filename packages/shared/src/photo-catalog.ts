/** Real product photographs; prices and weights are temporary development values. */
export const photoCategories = [
  { slug: 'tahini', title: 'ارده', image: '/images/products/tahini-blue.webp' },
  { slug: 'halva', title: 'حلواارده', image: '/images/products/halva-classic.webp' },
  { slug: 'oil', title: 'روغن کنجد', image: '/images/products/sesame-oil-glass.webp' },
  { slug: 'sweets', title: 'شیرینی ارده‌ای', image: '/images/products/tahini-sweets.webp' },
  { slug: 'sesame', title: 'کنجد', image: '/images/products/sesame-seeds.webp' },
] as const;

export const photoProducts = [
  {
    id: 'halva-500',
    slug: 'traditional-halva-500',
    title: 'حلواارده سنتی',
    category: 'halva',
    price: 245000,
    weight: '۵۰۰ گرم',
    photo: 'halva-classic',
    badge: 'پرفروش',
  },
  {
    id: 'tahini-350',
    slug: 'sesame-tahini-350',
    title: 'ارده کنجدی',
    category: 'tahini',
    price: 185000,
    weight: '۳۵۰ گرم',
    photo: 'tahini-blue',
    badge: null,
  },
  {
    id: 'oil-250',
    slug: 'sesame-oil-250',
    title: 'روغن کنجد',
    category: 'oil',
    price: 220000,
    weight: '۲۵۰ میلی‌لیتر',
    photo: 'sesame-oil-glass',
    badge: null,
  },
  {
    id: 'premium-1000',
    slug: 'premium-tahini-1000',
    title: 'ارده ممتاز',
    category: 'tahini',
    price: 480000,
    weight: '۱ کیلوگرم',
    photo: 'premium-tahini',
    badge: null,
  },
  {
    id: 'chocolate-tahini-350',
    slug: 'chocolate-tahini-350',
    title: 'ارده شکلاتی',
    category: 'tahini',
    price: 230000,
    weight: '۳۵۰ گرم',
    photo: 'chocolate-tahini',
    badge: null,
  },
  {
    id: 'hazelnut-tahini-350',
    slug: 'hazelnut-tahini-350',
    title: 'ارده فندقی',
    category: 'tahini',
    price: 250000,
    weight: '۳۵۰ گرم',
    photo: 'hazelnut-tahini',
    badge: null,
  },
  {
    id: 'tahini-cream-350',
    slug: 'tahini-cream-350',
    title: 'کرم ارده',
    category: 'tahini',
    price: 225000,
    weight: '۳۵۰ گرم',
    photo: 'tahini-cream',
    badge: null,
  },
  {
    id: 'pistachio-halva-500',
    slug: 'pistachio-halva-500',
    title: 'حلواارده پسته‌ای',
    category: 'halva',
    price: 350000,
    weight: '۵۰۰ گرم',
    photo: 'pistachio-halva',
    badge: null,
  },
  {
    id: 'tahini-sweets-500',
    slug: 'tahini-sweets-500',
    title: 'شیرینی ارده‌ای',
    category: 'sweets',
    price: 280000,
    weight: '۵۰۰ گرم',
    photo: 'tahini-sweets',
    badge: null,
  },
  {
    id: 'sesame-seeds-500',
    slug: 'sesame-seeds-500',
    title: 'کنجد بسته‌بندی',
    category: 'sesame',
    price: 190000,
    weight: '۵۰۰ گرم',
    photo: 'sesame-seeds',
    badge: null,
  },
  {
    id: 'sesame-oil-1000',
    slug: 'sesame-oil-1000',
    title: 'روغن کنجد یک لیتری',
    category: 'oil',
    price: 690000,
    weight: '۱ لیتر',
    photo: 'sesame-oil-one-liter',
    badge: null,
  },
  {
    id: 'sesame-oil-2000',
    slug: 'sesame-oil-2000',
    title: 'روغن کنجد خانواده',
    category: 'oil',
    price: 1280000,
    weight: '۲ لیتر',
    photo: 'sesame-oil-family',
    badge: null,
  },
] as const;

export const temporaryPhotoDescription =
  'تصویر واقعی محصول سنتی بهجتی. وزن و قیمت این نسخه موقت‌اند و توسط مدیر فروشگاه اصلاح خواهند شد.';

export function photoGallery(product: (typeof photoProducts)[number]) {
  const images = [
    {
      url: `/images/products/${product.photo}.webp`,
      alt: `${product.title} سنتی بهجتی؛ نمای اصلی بسته‌بندی`,
    },
  ];
  if (product.photo !== 'tahini-cream')
    images.push({
      url: `/images/products/gallery/${product.photo}.webp`,
      alt: `${product.title} سنتی بهجتی؛ نمای دیگر محصول`,
    });
  return images;
}
