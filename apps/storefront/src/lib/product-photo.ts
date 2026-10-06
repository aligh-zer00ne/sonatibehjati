import { photoGallery, photoProducts } from '@behjati/shared/photo-catalog';

const managedPhotos = new Set(
  photoProducts.flatMap((product) => photoGallery(product).map((image) => image.url)),
);

// Version only the bundled catalog photos; preserve administrator-uploaded URLs.
export function productPhotoUrl(url: string) {
  return managedPhotos.has(url) ? `${url}?v=styled-3` : url;
}
