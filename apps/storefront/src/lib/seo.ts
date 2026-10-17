import type { Metadata } from 'next';
import { BRAND_NAME } from '@behjati/shared';
import type { CatalogParams } from './catalog/params';
import { parseCatalogParams } from './catalog/params';

// One stable public identity, including when the site is previewed on localhost.
export const SITE_URL = 'https://sonatibehjati.ir';
export const SITE_DESCRIPTION =
  'فروشگاه سنتی بهجتی اردکان؛ مشاهده و خرید ارده، حلواارده، روغن‌های خوراکی و محصولات سنتی، همراه با مشخصات و قیمت هر محصول.';
export const BUSINESS = {
  name: BRAND_NAME,
  phone: '+989131564876',
  instagram: 'https://www.instagram.com/sonatibehjati.ir/',
  map: 'https://nshn.ir/7f_bZEYENGX9qg',
  logo: '/images/logo-footer.svg',
};
export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;
export const productPath = (slug: string) => `/product/${encodeURIComponent(slug)}`;
export const categoryPath = (slug: string) => `/category/${encodeURIComponent(slug)}`;

export function indexingEnabled(env: NodeJS.ProcessEnv = process.env) {
  return (
    env.NODE_ENV === 'production' &&
    env.CATALOG_SOURCE === 'api' &&
    env.SEO_INDEXING_ENABLED !== 'false'
  );
}

export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  image = '/images/home/tahini-family.webp',
  index = true,
}: {
  title: string;
  description?: string;
  path: string;
  image?: string;
  index?: boolean;
}): Metadata {
  const indexable = indexingEnabled() && index;
  const fullTitle = `${title} | ${BRAND_NAME}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: {
      index: indexable,
      follow: true,
      googleBot: { index: indexable, follow: true, 'max-image-preview': 'large' },
    },
    openGraph: {
      type: 'website',
      siteName: BRAND_NAME,
      locale: 'fa_IR',
      url: absoluteUrl(path),
      title: fullTitle,
      description,
      images: [{ url: absoluteUrl(image), alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

// Keep real pagination discoverable; exclude search/sort/filter combinations.
export function catalogMetadata(
  path: string,
  title: string,
  params: CatalogParams,
  category?: string,
) {
  const parsed = parseCatalogParams(params, category);
  const filtered = ['q', 'sort', 'min', 'max', 'size', ...(category ? [] : ['category'])].some(
    (key) => Boolean(params[key]),
  );
  const page = parsed.success ? parsed.data.page : 1;
  const canonical = !filtered && page > 1 ? `${path}?page=${page}` : path;
  return pageMetadata({
    title: page > 1 ? `${title}؛ صفحهٔ ${page}` : title,
    description: `مشاهدهٔ ${title} سنتی بهجتی اردکان؛ مقایسهٔ مشخصات، وزن و قیمت محصولات و انتخاب محصول مناسب برای خرید.`,
    path: canonical,
    index: parsed.success && !filtered,
  });
}

export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
