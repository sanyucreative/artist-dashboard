import Link from "next/link";
import { X } from "lucide-react";

// Shown on a list page when it has been narrowed by the global search.
export function SearchClear({ q, href }: { q: string; href: string }) {
  return (
    <p className="mb-4 flex items-center gap-2 text-sm text-neutral-600">
      Showing results for <span className="font-medium text-neutral-900">&ldquo;{q}&rdquo;</span>
      <Link href={href} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium hover:bg-neutral-200">
        <X size={12} strokeWidth={2} /> Clear
      </Link>
    </p>
  );
}
