import type { LucideIcon } from "lucide-react";

// One header for every list page so the title, its icon, and the primary
// action sit in the same place everywhere. Actions that expand into a
// full-width form (w-full) wrap onto their own row underneath.
export function PageHeader({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <h1 className="flex items-center gap-2 text-[28px] font-semibold tracking-tight text-neutral-900">
        {Icon && <Icon size={26} strokeWidth={2} />} {title}
      </h1>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}
