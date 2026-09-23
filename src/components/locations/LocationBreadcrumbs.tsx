import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function LocationBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <li>
          <Link href="/" className="inline-flex items-center gap-1 hover:text-teal-700">
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
        </li>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              {last || !item.href ? (
                <span aria-current={last ? "page" : undefined} className="font-medium text-slate-700">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-teal-700">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}