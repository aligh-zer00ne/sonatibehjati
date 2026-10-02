import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
export default function Breadcrumbs({ items }: { items: { title: string; href?: string }[] }) {
  return (
    <nav aria-label="مسیر صفحه" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {[{ title: 'خانه', href: '/' }, ...items].map((item, index) => (
          <li key={`${index}-${item.title}`} className="flex items-center gap-1.5">
            {index > 0 && <ChevronLeft aria-hidden="true" size={14} />}
            {item.href ? (
              <Link
                className="inline-flex min-h-11 items-center transition-colors hover:text-primary motion-reduce:transition-none"
                href={item.href}
              >
                {item.title}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.title}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
