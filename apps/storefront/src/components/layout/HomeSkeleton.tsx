import { Skeleton } from '@/components/ui/skeleton';
export default function HomeSkeleton() {
  return (
    <main
      className="mx-auto w-full max-w-[1200px] px-4 min-[480px]:px-6 xl:px-0 pt-4"
      aria-label="در حال بارگذاری"
      aria-busy="true"
    >
      <Skeleton className="my-4 h-[120px]" />
      <Skeleton className="mb-[30px] h-[600px]" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((id) => (
          <Skeleton className="h-[280px]" key={id} />
        ))}
      </div>
    </main>
  );
}
