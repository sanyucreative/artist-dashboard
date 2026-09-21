import Link from "next/link";
import type { LucideIcon } from "lucide-react";

// Widget header: icon, title, and an optional "See all" pill on the right.
export function WidgetTitle({
  icon: Icon,
  children,
  seeAll,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  seeAll?: string;
}) {
  return (
    <div className="flex min-h-8 min-w-0 flex-1 items-center gap-2">
      <Icon size={16} strokeWidth={2} className="shrink-0 text-neutral-600" />
      <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-neutral-900">{children}</h2>
      {seeAll && (
        <Link
          href={seeAll}
          className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
        >
          See all
        </Link>
      )}
    </div>
  );
}
