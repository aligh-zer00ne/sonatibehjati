import { Skeleton } from '@/components/ui/skeleton';
export default function CatalogSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="در حال دریافت محصولات"
      className="grid h-full grid-cols-2 gap-x-3 gap-y-4 min-[480px]:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-[19px] border border-border bg-card p-2 lg:p-3">
          <Skeleton className="aspect-square rounded-[14px]" />
          <Skeleton className="mx-auto mt-4 h-4 w-3/4" />
          <Skeleton className="mx-auto my-3 h-3 w-1/3" />
          <Skeleton className="mx-auto my-3 h-4 w-1/2" />
          <Skeleton className="h-11 rounded-full" />
        </div>
      ))}
    </div>
  );
}
