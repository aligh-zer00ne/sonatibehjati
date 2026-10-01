import type { SesameMotifKind } from '@/components/decoration/sesame-motif';

export function productMotif(product: {
  title: string;
  category: { slug: string; title: string };
}): SesameMotifKind {
  const title = product.title;
  const category = `${product.category.slug} ${product.category.title}`;
  if (title.includes('شکلات')) return 'chocolate';
  if (title.includes('خرما')) return 'date';
  if (title.includes('روغن') || /oil|روغن/.test(category)) return 'oil';
  if (title.includes('حلوا') || /halva|حلوا/.test(category)) return 'halva';
  if (title.includes('ارده') || /tahini|ارده/.test(category)) return 'tahini';
  return 'seeds';
}
