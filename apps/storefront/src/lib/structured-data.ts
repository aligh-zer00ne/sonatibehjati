import type { CatalogProductFragment } from '../generated/graphql';
import { productPhotoUrl } from './product-photo';
import { absoluteUrl, BRAND_ALTERNATE_NAMES, BUSINESS, productPath, SITE_DESCRIPTION } from './seo';

export function organizationSchema(description = SITE_DESCRIPTION) {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': absoluteUrl('/#organization'),
    name: BUSINESS.name,
    alternateName: BRAND_ALTERNATE_NAMES,
    url: absoluteUrl('/'),
    logo: absoluteUrl(BUSINESS.logo),
    description,
    telephone: BUSINESS.phone,
    sameAs: [BUSINESS.instagram],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'اردکان',
      addressRegion: 'یزد',
      addressCountry: 'IR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS.phone,
      contactType: 'customer support',
      availableLanguage: 'fa',
      url: absoluteUrl('/support'),
    },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    url: absoluteUrl('/'),
    name: BUSINESS.name,
    alternateName: BRAND_ALTERNATE_NAMES,
    inLanguage: 'fa-IR',
    publisher: { '@id': absoluteUrl('/#organization') },
  };
}

export function breadcrumbSchema(items: { title: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ title: 'خانه', path: '/' }, ...items].map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productSchema(product: CatalogProductFragment, now = Date.now()) {
  const promotion = product.promotion;
  const active =
    promotion && Date.parse(promotion.startsAt) <= now && now < Date.parse(promotion.endsAt);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': absoluteUrl(`${productPath(product.slug)}#product`),
    url: absoluteUrl(productPath(product.slug)),
    name: product.title,
    description: product.shortDescription,
    image: product.images.map((image) => absoluteUrl(productPhotoUrl(image.url))),
    sku: product.id,
    category: product.category.title,
    brand: { '@type': 'Brand', name: BUSINESS.name },
    additionalProperty: { '@type': 'PropertyValue', name: 'وزن / حجم', value: product.weight },
    // Catalog prices are toman. IRR is the ISO currency used by search engines.
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(productPath(product.slug)),
      priceCurrency: 'IRR',
      price: (active ? promotion.price : product.price) * 10,
      ...(active
        ? { priceValidUntil: new Date(promotion.endsAt).toISOString().split('T')[0] }
        : {}),
      seller: { '@id': absoluteUrl('/#organization') },
    },
  };
}

export function collectionSchema(path: string, title: string, products: CatalogProductFragment[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: absoluteUrl(path),
    name: title,
    inLanguage: 'fa-IR',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: product.title,
        url: absoluteUrl(productPath(product.slug)),
      })),
    },
  };
}
