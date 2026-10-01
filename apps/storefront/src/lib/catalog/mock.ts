import type { HomepageCatalogQuery } from '@/generated/graphql';
const categories = [
  { id: 'tahini', slug: 'tahini', title: 'ارده', image: '/images/sesame-bowl.webp' },
  { id: 'halva', slug: 'halva', title: 'حلواارده', image: '/images/halva-category.webp' },
  { id: 'oil', slug: 'oil', title: 'روغن ارده', image: '/images/oil.webp' },
];
const items = [
  [
    'halva-500',
    'traditional-halva-500',
    'حلواارده سنتی',
    'halva',
    245000,
    '۵۰۰ گرم',
    'halva',
    'پرفروش',
  ],
  ['tahini-350', 'sesame-tahini-350', 'ارده کنجدی', 'tahini', 185000, '۳۵۰ گرم', 'tahini', null],
  ['oil-250', 'sesame-oil-250', 'روغن ارده', 'oil', 220000, '۲۵۰ میلی‌لیتر', 'oil', null],
  [
    'chocolate-500',
    'chocolate-halva-500',
    'حلواارده شکلاتی',
    'halva',
    275000,
    '۵۰۰ گرم',
    'chocolate',
    null,
  ],
  ['date-500', 'date-tahini-500', 'ارده با شیره خرما', 'tahini', 245000, '۵۰۰ گرم', 'date', null],
  [
    'premium-1000',
    'premium-tahini-1000',
    'ارده ممتاز',
    'tahini',
    480000,
    '۱ کیلوگرم',
    'premium',
    null,
  ],
] as const;
export const mockCatalog: HomepageCatalogQuery = {
  categories,
  products: items.map(([id, slug, title, category, price, weight, image, badge]) => ({
    id,
    slug,
    title,
    category: categories.find((item) => item.id === category)!,
    price,
    weight,
    badge,
    isActive: true,
    shortDescription: 'نمونه‌ای از فرآورده‌های کنجدی بهجتی',
    description:
      'اطلاعات و قیمت این محصول نمونه است و پیش از انتشار با اطلاعات تأییدشده جایگزین خواهد شد.',
    images: [{ id: `image-${id}`, url: `/images/${image}.webp`, alt: title }],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  })),
};
