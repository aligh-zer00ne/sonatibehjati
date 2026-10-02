'use client';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { catalogURL, type CatalogParams } from '@/lib/catalog/params';
import { formatNumber } from '@behjati/shared';
import { useCommerceNavigation } from './CommerceNavigation';
export default function CatalogPagination({
  path,
  params,
  page,
  totalPages,
}: {
  path: string;
  params: CatalogParams;
  page: number;
  totalPages: number;
}) {
  const { navigate, pending } = useCommerceNavigation();
  if (totalPages < 2) return null;
  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="صفحه‌بندی محصولات">
      {page > 1 ? (
        <Button variant="outline" size="icon" asChild>
          <Link
            aria-label="صفحهٔ قبل"
            href={catalogURL(path, params, { page: String(page - 1) })}
            onNavigate={(event) => {
              event.preventDefault();
              if (!pending) navigate(catalogURL(path, params, { page: String(page - 1) }));
            }}
          >
            <ArrowRight size={19} />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled aria-label="صفحهٔ قبل">
          <ArrowRight size={19} />
        </Button>
      )}
      <span className="text-xs">
        صفحهٔ {formatNumber(page)} از {formatNumber(totalPages)}
      </span>
      {page < totalPages ? (
        <Button variant="outline" size="icon" asChild>
          <Link
            aria-label="صفحهٔ بعد"
            href={catalogURL(path, params, { page: String(page + 1) })}
            onNavigate={(event) => {
              event.preventDefault();
              if (!pending) navigate(catalogURL(path, params, { page: String(page + 1) }));
            }}
          >
            <ArrowLeft size={19} />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled aria-label="صفحهٔ بعد">
          <ArrowLeft size={19} />
        </Button>
      )}
    </nav>
  );
}
