import Link from 'next/link';
import { Search } from 'lucide-react';
import { getCatalogPage } from '@/lib/catalog/service';
import { parseCatalogParams, type CatalogParams } from '@/lib/catalog/params';
import { formatNumber } from '@behjati/shared';
import ProductGrid from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import CategoryChips from './CategoryChips';
import CatalogControls from './CatalogControls';
import CatalogResults from './CatalogResults';
import CatalogPagination from './CatalogPagination';
export default async function CatalogPage({
  path,
  params,
  title = 'تمام محصولات',
  category,
}: {
  path: string;
  params: CatalogParams;
  title?: string;
  category?: string;
}) {
  const parsed = parseCatalogParams(params, category);
  const filters = parsed.success ? parsed.data : undefined;
  const { catalog, categories } = await getCatalogPage(filters ?? {});
  const effectiveParams = category ? { ...params, category: undefined } : params;
  return (
    <>
      <Breadcrumbs
        items={[
          { title: 'فروشگاه', href: path === '/shop' ? undefined : '/shop' },
          ...(path === '/shop' ? [] : [{ title }]),
        ]}
      />
      <CatalogControls path={path} params={effectiveParams} />
      <CategoryChips categories={categories} current={category ?? filters?.category} />
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-lg font-extrabold md:text-2xl">{title}</h1>
        <span className="text-xs text-muted-foreground">
          {formatNumber(parsed.success ? catalog.total : 0)} محصول
        </span>
      </div>
      {!parsed.success ? (
        <EmptyState
          title="فیلتر معتبر نیست"
          description="بازهٔ قیمت، شمارهٔ صفحه یا نوع مرتب‌سازی را بررسی کنید."
          icon={<Search size={36} />}
        >
          <Button asChild>
            <Link href={path}>پاک کردن فیلترها</Link>
          </Button>
        </EmptyState>
      ) : (
        <CatalogResults count={catalog.items.length}>
          {catalog.items.length ? (
            <ProductGrid products={catalog.items} />
          ) : (
            <EmptyState
              title="محصولی پیدا نشد"
              description="عبارت جستجو یا بازهٔ قیمت را تغییر دهید."
              icon={<Search size={36} />}
            >
              <Button asChild>
                <Link href={path}>نمایش محصولات</Link>
              </Button>
            </EmptyState>
          )}
        </CatalogResults>
      )}
      {parsed.success && (
        <CatalogPagination
          path={path}
          params={effectiveParams}
          page={catalog.page}
          totalPages={catalog.totalPages}
        />
      )}
    </>
  );
}
