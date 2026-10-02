'use client';
import type { ReactNode } from 'react';
import { useCommerceNavigation } from './CommerceNavigation';
import CatalogSkeleton from './CatalogSkeleton';
export default function CatalogResults({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const { pending } = useCommerceNavigation();
  return (
    <div className="relative" aria-busy={pending}>
      <div inert={pending} className={pending ? 'opacity-0' : undefined}>
        {children}
      </div>
      {pending && (
        <div className="absolute inset-0">
          <CatalogSkeleton count={count || 4} />
        </div>
      )}
    </div>
  );
}
